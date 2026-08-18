import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Plus, Upload, Search, MoreVertical, Pencil, Trash2, ArrowRightLeft, MessageSquarePlus,
  FileSpreadsheet, Printer, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClasses } from "@/hooks/useClasses";
import { useDeleteStudent, useUpdateStudent } from "@/hooks/useStudents";
import { useGradeSummaries } from "@/hooks/useGradeSummaries";
import { StudentFormDialog } from "@/components/students/StudentFormDialog";
import { ImportStudentsDialog } from "@/components/students/ImportStudentsDialog";
import { QuickNoteDialog } from "@/components/students/QuickNoteDialog";
import { exportRowsToExcel, printReport } from "@/lib/exporters";
import type { Student } from "@/types/domain";

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { data: classes = [] } = useClasses();
  const { students: allStudents, summaries, isLoading } = useGradeSummaries();
  const deleteStudent = useDeleteStudent();
  const updateStudent = useUpdateStudent();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  const classRoom = classes.find((c) => c.id === classId);
  const students = useMemo(
    () => allStudents.filter((s) => s.class_id === classId && s.name.includes(search)),
    [allStudents, classId, search]
  );

  if (!isLoading && !classRoom) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">لم يتم العثور على الشعبة</p>
        <Button variant="outline" onClick={() => navigate("/classes")}>
          <ArrowRight className="w-4 h-4 ml-1" /> العودة للشعب
        </Button>
      </div>
    );
  }

  const openAddNote = (s: Student) => { setActiveStudent(s); setNoteOpen(true); };
  const openEdit = (s: Student) => { setActiveStudent(s); setFormOpen(true); };

  const handleExport = () => {
    const rows = students.map((s) => {
      const sum = summaries.get(s.id);
      return {
        "الاسم": s.name,
        "الرقم": s.student_number ?? "",
        "الدرجة الأكاديمية": sum ? `${sum.academicScore}/${sum.academicMax}` : "",
        "الدرجة السلوكية": sum ? `${sum.behaviorScore}/${sum.behaviorMax}` : "",
        "الدرجة النهائية": sum ? `${sum.finalScore}/${sum.finalMax}` : "",
        "النسبة": sum && sum.finalMax > 0 ? `${Math.round((sum.finalScore / sum.finalMax) * 100)}%` : "",
      };
    });
    if (rows.length === 0) return;
    exportRowsToExcel(`كشف_متابعة_${classRoom?.name ?? ""}`, "كشف المتابعة", rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <Link to="/classes" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1">
            <ArrowRight className="w-3.5 h-3.5" /> الشعب
          </Link>
          <h1 className="text-xl font-bold text-foreground">{classRoom?.name}</h1>
          <p className="text-sm text-muted-foreground">{classRoom?.grade_level} · {classRoom?.subject} · {students.length} طالب</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><FileSpreadsheet className="w-4 h-4 ml-1" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={printReport}><Printer className="w-4 h-4 ml-1" /> طباعة</Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Upload className="w-4 h-4 ml-1" /> استيراد</Button>
          <Button size="sm" onClick={() => { setActiveStudent(null); setFormOpen(true); }}><Plus className="w-4 h-4 ml-1" /> إضافة طالب</Button>
        </div>
      </div>

      <div className="relative print:hidden">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pr-9 max-w-xs" placeholder="بحث عن طالب..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="print-area">
        <CardContent className="p-0">
          <h2 className="hidden print:block text-lg font-bold p-4">كشف متابعة — {classRoom?.name}</h2>
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              {allStudents.filter((s) => s.class_id === classId).length === 0 ? "لا يوجد طلاب في هذه الشعبة بعد" : "لا توجد نتائج مطابقة للبحث"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="text-right p-3 font-medium">الطالب</th>
                    <th className="text-center p-3 font-medium">أكاديمي</th>
                    <th className="text-center p-3 font-medium">سلوكي</th>
                    <th className="text-center p-3 font-medium">الدرجة النهائية</th>
                    <th className="text-center p-3 font-medium print:hidden">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const sum = summaries.get(s.id);
                    const pct = sum && sum.finalMax > 0 ? Math.round((sum.finalScore / sum.finalMax) * 100) : 0;
                    return (
                      <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-3">
                          <Link to={`/students/${s.id}`} className="flex items-center gap-2.5 min-w-[140px]">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={s.avatar_url ?? undefined} />
                              <AvatarFallback className="text-xs">{s.name.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{s.name}</p>
                              {s.student_number && <p className="text-xs text-muted-foreground">#{s.student_number}</p>}
                            </div>
                          </Link>
                        </td>
                        <td className="p-3 text-center text-xs">{sum ? `${sum.academicScore}/${sum.academicMax}` : "—"}</td>
                        <td className="p-3 text-center text-xs">{sum ? `${sum.behaviorScore}/${sum.behaviorMax}` : "—"}</td>
                        <td className="p-3 text-center">
                          <Badge variant={pct >= 70 ? "default" : pct >= 50 ? "secondary" : "destructive"}>
                            {sum ? `${sum.finalScore}/${sum.finalMax}` : "—"} ({pct}%)
                          </Badge>
                        </td>
                        <td className="p-3 print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            <Button size="sm" variant="secondary" onClick={() => openAddNote(s)} className="h-7 text-xs">
                              <MessageSquarePlus className="w-3.5 h-3.5 ml-1" /> ملاحظة
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-7 h-7"><MoreVertical className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onSelect={() => openEdit(s)}>
                                  <Pencil className="w-4 h-4 ml-2" /> تعديل البيانات
                                </DropdownMenuItem>
                                <div className="px-2 py-1.5">
                                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><ArrowRightLeft className="w-3 h-3" /> نقل إلى شعبة</p>
                                  <Select value={s.class_id ?? "none"} onValueChange={(v) => updateStudent.mutate({ id: s.id, updates: { class_id: v === "none" ? null : v } })}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">بدون شعبة</SelectItem>
                                      {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                      <Trash2 className="w-4 h-4 ml-2" /> حذف الطالب
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>حذف الطالب "{s.name}"؟</AlertDialogTitle>
                                      <AlertDialogDescription>سيتم حذف جميع ملاحظاته وسجلاته نهائيًا. لا يمكن التراجع.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteStudent.mutate(s.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <StudentFormDialog open={formOpen} onOpenChange={setFormOpen} editing={activeStudent} defaultClassId={classId ?? null} />
      <ImportStudentsDialog open={importOpen} onOpenChange={setImportOpen} classId={classId ?? ""} />
      <QuickNoteDialog open={noteOpen} onOpenChange={setNoteOpen} student={activeStudent} />
    </div>
  );
}
