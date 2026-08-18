import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useGradeCriteria, useCreateNoteType, useUpdateNoteType, useDeleteNoteType } from "@/hooks/useGradeSettings";
import type { NoteCategory, NoteType } from "@/types/domain";

export function NoteTypesEditor({ noteTypes }: { noteTypes: NoteType[] }) {
  const { data: criteria = [] } = useGradeCriteria();
  const createNoteType = useCreateNoteType();

  const academic = noteTypes.filter((t) => t.category === "academic");
  const behavioral = noteTypes.filter((t) => t.category === "behavioral");

  const addRow = (category: NoteCategory) => {
    const list = category === "academic" ? academic : behavioral;
    createNoteType.mutate({
      category,
      criteria_id: null,
      name: "ملاحظة جديدة",
      default_points: category === "academic" ? 3 : 2,
      is_positive: true,
      icon: "⭐",
      color: "#0EA5E9",
      sort_order: list.length,
      is_active: true,
    });
  };

  return (
    <div className="space-y-5">
      <NoteTypeSection title="أنواع الملاحظات الأكاديمية" rows={academic} criteria={criteria.filter((c) => c.category === "academic")} onAdd={() => addRow("academic")} />
      <NoteTypeSection title="أنواع الملاحظات السلوكية" rows={behavioral} criteria={criteria.filter((c) => c.category === "behavioral")} onAdd={() => addRow("behavioral")} />
    </div>
  );
}

function NoteTypeSection({ title, rows, criteria, onAdd }: { title: string; rows: NoteType[]; criteria: { id: string; name: string }[]; onAdd: () => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription>حدد قيمة النقاط لكل نوع ملاحظة واربطها بعنصر الموازنة المناسب</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={onAdd}><Plus className="w-4 h-4 ml-1" /> إضافة</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">لا توجد أنواع بعد</p>}
        {rows.map((t) => <NoteTypeRow key={t.id} noteType={t} criteria={criteria} />)}
      </CardContent>
    </Card>
  );
}

function NoteTypeRow({ noteType, criteria }: { noteType: NoteType; criteria: { id: string; name: string }[] }) {
  const updateNoteType = useUpdateNoteType();
  const deleteNoteType = useDeleteNoteType();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-end p-3 rounded-lg border border-border">
      <div className="sm:col-span-1 space-y-1">
        <Label className="text-[11px] text-muted-foreground">أيقونة</Label>
        <Input
          defaultValue={noteType.icon ?? ""}
          className="text-center"
          onBlur={(e) => updateNoteType.mutate({ id: noteType.id, updates: { icon: e.target.value } })}
        />
      </div>
      <div className="col-span-2 sm:col-span-3 space-y-1">
        <Label className="text-[11px] text-muted-foreground">اسم الملاحظة</Label>
        <Input
          defaultValue={noteType.name}
          onBlur={(e) => e.target.value !== noteType.name && updateNoteType.mutate({ id: noteType.id, updates: { name: e.target.value } })}
        />
      </div>
      <div className="sm:col-span-2 space-y-1">
        <Label className="text-[11px] text-muted-foreground">النقاط (+/-)</Label>
        <Input
          type="number"
          defaultValue={noteType.default_points}
          onBlur={(e) => {
            const v = Number(e.target.value);
            updateNoteType.mutate({ id: noteType.id, updates: { default_points: v, is_positive: v >= 0 } });
          }}
        />
      </div>
      <div className="sm:col-span-3 space-y-1">
        <Label className="text-[11px] text-muted-foreground">عنصر الموازنة</Label>
        <Select
          defaultValue={noteType.criteria_id ?? "none"}
          onValueChange={(v) => updateNoteType.mutate({ id: noteType.id, updates: { criteria_id: v === "none" ? null : v } })}
        >
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون ربط</SelectItem>
            {criteria.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="sm:col-span-1 flex items-center gap-1.5">
        <Switch checked={noteType.is_active} onCheckedChange={(v) => updateNoteType.mutate({ id: noteType.id, updates: { is_active: v } })} />
        <Label className="text-[11px] text-muted-foreground">مفعّل</Label>
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className={confirmDelete ? "text-destructive" : "text-muted-foreground"}
          onClick={() => (confirmDelete ? deleteNoteType.mutate(noteType.id) : setConfirmDelete(true))}
          onBlur={() => setConfirmDelete(false)}
          title={confirmDelete ? "اضغط للتأكيد" : "حذف"}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
