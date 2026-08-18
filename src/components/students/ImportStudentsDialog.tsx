import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseStudentsFile, type ImportedStudentRow } from "@/lib/spreadsheet";
import { useCreateStudentsBulk } from "@/hooks/useStudents";
import { toast } from "sonner";
import { FileSpreadsheet, Loader2 } from "lucide-react";

export function ImportStudentsDialog({
  open,
  onOpenChange,
  classId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classId: string;
}) {
  const [rows, setRows] = useState<ImportedStudentRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const bulkCreate = useCreateStudentsBulk();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setParsing(true);
    try {
      const parsed = await parseStudentsFile(file);
      if (parsed.length === 0) toast.error("لم يتم العثور على أسماء طلاب في الملف");
      setRows(parsed);
    } catch {
      toast.error("تعذر قراءة الملف، تأكد أنه بصيغة Excel أو CSV صحيحة");
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    await bulkCreate.mutateAsync(rows.map((r) => ({ name: r.name, student_number: r.student_number ?? null, class_id: classId })));
    setRows([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setRows([]); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>استيراد طلاب من Excel / CSV</DialogTitle>
          <DialogDescription>
            ارفع ملفًا يحتوي على عمود لأسماء الطلاب (وعمود اختياري لرقم الطالب)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="file">الملف</Label>
            <Input id="file" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {parsing && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ القراءة...</p>}

          {rows.length > 0 && (
            <div className="border border-border rounded-lg max-h-56 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-right p-2 font-medium">#</th>
                    <th className="text-right p-2 font-medium">الاسم</th>
                    <th className="text-right p-2 font-medium">الرقم</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2 text-muted-foreground">{i + 1}</td>
                      <td className="p-2">{r.name}</td>
                      <td className="p-2 text-muted-foreground">{r.student_number || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleImport} disabled={rows.length === 0 || bulkCreate.isPending} className="w-full">
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            استيراد {rows.length > 0 ? `${rows.length} طالب` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
