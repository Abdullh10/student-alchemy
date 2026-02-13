import { useStudents } from "@/context/StudentContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

export default function BehaviorAnalysis() {
  const { students } = useStudents();

  const behaviorData = students.map(s => ({
    name: s.name.split(" ")[0],
    مشاركة: s.positiveBehaviors.participation,
    تعاون: s.positiveBehaviors.cooperation,
    تركيز: s.positiveBehaviors.focus,
  }));

  const negativeBehaviorData = students.map(s => ({
    name: s.name.split(" ")[0],
    تشتيت: s.negativeBehaviors.distraction,
    تأخر: s.negativeBehaviors.tardiness,
    "عدم إنجاز": s.negativeBehaviors.incompletion,
  }));

  const avgPositive = {
    مشاركة: +(students.reduce((s, st) => s + st.positiveBehaviors.participation, 0) / (students.length || 1)).toFixed(1),
    تعاون: +(students.reduce((s, st) => s + st.positiveBehaviors.cooperation, 0) / (students.length || 1)).toFixed(1),
    تركيز: +(students.reduce((s, st) => s + st.positiveBehaviors.focus, 0) / (students.length || 1)).toFixed(1),
  };

  const radarData = Object.entries(avgPositive).map(([key, val]) => ({
    subject: key, value: val, fullMark: 5,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(avgPositive).map(([key, val]) => (
          <div key={key} className="glass-card rounded-xl p-5 text-center animate-fade-in">
            <p className="text-xs text-muted-foreground mb-1">متوسط {key}</p>
            <p className="text-3xl font-bold text-primary">{val}</p>
            <p className="text-xs text-muted-foreground mt-1">من 5</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">السلوكيات الإيجابية</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={behaviorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(195,20%,88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="مشاركة" fill="hsl(174,62%,38%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="تعاون" fill="hsl(152,60%,40%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="تركيز" fill="hsl(205,80%,50%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">السلوكيات السلبية</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={negativeBehaviorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(195,20%,88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="تشتيت" fill="hsl(0,72%,55%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="تأخر" fill="hsl(38,92%,50%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="عدم إنجاز" fill="hsl(25,80%,55%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">متوسط السلوك الإيجابي للصف</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(195,20%,88%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13 }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Radar dataKey="value" stroke="hsl(174,62%,38%)" fill="hsl(174,62%,38%)" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">التصنيف السلوكي التلقائي</h3>
        <div className="space-y-3">
          {students.map(s => {
            const behaviorAvg = (s.positiveBehaviors.participation + s.positiveBehaviors.cooperation + s.positiveBehaviors.focus) / 3;
            const negAvg = (s.negativeBehaviors.distraction + s.negativeBehaviors.tardiness + s.negativeBehaviors.incompletion) / 3;
            const label = behaviorAvg >= 4 && negAvg <= 1 ? "ممتاز" : behaviorAvg >= 3 && negAvg <= 2 ? "جيد" : negAvg >= 3 ? "يحتاج تدخل" : "مقبول";
            const color = label === "ممتاز" ? "text-success" : label === "جيد" ? "text-info" : label === "يحتاج تدخل" ? "text-danger" : "text-warning";
            return (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium text-foreground">{s.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">إيجابي: {behaviorAvg.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">سلبي: {negAvg.toFixed(1)}</span>
                  <span className={`text-xs font-bold ${color}`}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
