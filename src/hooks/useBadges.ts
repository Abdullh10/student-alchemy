import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Badge, StudentBadge } from "@/types/domain";
import { toast } from "sonner";

export function useBadges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["badges", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("badges").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data as Badge[];
    },
    enabled: !!user,
  });
}

export function useStudentBadges(studentId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student_badges", studentId],
    queryFn: async () => {
      const { data, error } = await supabase.from("student_badges").select("*, badge:badges(*)").eq("student_id", studentId!);
      if (error) throw error;
      return data as (StudentBadge & { badge: Badge })[];
    },
    enabled: !!user && !!studentId,
  });
}

export function useAllStudentBadges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student_badges", "all", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("student_badges").select("*");
      if (error) throw error;
      return data as StudentBadge[];
    },
    enabled: !!user,
  });
}

export function useCreateBadge() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Badge, "id" | "teacher_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("غير مصرح");
      const { data, error } = await supabase.from("badges").insert({ ...input, teacher_id: user.id }).select().single();
      if (error) throw error;
      return data as Badge;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["badges"] });
      toast.success("تمت إضافة الشارة");
    },
    onError: (e: Error) => toast.error(e.message || "فشل الإضافة"),
  });
}

export function useUpdateBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Badge> }) => {
      const { error } = await supabase.from("badges").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["badges"] });
      toast.success("تم التحديث");
    },
    onError: (e: Error) => toast.error(e.message || "فشل التحديث"),
  });
}

export function useDeleteBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("badges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["badges"] });
      toast.success("تم الحذف");
    },
    onError: (e: Error) => toast.error(e.message || "فشل الحذف"),
  });
}

export function useAwardBadgeManually() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, badgeId }: { studentId: string; badgeId: string }) => {
      if (!user) throw new Error("غير مصرح");
      const { error } = await supabase.from("student_badges").insert({ teacher_id: user.id, student_id: studentId, badge_id: badgeId });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["student_badges", vars.studentId] });
      qc.invalidateQueries({ queryKey: ["student_badges", "all"] });
      toast.success("تم منح الشارة");
    },
    onError: (e: Error) => toast.error(e.message || "فشل المنح"),
  });
}
