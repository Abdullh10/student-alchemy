export type NoteCategory = "academic" | "behavioral";

export interface Profile {
  id: string;
  full_name: string | null;
  specialization: string | null;
  school: string | null;
  education_admin: string | null;
  stage: string | null;
  subjects: string[];
  school_year: string | null;
  semester: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassRoom {
  id: string;
  teacher_id: string;
  name: string;
  grade_level: string | null;
  subject: string | null;
  school_year: string | null;
  semester: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  teacher_id: string;
  class_id: string | null;
  name: string;
  student_number: string | null;
  avatar_url: string | null;
  notes_general: string | null;
  created_at: string;
  updated_at: string;
}

export interface GradeCriteria {
  id: string;
  teacher_id: string;
  class_id: string | null;
  category: NoteCategory;
  name: string;
  max_points: number;
  raw_min: number;
  raw_max: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NoteType {
  id: string;
  teacher_id: string;
  criteria_id: string | null;
  category: NoteCategory;
  name: string;
  default_points: number;
  is_positive: boolean;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  teacher_id: string;
  student_id: string;
  class_id: string | null;
  note_type_id: string | null;
  category: NoteCategory;
  type_name: string;
  points: number;
  comment: string | null;
  occurred_at: string;
  created_at: string;
}

export type BadgeRuleType =
  | "total_points"
  | "academic_points"
  | "behavior_points"
  | "notes_count"
  | "note_type_count"
  | "manual";

export interface Badge {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  rule_type: BadgeRuleType;
  threshold: number | null;
  note_type_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentBadge {
  id: string;
  teacher_id: string;
  student_id: string;
  badge_id: string;
  awarded_at: string;
}
