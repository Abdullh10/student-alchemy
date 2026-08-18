import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUpdateProfile } from "@/hooks/useProfile";
import { uploadAvatar } from "@/lib/avatarUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";

export function ProfileEditor() {
  const { user, profile } = useAuth();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [school, setSchool] = useState("");
  const [educationAdmin, setEducationAdmin] = useState("");
  const [stage, setStage] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setSpecialization(profile.specialization ?? "");
    setSchool(profile.school ?? "");
    setEducationAdmin(profile.education_admin ?? "");
    setStage(profile.stage ?? "");
    setSchoolYear(profile.school_year ?? "");
    setSemester(profile.semester ?? "");
    setSubjects(profile.subjects ?? []);
    setAvatarPreview(profile.avatar_url ?? null);
  }, [profile]);

  const addSubject = () => {
    const v = subjectInput.trim();
    if (v && !subjects.includes(v)) setSubjects((s) => [...s, v]);
    setSubjectInput("");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl = profile?.avatar_url ?? null;
      if (avatarFile) avatarUrl = await uploadAvatar(avatarFile, user.id, "profile");
      await updateProfile.mutateAsync({
        full_name: fullName,
        specialization,
        school,
        education_admin: educationAdmin,
        stage,
        school_year: schoolYear,
        semester,
        subjects,
        avatar_url: avatarUrl,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatarPreview ?? undefined} />
            <AvatarFallback>{(fullName || "م").slice(0, 1)}</AvatarFallback>
          </Avatar>
          <Input
            type="file"
            accept="image/*"
            className="max-w-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setAvatarFile(f);
              setAvatarPreview(URL.createObjectURL(f));
            }}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="اسم المعلم" value={fullName} onChange={setFullName} />
          <Field label="التخصص" value={specialization} onChange={setSpecialization} />
          <Field label="المدرسة" value={school} onChange={setSchool} />
          <Field label="الإدارة التعليمية" value={educationAdmin} onChange={setEducationAdmin} />
          <Field label="المرحلة الدراسية" value={stage} onChange={setStage} />
          <Field label="العام الدراسي" value={schoolYear} onChange={setSchoolYear} />
          <Field label="الفصل الدراسي" value={semester} onChange={setSemester} className="sm:col-span-2" />
        </div>

        <div className="space-y-1.5">
          <Label>المواد التي تدرسها</Label>
          <div className="flex gap-2">
            <Input
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }}
              placeholder="اكتب اسم المادة ثم Enter"
            />
            <Button type="button" variant="secondary" onClick={addSubject}>إضافة</Button>
          </div>
          {subjects.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {subjects.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1">
                  {s}
                  <button type="button" onClick={() => setSubjects((arr) => arr.filter((x) => x !== s))}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          حفظ التعديلات
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({ label, value, onChange, className }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
