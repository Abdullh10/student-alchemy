import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStudents } from "@/hooks/useStudents";
import { useNotes } from "@/hooks/useNotes";
import { useGradeCriteria, useNoteTypes } from "@/hooks/useGradeSettings";
import { computeGradeSummary, type GradeSummary } from "@/lib/grading";
import type { Note } from "@/types/domain";

/**
 * Computes grade summaries for every one of the teacher's students in one pass.
 * This is the single source of truth used by the dashboard, class sheet,
 * student profile, and reports so grade numbers never drift between pages.
 */
export function useGradeSummaries() {
  const { user } = useAuth();
  const students = useStudents();
  const notes = useNotes();
  const criteria = useGradeCriteria();
  const noteTypes = useNoteTypes();

  const isLoading = students.isLoading || notes.isLoading || criteria.isLoading || noteTypes.isLoading;

  const notesByStudent = useMemo(() => {
    const map = new Map<string, Note[]>();
    for (const n of notes.data ?? []) {
      const arr = map.get(n.student_id) ?? [];
      arr.push(n);
      map.set(n.student_id, arr);
    }
    return map;
  }, [notes.data]);

  const noteTypeToCriteria = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const nt of noteTypes.data ?? []) map.set(nt.id, nt.criteria_id);
    return map;
  }, [noteTypes.data]);

  const summaries = useMemo(() => {
    const map = new Map<string, GradeSummary>();
    if (!criteria.data) return map;
    for (const s of students.data ?? []) {
      const studentNotes = notesByStudent.get(s.id) ?? [];
      map.set(s.id, computeGradeSummary(studentNotes, criteria.data, noteTypeToCriteria));
    }
    return map;
  }, [students.data, notesByStudent, criteria.data, noteTypeToCriteria]);

  return {
    isLoading,
    students: students.data ?? [],
    notes: notes.data ?? [],
    notesByStudent,
    criteria: criteria.data ?? [],
    noteTypes: noteTypes.data ?? [],
    summaries,
    enabled: !!user,
  };
}
