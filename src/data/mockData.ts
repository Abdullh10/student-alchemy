export interface Student {
  id: string;
  name: string;
  preScore: number;
  postScore: number;
  interactionLevel: number; // 1-5
  conceptualUnderstanding: number; // 1-5
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

export const students: Student[] = [
  {
    id: '1', name: 'أحمد محمد العتيبي',
    preScore: 45, postScore: 78,
    interactionLevel: 4, conceptualUnderstanding: 4,
    positiveBehaviors: { participation: 4, cooperation: 5, focus: 4 },
    negativeBehaviors: { distraction: 1, tardiness: 0, incompletion: 1 },
    skills: { calculations: 80, concepts: 75, experiments: 85 },
    assignmentScores: [85, 90, 78, 92, 88],
    testScores: [72, 80, 85],
  },
  {
    id: '2', name: 'فهد سعود الدوسري',
    preScore: 30, postScore: 55,
    interactionLevel: 2, conceptualUnderstanding: 2,
    positiveBehaviors: { participation: 2, cooperation: 3, focus: 2 },
    negativeBehaviors: { distraction: 4, tardiness: 3, incompletion: 3 },
    skills: { calculations: 40, concepts: 45, experiments: 50 },
    assignmentScores: [50, 45, 60, 55, 48],
    testScores: [40, 48, 55],
  },
  {
    id: '3', name: 'عبدالله خالد الشمري',
    preScore: 60, postScore: 88,
    interactionLevel: 5, conceptualUnderstanding: 5,
    positiveBehaviors: { participation: 5, cooperation: 5, focus: 5 },
    negativeBehaviors: { distraction: 0, tardiness: 0, incompletion: 0 },
    skills: { calculations: 90, concepts: 92, experiments: 88 },
    assignmentScores: [95, 92, 88, 96, 94],
    testScores: [88, 92, 95],
  },
  {
    id: '4', name: 'سلطان عبدالرحمن القحطاني',
    preScore: 35, postScore: 42,
    interactionLevel: 1, conceptualUnderstanding: 1,
    positiveBehaviors: { participation: 1, cooperation: 2, focus: 1 },
    negativeBehaviors: { distraction: 5, tardiness: 4, incompletion: 5 },
    skills: { calculations: 30, concepts: 25, experiments: 35 },
    assignmentScores: [30, 35, 28, 40, 32],
    testScores: [28, 35, 38],
  },
  {
    id: '5', name: 'محمد ناصر الحربي',
    preScore: 55, postScore: 72,
    interactionLevel: 3, conceptualUnderstanding: 3,
    positiveBehaviors: { participation: 3, cooperation: 4, focus: 3 },
    negativeBehaviors: { distraction: 2, tardiness: 1, incompletion: 2 },
    skills: { calculations: 65, concepts: 60, experiments: 70 },
    assignmentScores: [70, 65, 72, 68, 75],
    testScores: [60, 68, 72],
  },
  {
    id: '6', name: 'تركي يوسف المالكي',
    preScore: 70, postScore: 85,
    interactionLevel: 4, conceptualUnderstanding: 4,
    positiveBehaviors: { participation: 4, cooperation: 4, focus: 5 },
    negativeBehaviors: { distraction: 1, tardiness: 0, incompletion: 0 },
    skills: { calculations: 82, concepts: 85, experiments: 80 },
    assignmentScores: [88, 85, 90, 82, 87],
    testScores: [80, 85, 88],
  },
  {
    id: '7', name: 'عمر بندر الزهراني',
    preScore: 25, postScore: 38,
    interactionLevel: 1, conceptualUnderstanding: 2,
    positiveBehaviors: { participation: 2, cooperation: 1, focus: 1 },
    negativeBehaviors: { distraction: 4, tardiness: 5, incompletion: 4 },
    skills: { calculations: 25, concepts: 30, experiments: 28 },
    assignmentScores: [25, 30, 35, 28, 22],
    testScores: [22, 30, 35],
  },
  {
    id: '8', name: 'ياسر فيصل العنزي',
    preScore: 50, postScore: 65,
    interactionLevel: 3, conceptualUnderstanding: 3,
    positiveBehaviors: { participation: 3, cooperation: 3, focus: 3 },
    negativeBehaviors: { distraction: 2, tardiness: 2, incompletion: 2 },
    skills: { calculations: 58, concepts: 62, experiments: 55 },
    assignmentScores: [62, 58, 65, 60, 63],
    testScores: [55, 60, 65],
  },
];

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
