import { students, getStudentCategory, getCategoryColor } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";

export default function Students() {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right p-3 font-semibold text-foreground">#</th>
                <th className="text-right p-3 font-semibold text-foreground">اسم الطالب</th>
                <th className="text-right p-3 font-semibold text-foreground">قبل</th>
                <th className="text-right p-3 font-semibold text-foreground">بعد</th>
                <th className="text-right p-3 font-semibold text-foreground">التفاعل</th>
                <th className="text-right p-3 font-semibold text-foreground">الفهم المفاهيمي</th>
                <th className="text-right p-3 font-semibold text-foreground">التصنيف</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const cat = getStudentCategory(s);
                return (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground">{i + 1}</td>
                    <td className="p-3 font-medium text-foreground">{s.name}</td>
                    <td className="p-3 text-muted-foreground">{s.preScore}%</td>
                    <td className="p-3">
                      <span className={s.postScore >= 60 ? "text-success font-medium" : "text-danger font-medium"}>
                        {s.postScore}%
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={s.interactionLevel * 20} className="h-2 w-16" />
                        <span className="text-xs text-muted-foreground">{s.interactionLevel}/5</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={s.conceptualUnderstanding * 20} className="h-2 w-16" />
                        <span className="text-xs text-muted-foreground">{s.conceptualUnderstanding}/5</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold ${getCategoryColor(cat)}`}>{cat}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.map(s => {
          const cat = getStudentCategory(s);
          return (
            <div key={s.id} className="glass-card rounded-xl p-5 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">{s.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getCategoryColor(cat)} bg-muted`}>{cat}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-lg font-bold text-foreground">{s.skills.calculations}%</p>
                  <p className="text-xs text-muted-foreground">الحسابات</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-lg font-bold text-foreground">{s.skills.concepts}%</p>
                  <p className="text-xs text-muted-foreground">المفاهيم</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-lg font-bold text-foreground">{s.skills.experiments}%</p>
                  <p className="text-xs text-muted-foreground">التجارب</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
