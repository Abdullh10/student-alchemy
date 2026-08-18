import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Note, NoteCategory } from "@/types/domain";
import { awardEligibleBadges } from "@/lib/badges";
import { toast } from "sonner";

export interface NotesFilter {
  studentId?: string;
  classId?: string;
  category?: NoteCategory;
  noteTypeId?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export function useNotes(filter: NotesFilter = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notes", user?.id, filter],
    queryFn: async () => {
      let query = supabase.from("notes").select("*").order("occurred_at", { ascending: false });
      if (filter.studentId) query = query.eq("student_id", filter.studentId);
      if (filter.classId) query = query.eq("class_id", filter.classId);
      if (filter.category) query = query.eq("category", filter.category);
      if (filter.noteTypeId) query = query.eq("note_type_id", filter.noteTypeId);
      if (filter.from) query = query.gte("occurred_at", filter.from);
      if (filter.to) query = query.lte("occurred_at", filter.to);
      if (filter.limit) query = query.limit(filter.limit);
      const { data, error } = await query;
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });
}

export function useAddNote() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      student_id: string;
      class_id: string | null;
      note_type_id: string | null;
      category: NoteCategory;
      type_name: string;
      points: number;
      comment?: string | null;
      occurred_at?: string;
    }) => {
      if (!user) throw new Error("غير مصرح");
      const { data, error } = await supabase.from("notes").insert({ ...input, teacher_id: user.id }).select().single();
      if (error) throw error;
      const newBadges = await awardEligibleBadges(user.id, input.student_id);
      return { note: data as Note, newBadges };
    },
    onSuccess: ({ note, newBadges }) => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["student", note.student_id] });
      qc.invalidateQueries({ queryKey: ["student_badges", note.student_id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`تم تسجيل الملاحظة: ${note.type_name} (${note.points > 0 ? "+" : ""}${note.points})`);
      newBadges.forEach((b) => toast.success(`🎉 حصل الطالب على شارة: ${b.icon} ${b.name}`, { duration: 5000 }));
    },
    onError: (e: Error) => toast.error(e.message || "فشل تسجيل الملاحظة"),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["student"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("تم حذف الملاحظة");
    },
    onError: (e: Error) => toast.error(e.message || "فشل الحذف"),
  });
}
