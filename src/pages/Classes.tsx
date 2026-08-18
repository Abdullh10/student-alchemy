import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, MoreVertical, Pencil, Trash2, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import type { ClassRoom } from "@/types/domain";

export default function Classes() {
  const { data: classes = [], isLoading } = useClasses();
  const { data: students = [] } = useStudents();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClassRoom | null>(null);

  const studentCount = (classId: string) => students.filter((s) => s.class_id === classId).length;

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (c: ClassRoom) => {
    setEditing(c);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">الشعب والطلاب</h1>
          <p className="text-sm text-muted-foreground mt-1">أنشئ شعبك الدراسية وأضف طلابك</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 ml-1" /> شعبة جديدة
        </Button>
      </div>

      {!isLoading && classes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">لم تُنشئ أي شعبة بعد</p>
            <Button onClick={openCreate}><Plus className="w-4 h-4 ml-1" /> إنشاء أول شعبة</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Link to={`/classes/${c.id}`} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.subject || "بدون مادة"}</p>
                  </div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-7 h-7 -m-1"><MoreVertical className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => openEdit(c)}>
                      <Pencil className="w-4 h-4 ml-2" /> تعديل
                    </DropdownMenuItem>
                    <DeleteClassItem classRoom={c} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Link to={`/classes/${c.id}`} className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {studentCount(c.id)} طالب</span>
                <span>{c.grade_level || "—"}</span>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <ClassDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
    </div>
  );
}

function DeleteClassItem({ classRoom }: { classRoom: ClassRoom }) {
  const deleteClass = useDeleteClass();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
          <Trash2 className="w-4 h-4 ml-2" /> حذف
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف الشعبة "{classRoom.name}"؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم إلغاء ربط جميع طلاب هذه الشعبة (لن يُحذفوا). لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteClass.mutate(classRoom.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ClassDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: ClassRoom | null }) {
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");

  const reset = (c: ClassRoom | null) => {
    setName(c?.name ?? "");
    setGradeLevel(c?.grade_level ?? "");
    setSubject(c?.subject ?? "");
    setSchoolYear(c?.school_year ?? "");
    setSemester(c?.semester ?? "");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (v) reset(editing);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل الشعبة" : "شعبة جديدة"}</DialogTitle>
          <DialogDescription>حدد اسم الشعبة والصف والمادة</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = { name, grade_level: gradeLevel, subject, school_year: schoolYear, semester };
            if (editing) {
              await updateClass.mutateAsync({ id: editing.id, updates: payload });
            } else {
              await createClass.mutateAsync(payload);
            }
            onOpenChange(false);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="cname">اسم الشعبة</Label>
            <Input id="cname" required value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: الأول ثانوي / 2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cgrade">الصف</Label>
              <Input id="cgrade" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="csubject">المادة</Label>
              <Input id="csubject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cyear">العام الدراسي</Label>
              <Input id="cyear" value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="csemester">الفصل الدراسي</Label>
              <Input id="csemester" value={semester} onChange={(e) => setSemester(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createClass.isPending || updateClass.isPending}>
              {editing ? "حفظ التعديلات" : "إنشاء الشعبة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
