import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { ClassRoom } from "@/types/domain";
import { toast } from "sonner";

export function useClasses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["classes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ClassRoom[];
    },
    enabled: !!user,
  });
}

export function useCreateClass() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; grade_level?: string; subject?: string; school_year?: string; semester?: string }) => {
      if (!user) throw new Error("غير مصرح");
      const { data, error } = await supabase.from("classes").insert({ ...input, teacher_id: user.id }).select().single();
      if (error) throw error;
      return data as ClassRoom;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      toast.success("تم إنشاء الشعبة بنجاح");
    },
    onError: (e: Error) => toast.error(e.message || "فشل إنشاء الشعبة"),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ClassRoom> }) => {
      const { error } = await supabase.from("classes").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      toast.success("تم تحديث بيانات الشعبة");
    },
    onError: (e: Error) => toast.error(e.message || "فشل التحديث"),
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم حذف الشعبة");
    },
    onError: (e: Error) => toast.error(e.message || "فشل الحذف"),
  });
}
