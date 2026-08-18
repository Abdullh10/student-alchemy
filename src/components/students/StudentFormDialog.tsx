import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useClasses } from "@/hooks/useClasses";
import { useCreateStudent, useUpdateStudent } from "@/hooks/useStudents";
import { uploadAvatar } from "@/lib/avatarUpload";
import type { Student } from "@/types/domain";
import { Loader2 } from "lucide-react";

export function StudentFormDialog({
  open,
  onOpenChange,
  editing,
  defaultClassId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Student | null;
  defaultClassId?: string | null;
}) {
  const { user } = useAuth();
  const { data: classes = [] } = useClasses();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [classId, setClassId] = useState<string>("none");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setStudentNumber(editing?.student_number ?? "");
      setClassId(editing?.class_id ?? defaultClassId ?? "none");
      setAvatarFile(null);
      setAvatarPreview(editing?.avatar_url ?? null);
    }
  }, [open, editing, defaultClassId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl = editing?.avatar_url ?? null;
      if (avatarFile) avatarUrl = await uploadAvatar(avatarFile, user.id, "student");

      const payload = {
        name,
        student_number: studentNumber || null,
        class_id: classId === "none" ? null : classId,
        avatar_url: avatarUrl,
      };

      if (editing) {
        await updateStudent.mutateAsync({ id: editing.id, updates: payload });
      } else {
        await createStudent.mutateAsync(payload);
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل بيانات الطالب" : "إضافة طالب"}</DialogTitle>
          <DialogDescription>{editing ? "يمكنك تعديل الاسم والشعبة والصورة" : "أدخل بيانات الطالب الجديد"}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src={avatarPreview ?? undefined} />
              <AvatarFallback>{(name || "ط").slice(0, 1)}</AvatarFallback>
            </Avatar>
            <Input
              type="file"
              accept="image/*"
              className="max-w-xs"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAvatarFile(file);
                setAvatarPreview(URL.createObjectURL(file));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sname">اسم الطالب</Label>
            <Input id="sname" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="snumber">رقم الطالب (اختياري)</Label>
              <Input id="snumber" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>الشعبة</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون شعبة</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving} className="w-full">
              {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              {editing ? "حفظ التعديلات" : "إضافة الطالب"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
