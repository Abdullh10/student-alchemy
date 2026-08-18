import { Link } from "react-router-dom";
import { Users, BookOpen, GraduationCap, HeartPulse, TrendingUp, TrendingDown, Clock } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useClasses } from "@/hooks/useClasses";
import { useGradeSummaries } from "@/hooks/useGradeSummaries";
import { useAuth } from "@/context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Dashboard() {
  const { profile } = useAuth();
  const { data: classes = [] } = useClasses();
  const { students, summaries, notes, isLoading } = useGradeSummaries();

  const studentsById = new Map(students.map((s) => [s.id, s]));
  const classesById = new Map(classes.map((c) => [c.id, c]));

  const pct = (studentId: string) => {
    const s = summaries.get(studentId);
    if (!s || s.finalMax <= 0) return 0;
    return Math.round((s.finalScore / s.finalMax) * 100);
  };

  const avgAcademicPct = average(students.map((s) => {
    const sum = summaries.get(s.id);
    return sum && sum.academicMax > 0 ? (sum.academicScore / sum.academicMax) * 100 : null;
  }));
  const avgBehaviorPct = average(students.map((s) => {
    const sum = summaries.get(s.id);
    return sum && sum.behaviorMax > 0 ? (sum.behaviorScore / sum.behaviorMax) * 100 : null;
  }));

  const ranked = [...students].sort((a, b) => pct(b.id) - pct(a.id));
  const topStudents = ranked.filter((s) => pct(s.id) > 0).slice(0, 5);
  const atRiskStudents = ranked.filter((s) => pct(s.id) < 60).slice(-5).reverse();

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .slice(0, 8);

  const classChartData = classes.map((c) => {
    const classStudents = students.filter((s) => s.class_id === c.id);
    const avg = average(classStudents.map((s) => pct(s.id)));
    return { name: c.name, متوسط: Math.round(avg ?? 0) };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          مرحبًا، {profile?.full_name || "أستاذ"} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">نظرة عامة على أداء طلابك اليوم</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="عدد الطلاب" value={students.length} icon={Users} gradient="gradient-card-info" iconColor="bg-info/15 text-info" />
        <StatCard title="عدد الشعب" value={classes.length} icon={BookOpen} gradient="gradient-card-success" iconColor="bg-success/15 text-success" />
        <StatCard title="متوسط الأكاديمي" value={`${Math.round(avgAcademicPct ?? 0)}%`} icon={GraduationCap} gradient="gradient-card-warning" iconColor="bg-warning/15 text-warning" />
        <StatCard title="متوسط السلوك" value={`${Math.round(avgBehaviorPct ?? 0)}%`} icon={HeartPulse} gradient="gradient-card-danger" iconColor="bg-danger/15 text-danger" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">متوسط أداء الشعب</CardTitle>
          </CardHeader>
          <CardContent>
            {classChartData.length === 0 ? (
              <EmptyHint text="أضف شعبة وطلابًا لعرض الإحصائيات" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ direction: "rtl", fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="متوسط" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> آخر الملاحظات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {recentNotes.length === 0 && <EmptyHint text="لا توجد ملاحظات مسجلة بعد" />}
            {recentNotes.map((n) => {
              const s = studentsById.get(n.student_id);
              return (
                <Link key={n.id} to={`/students/${n.student_id}`} className="flex items-center gap-2 text-xs hover:bg-muted/50 rounded-lg p-1.5 -m-1.5 transition-colors">
                  <span className="text-lg leading-none">{n.points >= 0 ? "🟢" : "🔴"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{s?.name ?? "طالب"}</p>
                    <p className="text-muted-foreground truncate">{n.type_name} · {format(new Date(n.occurred_at), "d MMM, HH:mm", { locale: ar })}</p>
                  </div>
                  <span className={n.points >= 0 ? "text-success font-bold" : "text-destructive font-bold"}>
                    {n.points > 0 ? "+" : ""}{n.points}
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-success">
              <TrendingUp className="w-4 h-4" /> الطلاب المتميزون
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topStudents.length === 0 && <EmptyHint text="لا توجد بيانات كافية بعد" />}
            {topStudents.map((s) => (
              <StudentRow key={s.id} name={s.name} avatar={s.avatar_url} className={classesById.get(s.class_id ?? "")?.name} pct={pct(s.id)} id={s.id} tone="success" />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <TrendingDown className="w-4 h-4" /> يحتاجون إلى متابعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {atRiskStudents.length === 0 && <EmptyHint text="لا يوجد طلاب بحاجة لمتابعة حاليًا 🎉" />}
            {atRiskStudents.map((s) => (
              <StudentRow key={s.id} name={s.name} avatar={s.avatar_url} className={classesById.get(s.class_id ?? "")?.name} pct={pct(s.id)} id={s.id} tone="danger" />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ملخص أداء الشعب</CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <EmptyHint text="لم تُنشئ أي شعبة بعد" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {classes.map((c) => {
                const classStudents = students.filter((s) => s.class_id === c.id);
                const avg = Math.round(average(classStudents.map((s) => pct(s.id))) ?? 0);
                return (
                  <Link key={c.id} to={`/classes/${c.id}`} className="rounded-xl border border-border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm text-foreground">{c.name}</p>
                      <Badge variant={avg >= 70 ? "default" : avg >= 50 ? "secondary" : "destructive"}>{avg}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{classStudents.length} طالب · {c.grade_level || "—"}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudentRow({ id, name, avatar, className, pct, tone }: { id: string; name: string; avatar?: string | null; className?: string; pct: number; tone: "success" | "danger" }) {
  return (
    <Link to={`/students/${id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="w-9 h-9">
        <AvatarImage src={avatar ?? undefined} />
        <AvatarFallback className="text-xs">{name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{className || "بدون شعبة"}</p>
      </div>
      <span className={`text-sm font-bold ${tone === "success" ? "text-success" : "text-destructive"}`}>{pct}%</span>
    </Link>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground text-center py-8">{text}</p>;
}

function average(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n !== null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}
