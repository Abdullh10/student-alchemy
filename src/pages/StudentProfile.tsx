import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, MessageSquarePlus, Pencil, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useClasses } from "@/hooks/useClasses";
import { useGradeSummaries } from "@/hooks/useGradeSummaries";
import { useDeleteNote } from "@/hooks/useNotes";
import { useStudentBadges } from "@/hooks/useBadges";
import { StudentFormDialog } from "@/components/students/StudentFormDialog";
import { QuickNoteDialog } from "@/components/students/QuickNoteDialog";

export default function StudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { data: classes = [] } = useClasses();
  const { students, notesByStudent, summaries, isLoading } = useGradeSummaries();
  const { data: badges = [] } = useStudentBadges(studentId);
  const deleteNote = useDeleteNote();

  const [formOpen, setFormOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const student = students.find((s) => s.id === studentId);
  const summary = studentId ? summaries.get(studentId) : undefined;
  const notes = useMemo(
    () => [...(notesByStudent.get(studentId ?? "") ?? [])].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()),
    [notesByStudent, studentId]
  );
  const classRoom = classes.find((c) => c.id === student?.class_id);

  const trendData = useMemo(() => {
    const sorted = [...notes].sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());
    let cumulative = 0;
    return sorted.map((n) => {
      cumulative += n.points;
      return { date: format(new Date(n.occurred_at), "d/M"), النقاط: cumulative };
    });
  }, [notes]);

  if (!isLoading && !student) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">لم يتم العثور على الطالب</p>
        <Button variant="outline" onClick={() => navigate("/classes")}><ArrowRight className="w-4 h-4 ml-1" /> العودة</Button>
      </div>
    );
  }
  if (!student) return null;

  const pct = summary && summary.finalMax > 0 ? Math.round((summary.finalScore / summary.finalMax) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={student.avatar_url ?? undefined} />
            <AvatarFallback className="text-xl">{student.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            {classRoom && (
              <Link to={`/classes/${classRoom.id}`} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1">
                <ArrowRight className="w-3.5 h-3.5" /> {classRoom.name}
              </Link>
            )}
            <h1 className="text-xl font-bold text-foreground">{student.name}</h1>
            <p className="text-sm text-muted-foreground">{classRoom?.grade_level || ""} {student.student_number ? `· رقم ${student.student_number}` : ""}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}><Pencil className="w-4 h-4 ml-1" /> تعديل</Button>
          <Button size="sm" onClick={() => setNoteOpen(true)}><MessageSquarePlus className="w-4 h-4 ml-1" /> ملاحظة جديدة</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="الدرجة الأكاديمية" score={summary?.academicScore ?? 0} max={summary?.academicMax ?? 0} tone="info" />
        <SummaryCard label="الدرجة السلوكية" score={summary?.behaviorScore ?? 0} max={summary?.behaviorMax ?? 0} tone="warning" />
        <SummaryCard label="الدرجة النهائية" score={summary?.finalScore ?? 0} max={summary?.finalMax ?? 0} tone="success" highlight />
        <Card className="stat-card gradient-card-danger">
          <p className="text-xs font-medium text-muted-foreground mb-1">مجموع النقاط الخام</p>
          <p className="text-2xl font-bold text-foreground">{summary?.totalRaw ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{notes.length} ملاحظة مسجلة</p>
        </Card>
      </div>

      {badges.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">الشارات المكتسبة</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {badges.map((sb) => (
              <div key={sb.id} className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm" style={{ borderColor: sb.badge.color + "55", background: sb.badge.color + "15" }}>
                <span className="text-lg">{sb.badge.icon}</span>
                <span className="font-medium">{sb.badge.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> تطور مستوى الطالب</CardTitle></CardHeader>
        <CardContent>
          {trendData.length < 2 ? (
            <p className="text-sm text-muted-foreground text-center py-10">سجّل المزيد من الملاحظات لعرض منحنى التطور</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ direction: "rtl", fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="النقاط" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">سجل الملاحظات</CardTitle></CardHeader>
        <CardContent className="p-0">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">لا توجد ملاحظات مسجلة بعد</p>
          ) : (
            <div className="divide-y divide-border">
              {notes.map((n) => (
                <div key={n.id} className="flex items-center gap-3 p-3">
                  <span className="text-xl">{n.points >= 0 ? "🟢" : "🔴"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">{n.type_name}</p>
                      <Badge variant="outline" className="text-[10px]">{n.category === "academic" ? "أكاديمي" : "سلوكي"}</Badge>
                    </div>
                    {n.comment && <p className="text-xs text-muted-foreground mt-0.5">{n.comment}</p>}
                    <p className="text-[11px] text-muted-foreground mt-0.5">{format(new Date(n.occurred_at), "EEEE d MMMM yyyy, HH:mm", { locale: ar })}</p>
                  </div>
                  <span className={`font-bold text-sm ${n.points >= 0 ? "text-success" : "text-destructive"}`}>{n.points > 0 ? "+" : ""}{n.points}</span>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => deleteNote.mutate(n.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <StudentFormDialog open={formOpen} onOpenChange={setFormOpen} editing={student} />
      <QuickNoteDialog open={noteOpen} onOpenChange={setNoteOpen} student={student} />
    </div>
  );
}

function SummaryCard({ label, score, max, tone, highlight }: { label: string; score: number; max: number; tone: "info" | "warning" | "success"; highlight?: boolean }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <Card className={`stat-card gradient-card-${tone} ${highlight ? "ring-1 ring-primary/30" : ""}`}>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">{score}<span className="text-sm text-muted-foreground">/{max}</span></p>
      <Progress value={pct} className="h-1.5 mt-2" />
    </Card>
  );
}
