import { students, getStudentCategory, getCategoryColor, getBehaviorRecommendations } from "@/data/mockData";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function BehaviorPlans() {
  const needsIntervention = students.filter(s => {
    const negAvg = (s.negativeBehaviors.distraction + s.negativeBehaviors.tardiness + s.negativeBehaviors.incompletion) / 3;
    return negAvg >= 2;
  });

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">الخطط العلاجية السلوكية</h3>
        <p className="text-xs text-muted-foreground mb-4">خطط فردية مولدة تلقائياً بناءً على تحليل السلوك</p>
      </div>

      <div className="space-y-4">
        {needsIntervention.map(s => {
          const cat = getStudentCategory(s);
          const recs = getBehaviorRecommendations(s);
          const negAvg = (s.negativeBehaviors.distraction + s.negativeBehaviors.tardiness + s.negativeBehaviors.incompletion) / 3;
          const severity = negAvg >= 4 ? "حرج" : negAvg >= 3 ? "مرتفع" : "متوسط";
          const severityColor = negAvg >= 4 ? "text-danger" : negAvg >= 3 ? "text-warning" : "text-info";

          return (
            <div key={s.id} className="glass-card rounded-xl p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-foreground">{s.name}</h4>
                  <span className={`text-xs font-bold ${getCategoryColor(cat)}`}>{cat}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-muted ${severityColor}`}>
                  مستوى الخطورة: {severity}
                </span>
              </div>

              {/* Behavior metrics */}
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

              {/* Recommendations */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">إجراءات تعديل السلوك:</p>
                {recs.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              {/* Follow up indicators */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>بداية التنفيذ: هذا الأسبوع</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>مدة المتابعة: 4 أسابيع</span>
                </div>
              </div>
            </div>
          );
        })}

        {needsIntervention.length === 0 && (
          <div className="glass-card rounded-xl p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">جميع الطلاب يظهرون سلوكاً إيجابياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
