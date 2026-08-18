import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { GradeCriteria, NoteType } from "@/types/domain";
import { toast } from "sonner";

export function useGradeCriteria() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["grade_criteria", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("grade_criteria").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data as GradeCriteria[];
    },
    enabled: !!user,
  });
}

export function useCreateCriteria() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<GradeCriteria, "id" | "teacher_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("غير مصرح");
      const { data, error } = await supabase.from("grade_criteria").insert({ ...input, teacher_id: user.id }).select().single();
      if (error) throw error;
      return data as GradeCriteria;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grade_criteria"] }),
    onError: (e: Error) => toast.error(e.message || "فشل الإضافة"),
  });
}

export function useUpdateCriteria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<GradeCriteria> }) => {
      const { error } = await supabase.from("grade_criteria").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grade_criteria"] }),
    onError: (e: Error) => toast.error(e.message || "فشل التحديث"),
  });
}

export function useDeleteCriteria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("grade_criteria").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grade_criteria"] });
      qc.invalidateQueries({ queryKey: ["note_types"] });
    },
    onError: (e: Error) => toast.error(e.message || "فشل الحذف"),
  });
}

export function useNoteTypes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["note_types", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("note_types").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data as NoteType[];
    },
    enabled: !!user,
  });
}

export function useCreateNoteType() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<NoteType, "id" | "teacher_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("غير مصرح");
      const { data, error } = await supabase.from("note_types").insert({ ...input, teacher_id: user.id }).select().single();
      if (error) throw error;
      return data as NoteType;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["note_types"] });
      toast.success("تمت إضافة نوع الملاحظة");
    },
    onError: (e: Error) => toast.error(e.message || "فشل الإضافة"),
  });
}

export function useUpdateNoteType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NoteType> }) => {
      const { error } = await supabase.from("note_types").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["note_types"] });
      toast.success("تم التحديث");
    },
    onError: (e: Error) => toast.error(e.message || "فشل التحديث"),
  });
}

export function useDeleteNoteType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("note_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["note_types"] });
      toast.success("تم الحذف");
    },
    onError: (e: Error) => toast.error(e.message || "فشل الحذف"),
  });
}
