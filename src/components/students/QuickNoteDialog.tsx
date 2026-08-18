import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNoteTypes } from "@/hooks/useGradeSettings";
import { useAddNote } from "@/hooks/useNotes";
import type { NoteCategory, Student } from "@/types/domain";
import { cn } from "@/lib/utils";

export function QuickNoteDialog({
  open,
  onOpenChange,
  student,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: Student | null;
}) {
  const { data: noteTypes = [] } = useNoteTypes();
  const addNote = useAddNote();

  const [category, setCategory] = useState<NoteCategory>("academic");
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [comment, setComment] = useState("");

  const typesForCategory = useMemo(
    () => noteTypes.filter((t) => t.category === category && t.is_active),
    [noteTypes, category]
  );

  useEffect(() => {
    if (open) {
      setCategory("academic");
      setSelectedTypeId(null);
      setPoints(0);
      setComment("");
    }
  }, [open, student?.id]);

  const selectType = (id: string) => {
    const t = noteTypes.find((n) => n.id === id);
    setSelectedTypeId(id);
    setPoints(t?.default_points ?? 0);
  };

  const selectedType = noteTypes.find((t) => t.id === selectedTypeId);

  const handleSubmit = async () => {
    if (!student || !selectedType) return;
    await addNote.mutateAsync({
      student_id: student.id,
      class_id: student.class_id,
      note_type_id: selectedType.id,
      category: selectedType.category,
      type_name: selectedType.name,
      points,
      comment: comment || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تسجيل ملاحظة{student ? ` — ${student.name}` : ""}</DialogTitle>
          <DialogDescription>اختر نوع الملاحظة وحدد النقاط ثم احفظ</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={category} onValueChange={(v) => { setCategory(v as NoteCategory); setSelectedTypeId(null); }}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="academic">أكاديمي</TabsTrigger>
              <TabsTrigger value="behavioral">سلوكي</TabsTrigger>
            </TabsList>
          </Tabs>

          {typesForCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              لا توجد أنواع ملاحظات في هذا القسم. أضفها من صفحة الإعدادات.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {typesForCategory.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectType(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-right transition-colors",
                    selectedTypeId === t.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                  )}
                >
                  <span>{t.icon}</span>
                  <span className="flex-1 truncate">{t.name}</span>
                  <span className={t.default_points >= 0 ? "text-success font-semibold" : "text-destructive font-semibold"}>
                    {t.default_points > 0 ? "+" : ""}{t.default_points}
                  </span>
                </button>
              ))}
            </div>
          )}

          {selectedType && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="points">النقاط</Label>
                  <Input id="points" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="comment">ملاحظة إضافية (اختياري)</Label>
                <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!selectedType || addNote.isPending} className="w-full">
            حفظ الملاحظة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
