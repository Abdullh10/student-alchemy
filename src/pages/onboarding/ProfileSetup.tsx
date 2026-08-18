import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar } from "@/lib/avatarUpload";
import { DEFAULT_GRADE_CRITERIA, DEFAULT_NOTE_TYPES } from "@/lib/grading";
import { DEFAULT_BADGES } from "@/lib/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { GraduationCap, Loader2, X } from "lucide-react";

export default function ProfileSetup() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [school, setSchool] = useState("");
  const [educationAdmin, setEducationAdmin] = useState("");
  const [stage, setStage] = useState("");
  const [schoolYear, setSchoolYear] = useState(defaultSchoolYear());
  const [semester, setSemester] = useState("الفصل الدراسي الأول");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const addSubject = () => {
    const v = subjectInput.trim();
    if (v && !subjects.includes(v)) setSubjects((s) => [...s, v]);
    setSubjectInput("");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl: string | null = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, user.id, "profile");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          specialization,
          school,
          education_admin: educationAdmin,
          stage,
          subjects,
          school_year: schoolYear,
          semester,
          avatar_url: avatarUrl,
          onboarding_completed: true,
        })
        .eq("id", user.id);
      if (error) throw error;

      await seedDefaultsForTeacher(user.id);
      await refreshProfile();
      toast.success("تم إعداد ملفك الشخصي بنجاح");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-10">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">إعداد الملف الشخصي للمعلم</CardTitle>
          <CardDescription>أدخل بياناتك لتخصيص كشف المتابعة الخاص بك (يمكنك تعديلها لاحقًا)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatarPreview ?? undefined} />
                <AvatarFallback>{(fullName || "م").slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1.5">
                <Label htmlFor="avatar">الصورة الشخصية (اختياري)</Label>
                <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="max-w-xs" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">اسم المعلم</Label>
                <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="specialization">التخصص</Label>
                <Input id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="مثال: رياضيات" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="school">المدرسة</Label>
                <Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="educationAdmin">الإدارة التعليمية</Label>
                <Input id="educationAdmin" value={educationAdmin} onChange={(e) => setEducationAdmin(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stage">المرحلة الدراسية</Label>
                <Input id="stage" value={stage} onChange={(e) => setStage(e.target.value)} placeholder="مثال: المتوسطة" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schoolYear">العام الدراسي</Label>
                <Input id="schoolYear" value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="semester">الفصل الدراسي</Label>
                <Input id="semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subjects">المواد التي تدرسها</Label>
              <div className="flex gap-2">
                <Input
                  id="subjects"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubject();
                    }
                  }}
                  placeholder="اكتب اسم المادة ثم Enter"
                />
                <Button type="button" variant="secondary" onClick={addSubject}>إضافة</Button>
              </div>
              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {subjects.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1">
                      {s}
                      <button type="button" onClick={() => setSubjects((arr) => arr.filter((x) => x !== s))}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حفظ ومتابعة
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function defaultSchoolYear() {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}هـ`;
}

/** Seeds a sensible default grading system (criteria, note types, badges) for a brand new teacher. */
async function seedDefaultsForTeacher(teacherId: string) {
  const { data: existingCriteria } = await supabase.from("grade_criteria").select("id").eq("teacher_id", teacherId).limit(1);
  if (existingCriteria && existingCriteria.length > 0) return;

  const { data: insertedCriteria, error: criteriaError } = await supabase
    .from("grade_criteria")
    .insert(DEFAULT_GRADE_CRITERIA.map((c) => ({ ...c, teacher_id: teacherId, class_id: null })))
    .select();
  if (criteriaError || !insertedCriteria) return;

  const criteriaByName = new Map(insertedCriteria.map((c) => [c.name, c.id]));

  await supabase.from("note_types").insert(
    DEFAULT_NOTE_TYPES.map((nt, idx) => ({
      teacher_id: teacherId,
      criteria_id: criteriaByName.get(nt.criteriaName) ?? null,
      category: nt.category,
      name: nt.name,
      default_points: nt.default_points,
      is_positive: nt.is_positive,
      icon: nt.icon,
      color: nt.color,
      sort_order: idx,
    }))
  );

  await supabase.from("badges").insert(DEFAULT_BADGES.map((b) => ({ ...b, teacher_id: teacherId })));
}
