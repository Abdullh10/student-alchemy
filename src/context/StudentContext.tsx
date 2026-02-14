import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { students as initialStudents, type Student, getStudentCategory, type StudentCategory } from "@/data/mockData";
import { toast } from "sonner";

interface StudentContextType {
  students: Student[];
  loading: boolean;
  addStudent: (name: string) => void;
  deleteStudent: (id: string) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  updateBehavior: (id: string, field: string, value: number) => void;
  updateSkill: (id: string, field: string, value: number) => void;
  updateScore: (id: string, field: "preScore" | "postScore", value: number) => void;
}

const StudentContext = createContext<StudentContextType | null>(null);

export function useStudents() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudents must be used within StudentProvider");
  return ctx;
}

// Map DB row to Student object
function dbToStudent(row: any): Student {
  return {
    id: row.id,
    name: row.name,
    preScore: row.pre_score,
    postScore: row.post_score,
    interactionLevel: row.interaction_level,
    conceptualUnderstanding: row.conceptual_understanding,
    positiveBehaviors: {
      participation: row.participation,
      cooperation: row.cooperation,
      focus: row.focus,
    },
    negativeBehaviors: {
      distraction: row.distraction,
      tardiness: row.tardiness,
      incompletion: row.incompletion,
    },
    skills: {
      calculations: row.calculations,
      concepts: row.concepts,
      experiments: row.experiments,
    },
    assignmentScores: row.assignment_scores || [0, 0, 0, 0, 0],
    testScores: row.test_scores || [0, 0, 0],
  };
}

// Map Student to DB insert object
function studentToDb(s: Student) {
  return {
    name: s.name,
    pre_score: s.preScore,
    post_score: s.postScore,
    interaction_level: s.interactionLevel,
    conceptual_understanding: s.conceptualUnderstanding,
    participation: s.positiveBehaviors.participation,
    cooperation: s.positiveBehaviors.cooperation,
    focus: s.positiveBehaviors.focus,
    distraction: s.negativeBehaviors.distraction,
    tardiness: s.negativeBehaviors.tardiness,
    incompletion: s.negativeBehaviors.incompletion,
    calculations: s.skills.calculations,
    concepts: s.skills.concepts,
    experiments: s.skills.experiments,
    assignment_scores: s.assignmentScores,
    test_scores: s.testScores,
  };
}

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Load students from DB on mount, seed if empty
  useEffect(() => {
    async function loadStudents() {
      const { data, error } = await supabase.from("students" as any).select("*").order("created_at", { ascending: true });
      if (error) {
        console.error("Error loading students:", error);
        setStudents([...initialStudents]);
        setLoading(false);
        return;
      }
      if (data && data.length > 0) {
        setStudents(data.map(dbToStudent));
      } else {
        // Seed with initial data
        const inserts = initialStudents.map(studentToDb);
        const { data: seeded, error: seedError } = await supabase.from("students" as any).insert(inserts).select();
        if (seedError) {
          console.error("Error seeding:", seedError);
          setStudents([...initialStudents]);
        } else if (seeded) {
          setStudents(seeded.map(dbToStudent));
        }
      }
      setLoading(false);
    }
    loadStudents();
  }, []);

  const addStudent = useCallback(async (name: string) => {
    const newStudent = studentToDb({
      id: "",
      name,
      preScore: 0,
      postScore: 0,
      interactionLevel: 1,
      conceptualUnderstanding: 1,
      positiveBehaviors: { participation: 1, cooperation: 1, focus: 1 },
      negativeBehaviors: { distraction: 0, tardiness: 0, incompletion: 0 },
      skills: { calculations: 0, concepts: 0, experiments: 0 },
      assignmentScores: [0, 0, 0, 0, 0],
      testScores: [0, 0, 0],
    });
    const { data, error } = await supabase.from("students" as any).insert(newStudent).select().single();
    if (error) {
      toast.error("خطأ في إضافة الطالب");
      return;
    }
    setStudents(prev => [...prev, dbToStudent(data)]);
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    const { error } = await supabase.from("students" as any).delete().eq("id", id);
    if (error) {
      toast.error("خطأ في حذف الطالب");
      return;
    }
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateStudent = useCallback(async (id: string, updates: Partial<Student>) => {
    const dbUpdates: any = {};
    if (updates.interactionLevel !== undefined) dbUpdates.interaction_level = updates.interactionLevel;
    if (updates.conceptualUnderstanding !== undefined) dbUpdates.conceptual_understanding = updates.conceptualUnderstanding;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.preScore !== undefined) dbUpdates.pre_score = updates.preScore;
    if (updates.postScore !== undefined) dbUpdates.post_score = updates.postScore;

    const { error } = await supabase.from("students" as any).update(dbUpdates).eq("id", id);
    if (error) {
      toast.error("خطأ في تحديث البيانات");
      return;
    }
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const updateBehavior = useCallback(async (id: string, field: string, value: number) => {
    const dbField = field; // field names match DB columns
    const { error } = await supabase.from("students" as any).update({ [dbField]: value }).eq("id", id);
    if (error) {
      toast.error("خطأ في تحديث السلوك");
      return;
    }
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      const posFields = ["participation", "cooperation", "focus"];
      const negFields = ["distraction", "tardiness", "incompletion"];
      if (posFields.includes(field)) {
        return { ...s, positiveBehaviors: { ...s.positiveBehaviors, [field]: value } };
      }
      if (negFields.includes(field)) {
        return { ...s, negativeBehaviors: { ...s.negativeBehaviors, [field]: value } };
      }
      return s;
    }));
  }, []);

  const updateSkill = useCallback(async (id: string, field: string, value: number) => {
    const { error } = await supabase.from("students" as any).update({ [field]: value }).eq("id", id);
    if (error) {
      toast.error("خطأ في تحديث المهارة");
      return;
    }
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      return { ...s, skills: { ...s.skills, [field]: value } };
    }));
  }, []);

  const updateScore = useCallback(async (id: string, field: "preScore" | "postScore", value: number) => {
    const dbField = field === "preScore" ? "pre_score" : "post_score";
    const { error } = await supabase.from("students" as any).update({ [dbField]: value }).eq("id", id);
    if (error) {
      toast.error("خطأ في تحديث الدرجة");
      return;
    }
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }, []);

  return (
    <StudentContext.Provider value={{ students, loading, addStudent, deleteStudent, updateStudent, updateBehavior, updateSkill, updateScore }}>
      {children}
    </StudentContext.Provider>
  );
}
