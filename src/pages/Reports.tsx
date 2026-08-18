import { useMemo, useState } from "react";
import { FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useClasses } from "@/hooks/useClasses";
import { useGradeSummaries } from "@/hooks/useGradeSummaries";
import { exportRowsToExcel, printReport } from "@/lib/exporters";
import type { NoteCategory } from "@/types/domain";

export default function Reports() {
  const { data: classes = [] } = useClasses();
  const { students, notes, summaries } = useGradeSummaries();

  const [classFilter, setClassFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | NoteCategory>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const classesById = new Map(classes.map((c) => [c.id, c]));

  const filteredStudents = useMemo(
    () => students.filter((s) => classFilter === "all" || s.class_id === classFilter),
    [students, classFilter]
  );

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (classFilter !== "all" && n.class_id !== classFilter) return false;
      if (categoryFilter !== "all" && n.category !== categoryFilter) return false;
      if (from && new Date(n.occurred_at) < new Date(from)) return false;
      if (to && new Date(n.occurred_at) > new Date(`${to}T23:59:59`)) return false;
      return true;
    });
  }, [notes, classFilter, categoryFilter, from, to]);

  const pct = (studentId: string) => {
    const s = summaries.get(studentId);
    if (!s || s.finalMax <= 0) return 0;
    return Math.round((s.finalScore / s.finalMax) * 100);
  };

  const ranked = [...filteredStudents].sort((a, b) => pct(b.id) - pct(a.id));

  const studentsById = new Map(students.map((s) => [s.id, s]));

  const exportClassSheet = () => {
    const rows = filteredStudents.map((s) => {
      const sum = summaries.get(s.id);
      return {
        "الاسم": s.name,
        "الشعبة": classesById.get(s.class_id ?? "")?.name ?? "",
        "أكاديمي": sum ? `${sum.academicScore}/${sum.academicMax}` : "",
        "سلوكي": sum ? `${sum.behaviorScore}/${sum.behaviorMax}` : "",
        "النهائية": sum ? `${sum.finalScore}/${sum.finalMax}` : "",
        "النسبة": `${pct(s.id)}%`,
      };
    });
    if (rows.length) exportRowsToExcel("تقرير_كشف_المتابعة", "الكشف", rows);
  };

  const exportNotes = () => {
    const rows = filteredNotes.map((n) => ({
      "الطالب": studentsById.get(n.student_id)?.name ?? "",
      "النوع": n.type_name,
      "القسم": n.category === "academic" ? "أكاديمي" : "سلوكي",
      "النقاط": n.points,
      "ملاحظة": n.comment ?? "",
      "التاريخ": format(new Date(n.occurred_at), "yyyy-MM-dd HH:mm"),
    }));
    if (rows.length) exportRowsToExcel("تقرير_الملاحظات", "الملاحظات", rows);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">التقارير</h1>
        <p className="text-sm text-muted-foreground mt-1">صدّر أو اطبع تقارير كشف المتابعة والملاحظات</p>
      </div>

      <Card className="print:hidden">
        <CardContent className="p-4 grid sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">الشعبة</Label>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الشعب</SelectItem>
                {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">القسم</Label>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as "all" | NoteCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="academic">أكاديمي</SelectItem>
                <SelectItem value="behavioral">سلوكي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">من تاريخ</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">إلى تاريخ</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sheet">
        <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
          <TabsList>
            <TabsTrigger value="sheet">كشف المتابعة</TabsTrigger>
            <TabsTrigger value="notes">الملاحظات</TabsTrigger>
            <TabsTrigger value="ranking">الأعلى والأدنى</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={printReport}><Printer className="w-4 h-4 ml-1" /> طباعة / PDF</Button>
        </div>

        <TabsContent value="sheet" className="mt-4">
          <Card className="print-area">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between">
                <h2 className="font-bold">كشف المتابعة {classFilter !== "all" ? `— ${classesById.get(classFilter)?.name}` : "— جميع الشعب"}</h2>
                <Button variant="outline" size="sm" onClick={exportClassSheet} className="print:hidden"><FileSpreadsheet className="w-4 h-4 ml-1" /> Excel</Button>
              </div>
              <ReportTable
                rows={filteredStudents.map((s) => {
                  const sum = summaries.get(s.id);
                  return [
                    s.name,
                    classesById.get(s.class_id ?? "")?.name ?? "—",
                    sum ? `${sum.academicScore}/${sum.academicMax}` : "—",
                    sum ? `${sum.behaviorScore}/${sum.behaviorMax}` : "—",
                    sum ? `${sum.finalScore}/${sum.finalMax}` : "—",
                    `${pct(s.id)}%`,
                  ];
                })}
                headers={["الطالب", "الشعبة", "أكاديمي", "سلوكي", "النهائية", "النسبة"]}
                empty="لا يوجد طلاب مطابقون للفلاتر"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card className="print-area">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between">
                <h2 className="font-bold">تقرير الملاحظات ({filteredNotes.length})</h2>
                <Button variant="outline" size="sm" onClick={exportNotes} className="print:hidden"><FileSpreadsheet className="w-4 h-4 ml-1" /> Excel</Button>
              </div>
              <ReportTable
                rows={filteredNotes.map((n) => [
                  studentsById.get(n.student_id)?.name ?? "—",
                  n.type_name,
                  n.category === "academic" ? "أكاديمي" : "سلوكي",
                  n.points > 0 ? `+${n.points}` : `${n.points}`,
                  format(new Date(n.occurred_at), "d MMM yyyy, HH:mm", { locale: ar }),
                ])}
                headers={["الطالب", "الملاحظة", "القسم", "النقاط", "التاريخ"]}
                empty="لا توجد ملاحظات مطابقة للفلاتر"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="mt-4">
          <Card className="print-area">
            <CardContent className="p-0">
              <h2 className="font-bold p-4">ترتيب الطلاب حسب الدرجة النهائية</h2>
              <ReportTable
                rows={ranked.map((s, i) => [
                  `${i + 1}`,
                  s.name,
                  classesById.get(s.class_id ?? "")?.name ?? "—",
                  `${pct(s.id)}%`,
                ])}
                headers={["#", "الطالب", "الشعبة", "النسبة"]}
                empty="لا يوجد طلاب مطابقون للفلاتر"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportTable({ headers, rows, empty }: { headers: string[]; rows: (string | number)[][]; empty: string }) {
  if (rows.length === 0) return <p className="text-center text-muted-foreground py-12">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>{headers.map((h) => <th key={h} className="text-right p-3 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {row.map((cell, j) => <td key={j} className="p-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
