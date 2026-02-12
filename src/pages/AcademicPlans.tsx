import { students, getStudentCategory, getCategoryColor, getAcademicRecommendations } from "@/data/mockData";
import { BookOpen, Lightbulb, FlaskConical, Calculator } from "lucide-react";

export default function AcademicPlans() {
  const needsHelp = students.filter(s => s.postScore < 70 || s.conceptualUnderstanding <= 2);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">الخطط العلاجية الأكاديمية</h3>
        <p className="text-xs text-muted-foreground">توصيات أكاديمية مخصصة لكل طالب بناءً على تحليل المهارات</p>
      </div>

      {/* Quick remedial activities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 animate-fade-in">
          <Calculator className="w-8 h-8 text-primary mb-3" />
          <h4 className="text-sm font-semibold text-foreground mb-1">الحسابات الكيميائية</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• حساب الكتلة المولية</li>
            <li>• تحويل المولات</li>
            <li>• حساب التركيز المولاري</li>
            <li>• المعادلات الموزونة</li>
          </ul>
        </div>
        <div className="glass-card rounded-xl p-5 animate-fade-in">
          <Lightbulb className="w-8 h-8 text-warning mb-3" />
          <h4 className="text-sm font-semibold text-foreground mb-1">المفاهيم الأساسية</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• التركيب الذري</li>
            <li>• الروابط الكيميائية</li>
            <li>• التفاعلات الكيميائية</li>
            <li>• الجدول الدوري</li>
          </ul>
        </div>
        <div className="glass-card rounded-xl p-5 animate-fade-in">
          <FlaskConical className="w-8 h-8 text-info mb-3" />
          <h4 className="text-sm font-semibold text-foreground mb-1">المهارات العملية</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• إجراء التجارب بأمان</li>
            <li>• قراءة الأدوات المخبرية</li>
            <li>• تسجيل الملاحظات</li>
            <li>• تحليل النتائج</li>
          </ul>
        </div>
      </div>

      {/* Per student plans */}
      <div className="space-y-4">
        {needsHelp.map(s => {
          const cat = getStudentCategory(s);
          const recs = getAcademicRecommendations(s);
          const weakSkill = Object.entries(s.skills).sort(([, a], [, b]) => a - b)[0];
          const weakName = weakSkill[0] === "calculations" ? "الحسابات" : weakSkill[0] === "concepts" ? "المفاهيم" : "التجارب";

          return (
            <div key={s.id} className="glass-card rounded-xl p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-foreground">{s.name}</h4>
                  <span className={`text-xs font-bold ${getCategoryColor(cat)}`}>{cat}</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">أضعف مهارة</p>
                  <p className="text-sm font-bold text-danger">{weakName}: {weakSkill[1]}%</p>
                </div>
              </div>

              {/* Skills bars */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {Object.entries(s.skills).map(([key, val]) => {
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

              {/* Recommendations */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">التوصيات التدريسية:</p>
                {recs.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
