import { useState } from "react";
import { Plus, Pencil, Trash2, Award, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useBadges, useCreateBadge, useUpdateBadge, useDeleteBadge, useAllStudentBadges, useAwardBadgeManually } from "@/hooks/useBadges";
import { useStudents } from "@/hooks/useStudents";
import type { Badge as BadgeType, BadgeRuleType } from "@/types/domain";

const RULE_LABELS: Record<BadgeRuleType, string> = {
  total_points: "إجمالي النقاط (أكاديمي + سلوكي) ≥",
  academic_points: "نقاط أكاديمية ≥",
  behavior_points: "نقاط سلوكية ≥",
  notes_count: "عدد الملاحظات المسجلة ≥",
  note_type_count: "عدد مرات تكرار نوع ملاحظة محدد ≥",
  manual: "منح يدوي فقط (لا يوجد شرط تلقائي)",
};

export default function BadgesPage() {
  const { data: badges = [] } = useBadges();
  const { data: earned = [] } = useAllStudentBadges();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BadgeType | null>(null);
  const [awardOpen, setAwardOpen] = useState(false);

  const earnedCount = (badgeId: string) => earned.filter((e) => e.badge_id === badgeId).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">الشارات والتحفيز</h1>
          <p className="text-sm text-muted-foreground mt-1">تُمنح تلقائيًا عند تحقيق الشروط، ويمكنك منحها يدويًا أيضًا</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAwardOpen(true)}><Gift className="w-4 h-4 ml-1" /> منح يدوي</Button>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="w-4 h-4 ml-1" /> شارة جديدة</Button>
        </div>
      </div>

      {badges.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-16 text-center text-muted-foreground">لا توجد شارات بعد</CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: b.color + "20" }}>
                    {b.icon}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => { setEditing(b); setDialogOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    <DeleteBadgeButton badge={b} />
                  </div>
                </div>
                <p className="font-semibold text-foreground">{b.name}</p>
                {b.description && <p className="text-xs text-muted-foreground mt-0.5">{b.description}</p>}
                <p className="text-xs text-muted-foreground mt-2">{RULE_LABELS[b.rule_type]}{b.rule_type !== "manual" ? ` ${b.threshold ?? 0}` : ""}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Award className="w-3.5 h-3.5" /> حصل عليها {earnedCount(b.id)} طالب</span>
                  {!b.is_active && <span className="text-xs text-muted-foreground">معطّلة</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BadgeDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
      <AwardManualDialog open={awardOpen} onOpenChange={setAwardOpen} badges={badges} />
    </div>
  );
}

function DeleteBadgeButton({ badge }: { badge: BadgeType }) {
  const deleteBadge = useDeleteBadge();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف شارة "{badge.name}"؟</AlertDialogTitle>
          <AlertDialogDescription>سيفقد الطلاب الذين حصلوا عليها هذه الشارة. لا يمكن التراجع.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteBadge.mutate(badge.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BadgeDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: BadgeType | null }) {
  const createBadge = useCreateBadge();
  const updateBadge = useUpdateBadge();
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [icon, setIcon] = useState(editing?.icon ?? "🌟");
  const [color, setColor] = useState(editing?.color ?? "#F59E0B");
  const [ruleType, setRuleType] = useState<BadgeRuleType>(editing?.rule_type ?? "total_points");
  const [threshold, setThreshold] = useState(editing?.threshold ?? 20);
  const [isActive, setIsActive] = useState(editing?.is_active ?? true);

  const reset = (b: BadgeType | null) => {
    setName(b?.name ?? "");
    setDescription(b?.description ?? "");
    setIcon(b?.icon ?? "🌟");
    setColor(b?.color ?? "#F59E0B");
    setRuleType(b?.rule_type ?? "total_points");
    setThreshold(b?.threshold ?? 20);
    setIsActive(b?.is_active ?? true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) reset(editing); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل الشارة" : "شارة جديدة"}</DialogTitle>
          <DialogDescription>حدد شرط المنح ليتم منحها تلقائيًا عند تحققه</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = { name, description: description || null, icon, color, rule_type: ruleType, threshold: ruleType === "manual" ? null : threshold, note_type_id: null, is_active: isActive };
            if (editing) await updateBadge.mutateAsync({ id: editing.id, updates: payload });
            else await createBadge.mutateAsync(payload);
            onOpenChange(false);
          }}
        >
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5"><Label>أيقونة</Label><Input value={icon} onChange={(e) => setIcon(e.target.value)} className="text-center" /></div>
            <div className="col-span-3 space-y-1.5"><Label>اسم الشارة</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>الوصف (اختياري)</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
          <div className="space-y-1.5">
            <Label>شرط المنح</Label>
            <Select value={ruleType} onValueChange={(v) => setRuleType(v as BadgeRuleType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(RULE_LABELS) as BadgeRuleType[]).map((k) => <SelectItem key={k} value={k}>{RULE_LABELS[k]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {ruleType !== "manual" && (
            <div className="space-y-1.5"><Label>القيمة المطلوبة</Label><Input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} /></div>
          )}
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>مفعّلة</Label>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">{editing ? "حفظ" : "إنشاء الشارة"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AwardManualDialog({ open, onOpenChange, badges }: { open: boolean; onOpenChange: (v: boolean) => void; badges: BadgeType[] }) {
  const { data: students = [] } = useStudents();
  const awardBadge = useAwardBadgeManually();
  const [studentId, setStudentId] = useState<string>("");
  const [badgeId, setBadgeId] = useState<string>("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>منح شارة يدويًا</DialogTitle>
          <DialogDescription>اختر الطالب والشارة المراد منحها</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>الطالب</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue placeholder="اختر طالبًا" /></SelectTrigger>
              <SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>الشارة</Label>
            <Select value={badgeId} onValueChange={setBadgeId}>
              <SelectTrigger><SelectValue placeholder="اختر شارة" /></SelectTrigger>
              <SelectContent>{badges.map((b) => <SelectItem key={b.id} value={b.id}>{b.icon} {b.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            className="w-full"
            disabled={!studentId || !badgeId}
            onClick={async () => { await awardBadge.mutateAsync({ studentId, badgeId }); onOpenChange(false); }}
          >
            منح الشارة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
