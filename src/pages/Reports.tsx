import { useState } from "react";
import { useStudents } from "@/context/StudentContext";
import { getStudentCategory, getCategoryColor, getBehaviorRecommendations, getAcademicRecommendations } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, Users as UsersIcon } from "lucide-react";

export default function Reports() {
  const { students } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<string | "all">("all");

  const comparisonData = students.map(s => ({
    name: s.name.split(" ")[0],
    قبل: s.preScore,
    بعد: s.postScore,
    تحسن: s.postScore - s.preScore,
  }));

  const selected = students.find(s => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-foreground">اختر نوع التقرير:</label>
        <select
          value={selectedStudent}
          onChange={e => setSelectedStudent(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring"
        >
          <option value="all">تقرير الصف الكامل</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>تقرير: {s.name}</option>
          ))}
        </select>
      </div>

      {selectedStudent === "all" ? (
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <UsersIcon className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">تقرير الصف الكامل</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-center">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xl font-bold text-foreground">{students.length}</p>
                <p className="text-xs text-muted-foreground">عدد الطلاب</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xl font-bold text-success">{students.length ? Math.round(students.reduce((s, st) => s + st.postScore, 0) / students.length) : 0}%</p>
                <p className="text-xs text-muted-foreground">متوسط التحصيل</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xl font-bold text-info">{students.filter(s => getStudentCategory(s) === "متفوق").length}</p>
                <p className="text-xs text-muted-foreground">متفوقون</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xl font-bold text-danger">{students.filter(s => getStudentCategory(s) === "يحتاج تدخل عاجل").length}</p>
                <p className="text-xs text-muted-foreground">يحتاجون تدخل</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(195,20%,88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="قبل" fill="hsl(205,80%,70%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="بعد" fill="hsl(174,62%,38%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : selected ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">تقرير فردي: {selected.name}</h3>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-muted-foreground">التصنيف:</span>
              <span className={`text-sm font-bold ${getCategoryColor(getStudentCategory(selected))}`}>
                {getStudentCategory(selected)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-center">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xl font-bold text-muted-foreground">{selected.preScore}%</p>
                <p className="text-xs text-muted-foreground">قبل</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xl font-bold text-primary">{selected.postScore}%</p>
                <p className="text-xs text-muted-foreground">بعد</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className={`text-xl font-bold ${selected.postScore - selected.preScore > 0 ? "text-success" : "text-danger"}`}>
                  {selected.postScore - selected.preScore > 0 ? "+" : ""}{selected.postScore - selected.preScore}
                </p>
                <p className="text-xs text-muted-foreground">التحسن</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xl font-bold text-foreground">{selected.interactionLevel}/5</p>
                <p className="text-xs text-muted-foreground">التفاعل</p>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-foreground mb-2">المهارات الكيميائية:</h4>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {Object.entries(selected.skills).map(([key, val]) => {
                const label = key === "calculations" ? "الحسابات" : key === "concepts" ? "المفاهيم" : "التجارب";
                const color = val >= 70 ? "bg-success" : val >= 50 ? "bg-warning" : "bg-danger";
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{val}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <h4 className="text-xs font-semibold text-foreground mb-2">السلوك:</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4 text-center text-xs">
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="font-bold text-success">{selected.positiveBehaviors.participation}</p>
                <p className="text-muted-foreground">مشاركة</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="font-bold text-success">{selected.positiveBehaviors.cooperation}</p>
                <p className="text-muted-foreground">تعاون</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="font-bold text-success">{selected.positiveBehaviors.focus}</p>
                <p className="text-muted-foreground">تركيز</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="font-bold text-danger">{selected.negativeBehaviors.distraction}</p>
                <p className="text-muted-foreground">تشتيت</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="font-bold text-danger">{selected.negativeBehaviors.tardiness}</p>
                <p className="text-muted-foreground">تأخر</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="font-bold text-danger">{selected.negativeBehaviors.incompletion}</p>
                <p className="text-muted-foreground">عدم إنجاز</p>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-foreground mb-2">التوصيات السلوكية:</h4>
            <ul className="text-xs text-muted-foreground space-y-1 mb-3">
              {getBehaviorRecommendations(selected).map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
            <h4 className="text-xs font-semibold text-foreground mb-2">التوصيات الأكاديمية:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {getAcademicRecommendations(selected).map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
