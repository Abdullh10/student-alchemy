import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Info } from "lucide-react";
import { useGradeCriteria, useCreateCriteria, useUpdateCriteria, useDeleteCriteria } from "@/hooks/useGradeSettings";
import type { GradeCriteria, NoteCategory } from "@/types/domain";

export function GradeCriteriaEditor() {
  const { data: criteria = [] } = useGradeCriteria();
  const createCriteria = useCreateCriteria();

  const academic = criteria.filter((c) => c.category === "academic");
  const behavioral = criteria.filter((c) => c.category === "behavioral");

  const academicTotal = round(academic.reduce((a, c) => a + c.max_points, 0));
  const behaviorTotal = round(behavioral.reduce((a, c) => a + c.max_points, 0));

  const addRow = (category: NoteCategory) => {
    const list = category === "academic" ? academic : behavioral;
    createCriteria.mutate({
      category,
      class_id: null,
      name: "عنصر جديد",
      max_points: 5,
      raw_min: 0,
      raw_max: 20,
      sort_order: list.length,
    });
  };

  return (
    <div className="space-y-5">
      <Card className="bg-info/5 border-info/20">
        <CardContent className="p-4 flex gap-3 text-sm text-foreground/90">
          <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium">كيف تُحسب الدرجة تلقائيًا؟</p>
            <p className="text-muted-foreground">
              لكل عنصر (مثل المشاركة أو الانضباط) وزن أقصى (الدرجة)، ونطاق نقاط خام (الحد الأدنى → الحد الأعلى).
              يجمع النظام كل النقاط التي سجّلتها للطالب ضمن هذا العنصر، ثم يحوّلها إلى الدرجة تناسبيًا:
            </p>
            <p className="font-mono text-xs bg-muted rounded px-2 py-1 inline-block">
              الدرجة = الوزن × (النقاط المحصّلة − الحد الأدنى) ÷ (الحد الأعلى − الحد الأدنى)
            </p>
            <p className="text-muted-foreground">وتكون محصورة دائمًا بين 0 والوزن الأقصى لهذا العنصر.</p>
          </div>
        </CardContent>
      </Card>

      <CriteriaSection title="المتابعة الأكاديمية" total={academicTotal} rows={academic} onAdd={() => addRow("academic")} />
      <CriteriaSection title="المتابعة السلوكية" total={behaviorTotal} rows={behavioral} onAdd={() => addRow("behavioral")} />

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <p className="font-medium text-sm">المجموع النهائي</p>
          <p className="text-lg font-bold text-primary">{round(academicTotal + behaviorTotal)} درجة</p>
        </CardContent>
      </Card>
    </div>
  );
}

function CriteriaSection({ title, total, rows, onAdd }: { title: string; total: number; rows: GradeCriteria[]; onAdd: () => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription>المجموع: {total} درجة</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={onAdd}><Plus className="w-4 h-4 ml-1" /> إضافة عنصر</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">لا توجد عناصر بعد</p>}
        {rows.map((c) => <CriteriaRow key={c.id} criteria={c} />)}
      </CardContent>
    </Card>
  );
}

function CriteriaRow({ criteria }: { criteria: GradeCriteria }) {
  const updateCriteria = useUpdateCriteria();
  const deleteCriteria = useDeleteCriteria();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end p-3 rounded-lg border border-border">
      <div className="col-span-2 sm:col-span-1 space-y-1">
        <Label className="text-[11px] text-muted-foreground">الاسم</Label>
        <Input
          defaultValue={criteria.name}
          onBlur={(e) => e.target.value !== criteria.name && updateCriteria.mutate({ id: criteria.id, updates: { name: e.target.value } })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">الوزن (الدرجة)</Label>
        <Input
          type="number"
          defaultValue={criteria.max_points}
          onBlur={(e) => updateCriteria.mutate({ id: criteria.id, updates: { max_points: Number(e.target.value) } })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">الحد الأدنى للنقاط</Label>
        <Input
          type="number"
          defaultValue={criteria.raw_min}
          onBlur={(e) => updateCriteria.mutate({ id: criteria.id, updates: { raw_min: Number(e.target.value) } })}
        />
      </div>
      <div className="flex items-end gap-1">
        <div className="flex-1 space-y-1">
          <Label className="text-[11px] text-muted-foreground">الحد الأعلى للنقاط</Label>
          <Input
            type="number"
            defaultValue={criteria.raw_max}
            onBlur={(e) => updateCriteria.mutate({ id: criteria.id, updates: { raw_max: Number(e.target.value) } })}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={confirmDelete ? "text-destructive" : "text-muted-foreground"}
          onClick={() => (confirmDelete ? deleteCriteria.mutate(criteria.id) : setConfirmDelete(true))}
          onBlur={() => setConfirmDelete(false)}
          title={confirmDelete ? "اضغط للتأكيد" : "حذف"}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
