import type { Badge, GradeCriteria, Note, NoteType, StudentBadge } from "@/types/domain";
import type { GradeSummary } from "@/lib/grading";
import { computeGradeSummary } from "@/lib/grading";
import { supabase } from "@/integrations/supabase/client";

/**
 * Evaluates which of the teacher's badge rules a student currently qualifies
 * for, given their notes and computed grade summary. Returns the badge ids
 * that should be (auto-)awarded. Manual badges are never auto-evaluated.
 */
export function evaluateEarnedBadges(
  badges: Badge[],
  studentNotes: Note[],
  summary: GradeSummary
): string[] {
  const earned: string[] = [];

  for (const badge of badges) {
    if (!badge.is_active || badge.rule_type === "manual") continue;
    const threshold = badge.threshold ?? 0;

    switch (badge.rule_type) {
      case "total_points":
        if (summary.totalRaw >= threshold) earned.push(badge.id);
        break;
      case "academic_points":
        if (summary.academicRaw >= threshold) earned.push(badge.id);
        break;
      case "behavior_points":
        if (summary.behaviorRaw >= threshold) earned.push(badge.id);
        break;
      case "notes_count":
        if (studentNotes.length >= threshold) earned.push(badge.id);
        break;
      case "note_type_count": {
        if (!badge.note_type_id) break;
        const count = studentNotes.filter((n) => n.note_type_id === badge.note_type_id).length;
        if (count >= threshold) earned.push(badge.id);
        break;
      }
    }
  }

  return earned;
}

/**
 * Re-evaluates a student's badge eligibility against the teacher's current
 * badge rules and awards (persists) any newly earned badges. Called after
 * logging a new note so recognition is fully automatic, as requested.
 * Returns the list of badges newly awarded (empty if none / rule_type manual only).
 */
export async function awardEligibleBadges(teacherId: string, studentId: string): Promise<Badge[]> {
  const [{ data: notes }, { data: criteria }, { data: noteTypes }, { data: badges }, { data: existing }] = await Promise.all([
    supabase.from("notes").select("*").eq("student_id", studentId),
    supabase.from("grade_criteria").select("*").eq("teacher_id", teacherId),
    supabase.from("note_types").select("*").eq("teacher_id", teacherId),
    supabase.from("badges").select("*").eq("teacher_id", teacherId).eq("is_active", true),
    supabase.from("student_badges").select("badge_id").eq("student_id", studentId),
  ]);

  if (!notes || !criteria || !noteTypes || !badges) return [];

  const noteTypeToCriteria = new Map<string, string | null>(
    (noteTypes as NoteType[]).map((nt) => [nt.id, nt.criteria_id])
  );
  const summary = computeGradeSummary(notes as Note[], criteria as GradeCriteria[], noteTypeToCriteria);
  const existingIds = new Set((existing as Pick<StudentBadge, "badge_id">[] | null)?.map((b) => b.badge_id) ?? []);

  const earnedIds = evaluateEarnedBadges(badges as Badge[], notes as Note[], summary).filter((id) => !existingIds.has(id));
  if (earnedIds.length === 0) return [];

  const { error } = await supabase
    .from("student_badges")
    .insert(earnedIds.map((badge_id) => ({ teacher_id: teacherId, student_id: studentId, badge_id })));
  if (error) return [];

  return (badges as Badge[]).filter((b) => earnedIds.includes(b.id));
}

export const DEFAULT_BADGES: Omit<Badge, "id" | "teacher_id" | "created_at" | "updated_at">[] = [
  { name: "الطالب المثالي", description: "التزام أكاديمي وسلوكي متكامل", icon: "🌟", color: "#F59E0B", rule_type: "total_points", threshold: 100, note_type_id: null, is_active: true },
  { name: "نجم الأسبوع", description: "حقق أعلى نقاط إيجابية", icon: "⭐", color: "#EAB308", rule_type: "total_points", threshold: 40, note_type_id: null, is_active: true },
  { name: "الطالب المتفاعل", description: "تفاعل مستمر داخل الصف", icon: "🙋", color: "#0EA5E9", rule_type: "notes_count", threshold: 15, note_type_id: null, is_active: true },
  { name: "متميز في الواجبات", description: "التزام بحل الواجبات", icon: "📗", color: "#14B8A6", rule_type: "academic_points", threshold: 30, note_type_id: null, is_active: true },
  { name: "سلوك إيجابي", description: "سلوك منضبط ومتعاون", icon: "😊", color: "#22C55E", rule_type: "behavior_points", threshold: 15, note_type_id: null, is_active: true },
  { name: "إنجاز متميز", description: "أداء أكاديمي استثنائي", icon: "🏆", color: "#8B5CF6", rule_type: "academic_points", threshold: 50, note_type_id: null, is_active: true },
];
