import { useState } from "react";
import { useStudents } from "@/context/StudentContext";
import { getStudentCategory, getCategoryColor } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function Students() {
  const { students, loading, addStudent, deleteStudent, updateScore, updateBehavior, updateSkill, updateStudent } = useStudents();
  const [newName, setNewName] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});

  if (loading) return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">جاري تحميل البيانات...</p></div>;

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) { toast.error("الرجاء إدخال اسم الطالب"); return; }
    if (trimmed.length > 100) { toast.error("اسم الطالب طويل جداً"); return; }
    addStudent(trimmed);
    setNewName("");
    setAddDialogOpen(false);
    toast.success(`تم إضافة الطالب: ${trimmed}`);
  };

  const handleDelete = (id: string, name: string) => {
    deleteStudent(id);
    toast.success(`تم حذف الطالب: ${name}`);
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditData({
      preScore: s.preScore,
      postScore: s.postScore,
      interactionLevel: s.interactionLevel,
      conceptualUnderstanding: s.conceptualUnderstanding,
      participation: s.positiveBehaviors.participation,
      cooperation: s.positiveBehaviors.cooperation,
      focus: s.positiveBehaviors.focus,
      distraction: s.negativeBehaviors.distraction,
      tardiness: s.negativeBehaviors.tardiness,
      incompletion: s.negativeBehaviors.incompletion,
      calculations: s.skills.calculations,
      concepts: s.skills.concepts,
      experiments: s.skills.experiments,
    });
  };

  const saveEdit = (id: string) => {
    updateScore(id, "preScore", Number(editData.preScore) || 0);
    updateScore(id, "postScore", Number(editData.postScore) || 0);
    updateStudent(id, {
      interactionLevel: Math.min(5, Math.max(1, Number(editData.interactionLevel) || 1)),
      conceptualUnderstanding: Math.min(5, Math.max(1, Number(editData.conceptualUnderstanding) || 1)),
    });
    ["participation", "cooperation", "focus"].forEach(f => updateBehavior(id, f, Math.min(5, Math.max(0, Number(editData[f]) || 0))));
    ["distraction", "tardiness", "incompletion"].forEach(f => updateBehavior(id, f, Math.min(5, Math.max(0, Number(editData[f]) || 0))));
    ["calculations", "concepts", "experiments"].forEach(f => updateSkill(id, f, Math.min(100, Math.max(0, Number(editData[f]) || 0))));
    setEditingId(null);
    toast.success("تم حفظ التعديلات");
  };

  return (
    <div className="space-y-6">
      {/* Add student button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{students.length} طالب مسجل</p>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />إضافة طالب</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إضافة طالب جديد</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="اسم الطالب الكامل" value={newName} onChange={e => setNewName(e.target.value)} maxLength={100} dir="rtl" />
              <Button onClick={handleAdd} className="w-full">إضافة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Student table */}
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
                <th className="text-right p-3 font-semibold text-foreground">الفهم</th>
                <th className="text-right p-3 font-semibold text-foreground">التصنيف</th>
                <th className="text-right p-3 font-semibold text-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const cat = getStudentCategory(s);
                const isEditing = editingId === s.id;
                return (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground">{i + 1}</td>
                    <td className="p-3 font-medium text-foreground">{s.name}</td>
                    <td className="p-3">
                      {isEditing ? (
                        <Input type="number" className="w-16 h-7 text-xs" value={editData.preScore} onChange={e => setEditData(d => ({ ...d, preScore: e.target.value }))} min={0} max={100} />
                      ) : <span className="text-muted-foreground">{s.preScore}%</span>}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <Input type="number" className="w-16 h-7 text-xs" value={editData.postScore} onChange={e => setEditData(d => ({ ...d, postScore: e.target.value }))} min={0} max={100} />
                      ) : (
                        <span className={s.postScore >= 60 ? "text-success font-medium" : "text-danger font-medium"}>{s.postScore}%</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <Input type="number" className="w-14 h-7 text-xs" value={editData.interactionLevel} onChange={e => setEditData(d => ({ ...d, interactionLevel: e.target.value }))} min={1} max={5} />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Progress value={s.interactionLevel * 20} className="h-2 w-16" />
                          <span className="text-xs text-muted-foreground">{s.interactionLevel}/5</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <Input type="number" className="w-14 h-7 text-xs" value={editData.conceptualUnderstanding} onChange={e => setEditData(d => ({ ...d, conceptualUnderstanding: e.target.value }))} min={1} max={5} />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Progress value={s.conceptualUnderstanding * 20} className="h-2 w-16" />
                          <span className="text-xs text-muted-foreground">{s.conceptualUnderstanding}/5</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold ${getCategoryColor(cat)}`}>{cat}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-success" onClick={() => saveEdit(s.id)}><Save className="w-3.5 h-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingId(null)}><X className="w-3.5 h-3.5" /></Button>
                          </>
                        ) : (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={() => startEdit(s)}><Edit className="w-3.5 h-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-danger" onClick={() => handleDelete(s.id, s.name)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit detail dialog for selected student */}
      {editingId && (() => {
        const s = students.find(st => st.id === editingId);
        if (!s) return null;
        return (
          <div className="glass-card rounded-xl p-5 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-4">تعديل تفاصيل: {s.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Skills */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-3">المهارات الكيميائية (0-100)</p>
                {[["calculations", "الحسابات"], ["concepts", "المفاهيم"], ["experiments", "التجارب"]].map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground w-16">{label}</span>
                    <Input type="number" className="h-7 text-xs" value={editData[key]} onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))} min={0} max={100} />
                  </div>
                ))}
              </div>
              {/* Positive behaviors */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-3">السلوكيات الإيجابية (1-5)</p>
                {[["participation", "مشاركة"], ["cooperation", "تعاون"], ["focus", "تركيز"]].map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground w-16">{label}</span>
                    <Input type="number" className="h-7 text-xs" value={editData[key]} onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))} min={1} max={5} />
                  </div>
                ))}
              </div>
              {/* Negative behaviors */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-3">السلوكيات السلبية (0-5)</p>
                {[["distraction", "تشتيت"], ["tardiness", "تأخر"], ["incompletion", "عدم إنجاز"]].map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground w-16">{label}</span>
                    <Input type="number" className="h-7 text-xs" value={editData[key]} onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))} min={0} max={5} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>إلغاء</Button>
              <Button size="sm" onClick={() => saveEdit(editingId)}>حفظ التعديلات</Button>
            </div>
          </div>
        );
      })()}

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
