import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Student } from "@/types/domain";
import { toast } from "sonner";

export function useStudents(classId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["students", user?.id, classId ?? "all"],
    queryFn: async () => {
      let query = supabase.from("students").select("*").order("name", { ascending: true });
      if (classId) query = query.eq("class_id", classId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Student[];
    },
    enabled: !!user,
  });
}

export function useStudent(studentId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").eq("id", studentId!).single();
      if (error) throw error;
      return data as Student;
    },
    enabled: !!user && !!studentId,
  });
}

export function useCreateStudent() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; class_id: string | null; student_number?: string | null; avatar_url?: string | null }) => {
      if (!user) throw new Error("غير مصرح");
      const { data, error } = await supabase.from("students").insert({ ...input, teacher_id: user.id }).select().single();
      if (error) throw error;
      return data as Student;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e: Error) => toast.error(e.message || "فشل إضافة الطالب"),
  });
}

export function useCreateStudentsBulk() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: { name: string; class_id: string | null; student_number?: string | null }[]) => {
      if (!user) throw new Error("غير مصرح");
      const { data, error } = await supabase
        .from("students")
        .insert(rows.map((r) => ({ ...r, teacher_id: user.id })))
        .select();
      if (error) throw error;
      return data as Student[];
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success(`تم استيراد ${data.length} طالب بنجاح`);
    },
    onError: (e: Error) => toast.error(e.message || "فشل استيراد الطلاب"),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Student> }) => {
      const { error } = await supabase.from("students").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["student", vars.id] });
      toast.success("تم تحديث بيانات الطالب");
    },
    onError: (e: Error) => toast.error(e.message || "فشل التحديث"),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم حذف الطالب");
    },
    onError: (e: Error) => toast.error(e.message || "فشل الحذف"),
  });
}
