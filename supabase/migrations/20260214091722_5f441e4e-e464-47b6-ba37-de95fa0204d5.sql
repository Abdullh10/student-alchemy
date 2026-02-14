
-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pre_score INTEGER NOT NULL DEFAULT 0,
  post_score INTEGER NOT NULL DEFAULT 0,
  interaction_level INTEGER NOT NULL DEFAULT 1,
  conceptual_understanding INTEGER NOT NULL DEFAULT 1,
  participation INTEGER NOT NULL DEFAULT 1,
  cooperation INTEGER NOT NULL DEFAULT 1,
  focus INTEGER NOT NULL DEFAULT 1,
  distraction INTEGER NOT NULL DEFAULT 0,
  tardiness INTEGER NOT NULL DEFAULT 0,
  incompletion INTEGER NOT NULL DEFAULT 0,
  calculations INTEGER NOT NULL DEFAULT 0,
  concepts INTEGER NOT NULL DEFAULT 0,
  experiments INTEGER NOT NULL DEFAULT 0,
  assignment_scores INTEGER[] NOT NULL DEFAULT '{0,0,0,0,0}',
  test_scores INTEGER[] NOT NULL DEFAULT '{0,0,0}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public access (no auth system)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.students FOR DELETE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
