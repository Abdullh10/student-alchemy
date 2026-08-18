-- ============================================================================
-- منصة كشف المتابعة الإلكتروني للمعلم
-- إعادة بناء كاملة: حسابات معلمين حقيقية (auth.users) + عزل بيانات كل معلم (RLS)
-- ============================================================================

-- Drop legacy demo table (no-auth, single-tenant chemistry demo data)
DROP TABLE IF EXISTS public.students CASCADE;

-- ----------------------------------------------------------------------------
-- Helper: keep updated_at fresh (function already exists from earlier migration,
-- but recreate defensively in case this migration runs on a fresh database)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ----------------------------------------------------------------------------
-- profiles: بيانات ملف المعلم الشخصي (سطر واحد لكل مستخدم auth)
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  specialization TEXT,
  school TEXT,
  education_admin TEXT,
  stage TEXT,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  school_year TEXT,
  semester TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create a blank profile row whenever a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- classes: الشعب الدراسية
-- ----------------------------------------------------------------------------
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level TEXT,
  subject TEXT,
  school_year TEXT,
  semester TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_classes_teacher ON public.classes(teacher_id);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classes_all_own" ON public.classes
  FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

CREATE TRIGGER set_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- students: الطلاب
-- ----------------------------------------------------------------------------
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  student_number TEXT,
  avatar_url TEXT,
  notes_general TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_students_teacher ON public.students(teacher_id);
CREATE INDEX idx_students_class ON public.students(class_id);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_all_own" ON public.students
  FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

CREATE TRIGGER set_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- grade_criteria: عناصر الموازنة (الأوزان) للدرجة الأكاديمية والسلوكية
-- مثال: المشاركة 5 / الواجبات 5 / الاختبارات 10 ... مجموع أكاديمي = 30
-- ----------------------------------------------------------------------------
CREATE TABLE public.grade_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('academic', 'behavioral')),
  name TEXT NOT NULL,
  max_points NUMERIC NOT NULL DEFAULT 0,
  raw_min NUMERIC NOT NULL DEFAULT 0,
  raw_max NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_grade_criteria_teacher ON public.grade_criteria(teacher_id);
CREATE INDEX idx_grade_criteria_class ON public.grade_criteria(class_id);

ALTER TABLE public.grade_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grade_criteria_all_own" ON public.grade_criteria
  FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

CREATE TRIGGER set_grade_criteria_updated_at
BEFORE UPDATE ON public.grade_criteria
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- note_types: أنواع الملاحظات القابلة للتخصيص (ClassDojo-style)
-- كل نوع مرتبط اختياريًا بعنصر موازنة (grade_criteria) ليتم تحويل نقاطه لدرجة
-- ----------------------------------------------------------------------------
CREATE TABLE public.note_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  criteria_id UUID REFERENCES public.grade_criteria(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('academic', 'behavioral')),
  name TEXT NOT NULL,
  default_points NUMERIC NOT NULL DEFAULT 0,
  is_positive BOOLEAN NOT NULL DEFAULT true,
  icon TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_note_types_teacher ON public.note_types(teacher_id);
CREATE INDEX idx_note_types_criteria ON public.note_types(criteria_id);

ALTER TABLE public.note_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "note_types_all_own" ON public.note_types
  FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

CREATE TRIGGER set_note_types_updated_at
BEFORE UPDATE ON public.note_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- notes: سجل الملاحظات الفعلي المسجل على كل طالب (المعاملات)
-- ----------------------------------------------------------------------------
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  note_type_id UUID REFERENCES public.note_types(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('academic', 'behavioral')),
  type_name TEXT NOT NULL,
  points NUMERIC NOT NULL DEFAULT 0,
  comment TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_teacher ON public.notes(teacher_id);
CREATE INDEX idx_notes_student ON public.notes(student_id);
CREATE INDEX idx_notes_class ON public.notes(class_id);
CREATE INDEX idx_notes_occurred_at ON public.notes(occurred_at);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_all_own" ON public.notes
  FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

-- ----------------------------------------------------------------------------
-- badges: الشارات التحفيزية وشروط منحها التلقائي
-- ----------------------------------------------------------------------------
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '⭐',
  color TEXT NOT NULL DEFAULT '#F59E0B',
  rule_type TEXT NOT NULL CHECK (rule_type IN ('total_points', 'academic_points', 'behavior_points', 'notes_count', 'note_type_count', 'manual')),
  threshold NUMERIC,
  note_type_id UUID REFERENCES public.note_types(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_badges_teacher ON public.badges(teacher_id);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_all_own" ON public.badges
  FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

CREATE TRIGGER set_badges_updated_at
BEFORE UPDATE ON public.badges
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- student_badges: الشارات الممنوحة فعليًا لكل طالب
-- ----------------------------------------------------------------------------
CREATE TABLE public.student_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, badge_id)
);

CREATE INDEX idx_student_badges_student ON public.student_badges(student_id);

ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_badges_all_own" ON public.student_badges
  FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

-- ----------------------------------------------------------------------------
-- audit_log: سجل التعديلات
-- ----------------------------------------------------------------------------
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_teacher ON public.audit_log(teacher_id, created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_all_own" ON public.audit_log
  FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
