export interface Student {
  id: string;
  name: string;
  preScore: number;
  postScore: number;
  interactionLevel: number;
  conceptualUnderstanding: number;
  positiveBehaviors: {
    participation: number;
    cooperation: number;
    focus: number;
  };
  negativeBehaviors: {
    distraction: number;
    tardiness: number;
    incompletion: number;
  };
  skills: {
    calculations: number;
    concepts: number;
    experiments: number;
  };
  assignmentScores: number[];
  testScores: number[];
}

export type StudentCategory = 'متفوق' | 'مستقر' | 'يحتاج متابعة' | 'يحتاج تدخل عاجل';

export function getStudentCategory(student: Student): StudentCategory {
  const avg = (student.preScore + student.postScore) / 2;
  const behaviorScore = (student.positiveBehaviors.participation + student.positiveBehaviors.cooperation + student.positiveBehaviors.focus) / 3;
  const negativeBehavior = (student.negativeBehaviors.distraction + student.negativeBehaviors.tardiness + student.negativeBehaviors.incompletion) / 3;
  const combined = avg * 0.6 + behaviorScore * 20 * 0.2 - negativeBehavior * 10 * 0.2;
  if (combined >= 80) return 'متفوق';
  if (combined >= 60) return 'مستقر';
  if (combined >= 40) return 'يحتاج متابعة';
  return 'يحتاج تدخل عاجل';
}

export function getCategoryColor(cat: StudentCategory): string {
  switch (cat) {
    case 'متفوق': return 'text-success';
    case 'مستقر': return 'text-info';
    case 'يحتاج متابعة': return 'text-warning';
    case 'يحتاج تدخل عاجل': return 'text-danger';
  }
}

export function getCategoryBg(cat: StudentCategory): string {
  switch (cat) {
    case 'متفوق': return 'gradient-card-success';
    case 'مستقر': return 'gradient-card-info';
    case 'يحتاج متابعة': return 'gradient-card-warning';
    case 'يحتاج تدخل عاجل': return 'gradient-card-danger';
  }
}

// Helper to generate random scores for demo
function r(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Seed random for consistency
let seed = 42;
function seededRandom() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
function sr(min: number, max: number) {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

const studentNames = [
  "إبراهيم بن عبدالله بن عبدالجليل البريكان",
  "أصيل بن أحمد بن آدم الهوساوي",
  "أيوب بن عدنان بن خرشان الزهراني",
  "باسل بن هشبل بن ظافر العمار الشهراني",
  "بدر بن ناجح بن مطلق القفيعي",
  "تميم بن هايس بن مذود النماصي الشمري",
  "حمد بن محمد بن علي الغاوي",
  "خالد بن عثمان بن غزاي الميموني المطيري",
  "خالد بن مبارك بن خالد المستحي",
  "راشد بن ماجد بن محمد ابوعشبه",
  "سعود بن وادي بن هدمول الشمري",
  "سعيد بن ماجد بن سعيد القمعري الغامدي",
  "سلطان بن سليم بن خلف المضيبري الرشيدي",
  "عبدالاله بن عمر بن رياض بن الجيرودي",
  "عبدالكريم بن سلطان بن سامي الشمري",
  "عبدالله بن علي بن سعيد الغامدي",
  "عبدالله بن محمد بن ظافر العمري",
  "علي بن سالم بن حسن الاحمد البوعينين",
  "علي بن سعيد بن علي الشهراني",
  "فلاح بن ناصر بن فلاح السهلي",
  "فهد بن موفق بن برجس العتيبي",
  "محمد بن سعيد بن صالح الحداد",
  "محمد بن سعيد بن علي الشهراني",
  "محمد بن فهيد بن محمد الدبيان",
  "محمد بن مبارك بن محمد اليامي",
  "مشاري بن بدر بن ناصر الشملان",
  "مشاري بن عادل بن عوض آل سرحان",
  "منصور بن حسين بن منصور آل سدران",
  "مهند بن علي بن صالح المقبول",
  "يزن بن سلطان بن مناع البعيجي",
  "يزيد بن عبدالله بن سعيد الشهراني",
  "يوسف بن صالح بن مضحي الفدعاني العنزي",
];

export const students: Student[] = studentNames.map((name, i) => ({
  id: String(i + 1),
  name,
  preScore: sr(25, 75),
  postScore: sr(35, 95),
  interactionLevel: sr(1, 5),
  conceptualUnderstanding: sr(1, 5),
  positiveBehaviors: {
    participation: sr(1, 5),
    cooperation: sr(1, 5),
    focus: sr(1, 5),
  },
  negativeBehaviors: {
    distraction: sr(0, 5),
    tardiness: sr(0, 5),
    incompletion: sr(0, 5),
  },
  skills: {
    calculations: sr(20, 95),
    concepts: sr(20, 95),
    experiments: sr(20, 95),
  },
  assignmentScores: Array.from({ length: 5 }, () => sr(20, 100)),
  testScores: Array.from({ length: 3 }, () => sr(20, 100)),
}));

export function getAverageScore(students: Student[]): number {
  return Math.round(students.reduce((sum, s) => sum + s.postScore, 0) / students.length);
}

export function getAtRiskStudents(students: Student[]): Student[] {
  return students.filter(s => {
    const cat = getStudentCategory(s);
    return cat === 'يحتاج متابعة' || cat === 'يحتاج تدخل عاجل';
  });
}

export function getBehaviorRecommendations(student: Student): string[] {
  const recs: string[] = [];
  if (student.negativeBehaviors.distraction >= 3) recs.push('تطبيق استراتيجية تقليل المشتتات وتغيير مكان الجلوس');
  if (student.negativeBehaviors.tardiness >= 3) recs.push('التواصل مع ولي الأمر بشأن الالتزام بالحضور');
  if (student.negativeBehaviors.incompletion >= 3) recs.push('تقسيم المهام إلى أجزاء صغيرة مع متابعة يومية');
  if (student.positiveBehaviors.participation <= 2) recs.push('تشجيع المشاركة من خلال أسئلة موجهة وتعزيز إيجابي');
  if (student.positiveBehaviors.cooperation <= 2) recs.push('إشراك الطالب في مجموعات تعلم تعاوني');
  if (recs.length === 0) recs.push('الطالب يظهر سلوكاً إيجابياً - استمرار في التعزيز');
  return recs;
}

export function getAcademicRecommendations(student: Student): string[] {
  const recs: string[] = [];
  if (student.skills.calculations < 50) recs.push('تقديم تمارين إضافية في الحسابات الكيميائية (المولات، التركيز)');
  if (student.skills.concepts < 50) recs.push('استخدام خرائط مفاهيمية ونماذج بصرية لتبسيط المفاهيم');
  if (student.skills.experiments < 50) recs.push('زيادة الأنشطة العملية والتجارب المخبرية المبسطة');
  if (student.postScore < 50) recs.push('تطبيق برنامج علاجي مكثف مع جلسات تقوية فردية');
  if (student.conceptualUnderstanding <= 2) recs.push('مراجعة المفاهيم الأساسية قبل التقدم للمواضيع الجديدة');
  if (recs.length === 0) recs.push('أداء أكاديمي جيد - تقديم أنشطة إثرائية للتميز');
  return recs;
}
