import {
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import StatCard from "@/components/StatCard";
import { students, getAverageScore, getAtRiskStudents, getStudentCategory, getCategoryColor } from "@/data/mockData";

const COLORS = ["hsl(152,60%,40%)", "hsl(205,80%,50%)", "hsl(38,92%,50%)", "hsl(0,72%,55%)"];

export default function Dashboard() {
  const avg = getAverageScore(students);
  const atRisk = getAtRiskStudents(students);
  const improvement = Math.round(
    students.reduce((sum, s) => sum + (s.postScore - s.preScore), 0) / students.length
  );

  const categoryData = [
    { name: "متفوق", value: students.filter(s => getStudentCategory(s) === "متفوق").length },
    { name: "مستقر", value: students.filter(s => getStudentCategory(s) === "مستقر").length },
    { name: "يحتاج متابعة", value: students.filter(s => getStudentCategory(s) === "يحتاج متابعة").length },
    { name: "يحتاج تدخل عاجل", value: students.filter(s => getStudentCategory(s) === "يحتاج تدخل عاجل").length },
  ];

  const comparisonData = students.map(s => ({
    name: s.name.split(" ")[0],
    قبل: s.preScore,
    بعد: s.postScore,
  }));

  const avgSkills = {
    الحسابات: Math.round(students.reduce((s, st) => s + st.skills.calculations, 0) / students.length),
    المفاهيم: Math.round(students.reduce((s, st) => s + st.skills.concepts, 0) / students.length),
    التجارب: Math.round(students.reduce((s, st) => s + st.skills.experiments, 0) / students.length),
  };

  const radarData = Object.entries(avgSkills).map(([key, val]) => ({ subject: key, value: val, fullMark: 100 }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="عدد الطلاب" value={students.length} subtitle="المسجلين في الصف" icon={Users} gradient="gradient-card-info" iconColor="bg-info/10 text-info" />
        <StatCard title="متوسط التحصيل" value={`${avg}%`} subtitle="بعد التدخل" icon={TrendingUp} gradient="gradient-card-success" iconColor="bg-success/10 text-success" />
        <StatCard title="نسبة التحسن" value={`+${improvement}`} subtitle="متوسط نقاط التحسن" icon={Award} gradient="gradient-card-warning" iconColor="bg-warning/10 text-warning" />
        <StatCard title="طلاب معرضون للخطر" value={atRisk.length} subtitle="يحتاجون تدخل فوري" icon={AlertTriangle} gradient="gradient-card-danger" iconColor="bg-danger/10 text-danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison chart */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">مقارنة الدرجات (قبل / بعد)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(195,20%,88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="قبل" fill="hsl(205,80%,70%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="بعد" fill="hsl(174,62%,38%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">تصنيف الطلاب</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">متوسط المهارات الكيميائية</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(195,20%,88%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar dataKey="value" stroke="hsl(174,62%,38%)" fill="hsl(174,62%,38%)" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* At risk list */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">الطلاب المعرضون للخطر</h3>
          <div className="space-y-3">
            {atRisk.map(s => {
              const cat = getStudentCategory(s);
              return (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">الدرجة: {s.postScore}%</p>
                  </div>
                  <span className={`text-xs font-semibold ${getCategoryColor(cat)}`}>{cat}</span>
                </div>
              );
            })}
            {atRisk.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">لا يوجد طلاب معرضون للخطر</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
