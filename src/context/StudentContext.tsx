import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { students as initialStudents, type Student, getStudentCategory, type StudentCategory } from "@/data/mockData";

interface StudentContextType {
  students: Student[];
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

let nextId = 100;

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() => [...initialStudents]);

  const addStudent = useCallback((name: string) => {
    const id = String(nextId++);
    const newStudent: Student = {
      id,
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
    };
    setStudents(prev => [...prev, newStudent]);
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const updateBehavior = useCallback((id: string, field: string, value: number) => {
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

  const updateSkill = useCallback((id: string, field: string, value: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      return { ...s, skills: { ...s.skills, [field]: value } };
    }));
  }, []);

  const updateScore = useCallback((id: string, field: "preScore" | "postScore", value: number) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }, []);

  return (
    <StudentContext.Provider value={{ students, addStudent, deleteStudent, updateStudent, updateBehavior, updateSkill, updateScore }}>
      {children}
    </StudentContext.Provider>
  );
}
