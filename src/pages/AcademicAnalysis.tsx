import { useStudents } from "@/context/StudentContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

export default function AcademicAnalysis() {
  const { students } = useStudents();

  const testData = students.map(s => ({
    name: s.name.split(" ")[0],
    "اختبار 1": s.testScores[0] || 0,
    "اختبار 2": s.testScores[1] || 0,
    "اختبار 3": s.testScores[2] || 0,
  }));

  const assignmentAvg = students.map(s => ({
    name: s.name.split(" ")[0],
    المتوسط: Math.round(s.assignmentScores.reduce((a, b) => a + b, 0) / (s.assignmentScores.length || 1)),
  }));

  const skillsData = students.map(s => ({
    name: s.name.split(" ")[0],
    حسابات: s.skills.calculations,
    مفاهيم: s.skills.concepts,
    تجارب: s.skills.experiments,
  }));

  const gaps = students.map(s => {
    const weakest = Object.entries(s.skills).sort(([, a], [, b]) => a - b)[0];
    const skillName = weakest[0] === "calculations" ? "الحسابات" : weakest[0] === "concepts" ? "المفاهيم" : "التجارب";
    return { name: s.name, skill: skillName, score: weakest[1] };
  }).filter(g => g.score < 60);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">نتائج الاختبارات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={testData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(195,20%,88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="اختبار 1" fill="hsl(205,80%,70%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="اختبار 2" fill="hsl(174,62%,45%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="اختبار 3" fill="hsl(174,62%,30%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">متوسط درجات الواجبات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={assignmentAvg}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(195,20%,88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="المتوسط" stroke="hsl(174,62%,38%)" strokeWidth={2} dot={{ fill: "hsl(174,62%,38%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">المهارات الكيميائية لكل طالب</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(195,20%,88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="حسابات" fill="hsl(174,62%,38%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="مفاهيم" fill="hsl(40,90%,55%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="تجارب" fill="hsl(205,80%,50%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">الفجوات التعليمية المكتشفة</h3>
        {gaps.length > 0 ? (
          <div className="space-y-3">
            {gaps.map((g, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg gradient-card-danger">
                <div>
                  <p className="text-sm font-medium text-foreground">{g.name}</p>
                  <p className="text-xs text-muted-foreground">أضعف مهارة: {g.skill}</p>
                </div>
                <span className="text-lg font-bold text-danger">{g.score}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">لا توجد فجوات تعليمية حرجة</p>
        )}
      </div>
    </div>
  );
}
