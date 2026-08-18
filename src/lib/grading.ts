import type { GradeCriteria, Note, NoteCategory } from "@/types/domain";

export interface CriteriaBreakdown {
  criteria: GradeCriteria;
  rawPoints: number;
  score: number;
}

export interface GradeSummary {
  academicMax: number;
  behaviorMax: number;
  finalMax: number;
  academicScore: number;
  behaviorScore: number;
  finalScore: number;
  academicRaw: number;
  behaviorRaw: number;
  totalRaw: number;
  breakdown: CriteriaBreakdown[];
  /** raw points that don't map to any configured criteria (uncategorized) */
  unassignedRaw: number;
}

/**
 * Converts accumulated raw points for one criteria bucket into its weighted score.
 * raw <= raw_min -> 0, raw >= raw_max -> max_points, linear in between.
 * If raw_max <= raw_min, any positive raw points earn full marks (avoids div/0).
 */
export function scoreForCriteria(criteria: GradeCriteria, rawPoints: number): number {
  const clampedRaw = Math.max(0, rawPoints);
  const span = criteria.raw_max - criteria.raw_min;
  if (span <= 0) {
    return clampedRaw > criteria.raw_min ? criteria.max_points : 0;
  }
  const ratio = (clampedRaw - criteria.raw_min) / span;
  const bounded = Math.min(1, Math.max(0, ratio));
  return round2(bounded * criteria.max_points);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function sumBy(items: { category: NoteCategory; max_points: number }[], category: NoteCategory) {
  return items.filter((i) => i.category === category).reduce((a, i) => a + i.max_points, 0);
}

/**
 * Computes the full grade breakdown for a single student from their notes and
 * the teacher's configured grade_criteria (weights + point caps). Groups raw
 * note points by criteria_id using each note's note_type_id -> criteria mapping;
 * notes without a mapped criteria still count toward the category raw total
 * but don't contribute to any specific weighted bucket.
 */
export function computeGradeSummary(
  notes: Note[],
  criteriaList: GradeCriteria[],
  noteTypeToCriteria: Map<string, string | null>
): GradeSummary {
  const rawByCriteria = new Map<string, number>();
  for (const c of criteriaList) rawByCriteria.set(c.id, 0);

  let academicRaw = 0;
  let behaviorRaw = 0;
  let unassignedRaw = 0;

  for (const note of notes) {
    if (note.category === "academic") academicRaw += note.points;
    else behaviorRaw += note.points;

    const criteriaId = note.note_type_id ? noteTypeToCriteria.get(note.note_type_id) : null;
    if (criteriaId && rawByCriteria.has(criteriaId)) {
      rawByCriteria.set(criteriaId, (rawByCriteria.get(criteriaId) ?? 0) + note.points);
    } else {
      unassignedRaw += note.points;
    }
  }

  const breakdown: CriteriaBreakdown[] = criteriaList
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((criteria) => {
      const rawPoints = rawByCriteria.get(criteria.id) ?? 0;
      return { criteria, rawPoints, score: scoreForCriteria(criteria, rawPoints) };
    });

  const academicMax = round2(sumBy(criteriaList, "academic"));
  const behaviorMax = round2(sumBy(criteriaList, "behavioral"));
  const academicScore = round2(
    breakdown.filter((b) => b.criteria.category === "academic").reduce((a, b) => a + b.score, 0)
  );
  const behaviorScore = round2(
    breakdown.filter((b) => b.criteria.category === "behavioral").reduce((a, b) => a + b.score, 0)
  );

  return {
    academicMax,
    behaviorMax,
    finalMax: round2(academicMax + behaviorMax),
    academicScore,
    behaviorScore,
    finalScore: round2(academicScore + behaviorScore),
    academicRaw,
    behaviorRaw,
    totalRaw: academicRaw + behaviorRaw,
    breakdown,
    unassignedRaw,
  };
}

export const DEFAULT_GRADE_CRITERIA: Omit<GradeCriteria, "id" | "teacher_id" | "class_id" | "created_at" | "updated_at">[] = [
  { category: "academic", name: "المشاركة", max_points: 5, raw_min: 0, raw_max: 20, sort_order: 1 },
  { category: "academic", name: "الواجبات", max_points: 5, raw_min: 0, raw_max: 20, sort_order: 2 },
  { category: "academic", name: "الاختبارات", max_points: 10, raw_min: 0, raw_max: 40, sort_order: 3 },
  { category: "academic", name: "الأنشطة", max_points: 5, raw_min: 0, raw_max: 20, sort_order: 4 },
  { category: "academic", name: "التفاعل", max_points: 5, raw_min: 0, raw_max: 20, sort_order: 5 },
  { category: "behavioral", name: "الانضباط", max_points: 3, raw_min: -10, raw_max: 12, sort_order: 6 },
  { category: "behavioral", name: "التعاون", max_points: 2, raw_min: 0, raw_max: 8, sort_order: 7 },
  { category: "behavioral", name: "الالتزام", max_points: 3, raw_min: -10, raw_max: 12, sort_order: 8 },
  { category: "behavioral", name: "السلوك الإيجابي", max_points: 2, raw_min: 0, raw_max: 8, sort_order: 9 },
];

export const DEFAULT_NOTE_TYPES: {
  category: NoteCategory;
  name: string;
  default_points: number;
  is_positive: boolean;
  icon: string;
  color: string;
  criteriaName: string;
}[] = [
  { category: "academic", name: "مشاركة إيجابية", default_points: 5, is_positive: true, icon: "🙋", color: "#0EA5E9", criteriaName: "المشاركة" },
  { category: "academic", name: "حل الواجب", default_points: 3, is_positive: true, icon: "📗", color: "#14B8A6", criteriaName: "الواجبات" },
  { category: "academic", name: "عدم حل الواجب", default_points: -5, is_positive: false, icon: "📕", color: "#EF4444", criteriaName: "الواجبات" },
  { category: "academic", name: "إنجاز متميز", default_points: 10, is_positive: true, icon: "🏆", color: "#F59E0B", criteriaName: "الأنشطة" },
  { category: "academic", name: "أداء اختبار جيد", default_points: 8, is_positive: true, icon: "📝", color: "#8B5CF6", criteriaName: "الاختبارات" },
  { category: "academic", name: "تفاعل أثناء الدرس", default_points: 4, is_positive: true, icon: "💡", color: "#0EA5E9", criteriaName: "التفاعل" },
  { category: "behavioral", name: "سلوك إيجابي", default_points: 3, is_positive: true, icon: "😊", color: "#22C55E", criteriaName: "السلوك الإيجابي" },
  { category: "behavioral", name: "تعاون مع الزملاء", default_points: 2, is_positive: true, icon: "🤝", color: "#22C55E", criteriaName: "التعاون" },
  { category: "behavioral", name: "تأخر عن الحصة", default_points: -2, is_positive: false, icon: "⏰", color: "#F97316", criteriaName: "الانضباط" },
  { category: "behavioral", name: "مخالفة سلوكية", default_points: -5, is_positive: false, icon: "⚠️", color: "#EF4444", criteriaName: "الالتزام" },
];
