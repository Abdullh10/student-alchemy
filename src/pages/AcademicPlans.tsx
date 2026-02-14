import { useStudents } from "@/context/StudentContext";
import { getStudentCategory, getCategoryColor, getAcademicRecommendations, getBehaviorRecommendations } from "@/data/mockData";
import { BookOpen, Lightbulb, FlaskConical, Calculator, AlertTriangle, HeartPulse } from "lucide-react";

export default function AcademicPlans() {
  const { students, loading } = useStudents();
  if (loading) return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">جاري تحميل البيانات...</p></div>;

  // Students needing academic help
  const needsAcademicHelp = students.filter(s => s.postScore < 70 || s.conceptualUnderstanding <= 2);
  
  // Students needing behavioral help
  const needsBehavioralHelp = students.filter(s => {
    const negAvg = (s.negativeBehaviors.distraction + s.negativeBehaviors.tardiness + s.negativeBehaviors.incompletion) / 3;
    return negAvg >= 2;
  });

  // Combined: students needing any type of remedial plan
  const allNeedingHelp = students.filter(s => {
    const negAvg = (s.negativeBehaviors.distraction + s.negativeBehaviors.tardiness + s.negativeBehaviors.incompletion) / 3;
    return s.postScore < 70 || s.conceptualUnderstanding <= 2 || negAvg >= 2;
  });

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">الخطط العلاجية الشاملة</h3>
        <p className="text-xs text-muted-foreground">توصيات أكاديمية وسلوكية مخصصة — {allNeedingHelp.length} طالب يحتاج خطة علاجية</p>
      </div>

      {/* Summary cards */}
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

      {/* Per student comprehensive plans */}
      <div className="space-y-4">
        {allNeedingHelp.map(s => {
          const cat = getStudentCategory(s);
          const academicRecs = getAcademicRecommendations(s);
          const behaviorRecs = getBehaviorRecommendations(s);
          const weakSkill = Object.entries(s.skills).sort(([, a], [, b]) => a - b)[0];
          const weakName = weakSkill[0] === "calculations" ? "الحسابات" : weakSkill[0] === "concepts" ? "المفاهيم" : "التجارب";
          const negAvg = (s.negativeBehaviors.distraction + s.negativeBehaviors.tardiness + s.negativeBehaviors.incompletion) / 3;
          const hasAcademicIssue = s.postScore < 70 || s.conceptualUnderstanding <= 2;
          const hasBehaviorIssue = negAvg >= 2;

          return (
            <div key={s.id} className="glass-card rounded-xl p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-foreground">{s.name}</h4>
                  <span className={`text-xs font-bold ${getCategoryColor(cat)}`}>{cat}</span>
                </div>
                <div className="flex gap-2">
                  {hasAcademicIssue && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-muted text-danger flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> ضعف أكاديمي
                    </span>
                  )}
                  {hasBehaviorIssue && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-muted text-warning flex items-center gap-1">
                      <HeartPulse className="w-3 h-3" /> ضعف سلوكي
                    </span>
                  )}
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

              {/* Behavior metrics */}
              {hasBehaviorIssue && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4 text-center text-xs">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="font-bold text-success">{s.positiveBehaviors.participation}</p>
                    <p className="text-muted-foreground">مشاركة</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="font-bold text-success">{s.positiveBehaviors.cooperation}</p>
                    <p className="text-muted-foreground">تعاون</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="font-bold text-success">{s.positiveBehaviors.focus}</p>
                    <p className="text-muted-foreground">تركيز</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="font-bold text-danger">{s.negativeBehaviors.distraction}</p>
                    <p className="text-muted-foreground">تشتيت</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="font-bold text-danger">{s.negativeBehaviors.tardiness}</p>
                    <p className="text-muted-foreground">تأخر</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="font-bold text-danger">{s.negativeBehaviors.incompletion}</p>
                    <p className="text-muted-foreground">عدم إنجاز</p>
                  </div>
                </div>
              )}

              {/* Academic recommendations */}
              {hasAcademicIssue && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-primary" /> التوصيات الأكاديمية:
                  </p>
                  {academicRecs.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground mr-5">
                      <span className="text-primary">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Behavioral recommendations */}
              {hasBehaviorIssue && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-warning" /> التوصيات السلوكية:
                  </p>
                  {behaviorRecs.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground mr-5">
                      <span className="text-warning">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {allNeedingHelp.length === 0 && (
          <div className="glass-card rounded-xl p-10 text-center">
            <BookOpen className="w-10 h-10 text-success mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">جميع الطلاب بحالة جيدة أكاديمياً وسلوكياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
