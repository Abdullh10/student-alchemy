import { useMemo, useState } from "react";
import { useStudents } from "@/context/StudentContext";
import { getProgressCategory, weekTotal, type ProgressCategory, type WeekScore } from "@/data/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const catColor: Record<ProgressCategory, string> = {
  "تحسن جيد": "hsl(var(--success))",
  "تحسن بسيط": "hsl(var(--warning))",
  "انخفاض حاد": "hsl(var(--danger))",
};

const fieldLabels: Record<keyof Omit<WeekScore, "week">, string> = {
  participation: "المشاركة /10",
  activities: "أنشطة صفية /10",
  research: "بحوث ومشاريع /10",
  homework: "الواجبات /10",
  written: "تقويم تحريري /15",
  practical: "تقويم عملي /5",
};

export default function WeeklyProgress() {
  const { students, loading, updateWeekScore } = useStudents();
  const [selectedId, setSelectedId] = useState<string>("");

  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => a.name.localeCompare(b.name, "ar")),
    [students]
  );
  const selected = useMemo(
    () => students.find(s => s.id === selectedId) ?? sortedStudents[0],
    [students, selectedId, sortedStudents]
  );

  // Group comparison: avg %tot per week per category
  const groupData = useMemo(() => {
    const cats: ProgressCategory[] = ["تحسن جيد", "تحسن بسيط", "انخفاض حاد"];
    const arr: any[] = [];
    for (let w = 1; w <= 15; w++) {
      const row: any = { week: `أ${w}` };
      for (const c of cats) {
        const list = students.filter(s => getProgressCategory(s.name) === c && s.weeklyScores?.length);
        if (!list.length) { row[c] = 0; continue; }
        const sum = list.reduce((acc, s) => {
          const wk = s.weeklyScores.find(x => x.week === w);
          return acc + (wk ? (weekTotal(wk) * 100 / 60) : 0);
        }, 0);
        row[c] = Math.round(sum / list.length);
      }
      arr.push(row);
    }
    return arr;
  }, [students]);

  if (loading) return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">جاري تحميل البيانات...</p></div>;
  if (!selected) return <div className="p-6 text-muted-foreground">لا يوجد طلاب.</div>;

  const studentLineData = selected.weeklyScores.map(w => ({
    week: `أ${w.week}`,
    "النسبة %": Math.round(weekTotal(w) * 100 / 60),
    "الأداء (/40)": w.participation + w.activities + w.research + w.homework,
    "التقويم (/20)": w.written + w.practical,
  }));

  const cat = getProgressCategory(selected.name);
  const first = selected.weeklyScores[0];
  const last = selected.weeklyScores[selected.weeklyScores.length - 1];
  const startPct = first ? Math.round(weekTotal(first) * 100 / 60) : 0;
  const endPct = last ? Math.round(weekTotal(last) * 100 / 60) : 0;
  const delta = endPct - startPct;

  return (
    <div className="space-y-6">
      {/* Header / selector */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-base font-semibold mb-2">التطور الأكاديمي الأسبوعي (15 أسبوع)</h3>
            <p className="text-xs text-muted-foreground">تتبع درجات كل طالب أسبوعياً مع رسم بياني للتحسن أو التراجع.</p>
          </div>
          <div className="w-full lg:w-80">
            <Select value={selected.id} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue placeholder="اختر طالباً" /></SelectTrigger>
              <SelectContent>
                {sortedStudents.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">الفئة</p>
          <p className="text-lg font-bold mt-1" style={{ color: catColor[cat] }}>{cat}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">الأسبوع 1</p>
          <p className="text-2xl font-bold mt-1">{startPct}%</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">الأسبوع 15</p>
          <p className="text-2xl font-bold mt-1">{endPct}%</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">الفرق</p>
          <p className={`text-2xl font-bold mt-1 flex items-center gap-2 ${delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-muted-foreground"}`}>
            {delta > 0 ? <TrendingUp className="w-5 h-5" /> : delta < 0 ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
            {delta > 0 ? "+" : ""}{delta}%
          </p>
        </div>
      </div>

      {/* Student line chart */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">تطور {selected.name}</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={studentLineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="النسبة %" stroke={catColor[cat]} strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="الأداء (/40)" stroke="hsl(var(--primary))" strokeWidth={2} />
            <Line type="monotone" dataKey="التقويم (/20)" stroke="hsl(var(--info))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Group comparison */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">مقارنة بين الفئات الثلاث (متوسط النسبة %)</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={groupData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="تحسن جيد" stroke={catColor["تحسن جيد"]} strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="تحسن بسيط" stroke={catColor["تحسن بسيط"]} strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="انخفاض حاد" stroke={catColor["انخفاض حاد"]} strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Editable weeks table */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">تعديل درجات الأسابيع</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-right">الأسبوع</th>
                {Object.entries(fieldLabels).map(([k, l]) => (
                  <th key={k} className="p-2 text-center">{l}</th>
                ))}
                <th className="p-2 text-center">المجموع /60</th>
              </tr>
            </thead>
            <tbody>
              {selected.weeklyScores.map(w => (
                <tr key={w.week} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-2 font-medium">أسبوع {w.week}</td>
                  {(Object.keys(fieldLabels) as Array<keyof Omit<WeekScore, "week">>).map(field => {
                    const max = field === "written" ? 15 : field === "practical" ? 5 : 10;
                    return (
                      <td key={field} className="p-1 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={max}
                          value={w[field]}
                          onChange={(e) => {
                            const v = Math.max(0, Math.min(max, Number(e.target.value) || 0));
                            updateWeekScore(selected.id, w.week, field, v);
                          }}
                          className="h-8 w-16 text-center text-xs mx-auto"
                        />
                      </td>
                    );
                  })}
                  <td className="p-2 text-center font-semibold">{weekTotal(w)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
