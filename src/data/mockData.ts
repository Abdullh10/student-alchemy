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

// Seed random for consistent academic scores
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
  "عبدالاله بن عمربن رياض بن الجيرودي",
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

// Real behavioral data from ClassDojo report
// Columns: participation(المشاركة), cooperation(مساعدة+عمل جماعي), focus(مندمج+استمرار+يعمل بجد)
// distraction(كلام أثناء الشرح), tardiness(نوم), incompletion(لم يشارك+تحويل مرشد)
interface BehaviorData {
  participation: number;
  cooperation: number;
  focus: number;
  distraction: number;
  tardiness: number;
  incompletion: number;
  positiveTotal: number;
  negativeTotal: number;
  positivePercent: number;
}

const cap = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const realBehaviorData: Record<string, BehaviorData> = {
  "إبراهيم بن عبدالله بن عبدالجليل البريكان": { participation: 4, cooperation: 1, focus: 1, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 5, negativeTotal: 0, positivePercent: 100 },
  "أصيل بن أحمد بن آدم الهوساوي": { participation: 5, cooperation: 0, focus: 1, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 6, negativeTotal: 0, positivePercent: 100 },
  "أيوب بن عدنان بن خرشان الزهراني": { participation: 5, cooperation: 0, focus: 1, distraction: 1, tardiness: 0, incompletion: 0, positiveTotal: 8, negativeTotal: 1, positivePercent: 89 },
  "باسل بن هشبل بن ظافر العمار الشهراني": { participation: 5, cooperation: 0, focus: 0, distraction: 1, tardiness: 0, incompletion: 0, positiveTotal: 5, negativeTotal: 1, positivePercent: 83 },
  "بدر بن ناجح بن مطلق القفيعي": { participation: 4, cooperation: 0, focus: 1, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 5, negativeTotal: 0, positivePercent: 100 },
  "تميم بن هايس بن مذود النماصي الشمري": { participation: 4, cooperation: 0, focus: 1, distraction: 3, tardiness: 0, incompletion: 0, positiveTotal: 5, negativeTotal: 3, positivePercent: 63 },
  "حمد بن محمد بن علي الغاوي": { participation: 2, cooperation: 0, focus: 1, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 3, negativeTotal: 0, positivePercent: 100 },
  "خالد بن عثمان بن غزاي الميموني المطيري": { participation: 0, cooperation: 0, focus: 0, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 0, negativeTotal: 0, positivePercent: 0 },
  "خالد بن مبارك بن خالد المستحي": { participation: 0, cooperation: 0, focus: 1, distraction: 0, tardiness: 2, incompletion: 0, positiveTotal: 1, negativeTotal: 2, positivePercent: 33 },
  "راشد بن ماجد بن محمد ابوعشبه": { participation: 1, cooperation: 0, focus: 1, distraction: 0, tardiness: 5, incompletion: 0, positiveTotal: 2, negativeTotal: 6, positivePercent: 25 },
  "سعود بن وادي بن هدمول الشمري": { participation: 4, cooperation: 0, focus: 1, distraction: 5, tardiness: 5, incompletion: 0, positiveTotal: 5, negativeTotal: 12, positivePercent: 29 },
  "سعيد بن ماجد بن سعيد القمعري الغامدي": { participation: 3, cooperation: 0, focus: 0, distraction: 1, tardiness: 0, incompletion: 1, positiveTotal: 3, negativeTotal: 2, positivePercent: 60 },
  "سلطان بن سليم بن خلف المضيبري الرشيدي": { participation: 3, cooperation: 0, focus: 1, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 4, negativeTotal: 0, positivePercent: 100 },
  "عبدالاله بن عمربن رياض بن الجيرودي": { participation: 3, cooperation: 0, focus: 1, distraction: 1, tardiness: 0, incompletion: 0, positiveTotal: 4, negativeTotal: 1, positivePercent: 80 },
  "عبدالكريم بن سلطان بن سامي الشمري": { participation: 5, cooperation: 1, focus: 0, distraction: 1, tardiness: 0, incompletion: 0, positiveTotal: 6, negativeTotal: 1, positivePercent: 86 },
  "عبدالله بن علي بن سعيد الغامدي": { participation: 4, cooperation: 1, focus: 0, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 5, negativeTotal: 0, positivePercent: 100 },
  "عبدالله بن محمد بن ظافر العمري": { participation: 0, cooperation: 1, focus: 0, distraction: 4, tardiness: 0, incompletion: 0, positiveTotal: 1, negativeTotal: 4, positivePercent: 20 },
  "علي بن سالم بن حسن الاحمد البوعينين": { participation: 5, cooperation: 0, focus: 0, distraction: 2, tardiness: 0, incompletion: 0, positiveTotal: 6, negativeTotal: 2, positivePercent: 75 },
  "علي بن سعيد بن علي الشهراني": { participation: 1, cooperation: 0, focus: 1, distraction: 3, tardiness: 0, incompletion: 0, positiveTotal: 2, negativeTotal: 3, positivePercent: 40 },
  "فلاح بن ناصر بن فلاح السهلي": { participation: 5, cooperation: 0, focus: 0, distraction: 0, tardiness: 2, incompletion: 0, positiveTotal: 5, negativeTotal: 2, positivePercent: 71 },
  "فهد بن موفق بن برجس العتيبي": { participation: 5, cooperation: 1, focus: 0, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 9, negativeTotal: 0, positivePercent: 100 },
  "محمد بن سعيد بن صالح الحداد": { participation: 5, cooperation: 0, focus: 1, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 8, negativeTotal: 0, positivePercent: 100 },
  "محمد بن سعيد بن علي الشهراني": { participation: 3, cooperation: 0, focus: 0, distraction: 1, tardiness: 0, incompletion: 1, positiveTotal: 3, negativeTotal: 2, positivePercent: 60 },
  "محمد بن فهيد بن محمد الدبيان": { participation: 2, cooperation: 0, focus: 0, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 2, negativeTotal: 0, positivePercent: 100 },
  "محمد بن مبارك بن محمد اليامي": { participation: 1, cooperation: 0, focus: 1, distraction: 0, tardiness: 4, incompletion: 0, positiveTotal: 2, negativeTotal: 4, positivePercent: 33 },
  "مشاري بن بدر بن ناصر الشملان": { participation: 2, cooperation: 0, focus: 0, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 2, negativeTotal: 0, positivePercent: 100 },
  "مشاري بن عادل بن عوض آل سرحان": { participation: 5, cooperation: 1, focus: 2, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 8, negativeTotal: 0, positivePercent: 100 },
  "منصور بن حسين بن منصور آل سدران": { participation: 1, cooperation: 0, focus: 0, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 1, negativeTotal: 0, positivePercent: 100 },
  "مهند بن علي بن صالح المقبول": { participation: 2, cooperation: 0, focus: 0, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 2, negativeTotal: 0, positivePercent: 100 },
  "يزن بن سلطان بن مناع البعيجي": { participation: 4, cooperation: 1, focus: 0, distraction: 0, tardiness: 5, incompletion: 2, positiveTotal: 5, negativeTotal: 10, positivePercent: 33 },
  "يزيد بن عبدالله بن سعيد الشهراني": { participation: 4, cooperation: 2, focus: 1, distraction: 1, tardiness: 0, incompletion: 0, positiveTotal: 7, negativeTotal: 1, positivePercent: 88 },
  "يوسف بن صالح بن مضحي الفدعاني العنزي": { participation: 0, cooperation: 0, focus: 0, distraction: 0, tardiness: 0, incompletion: 0, positiveTotal: 0, negativeTotal: 0, positivePercent: 0 },
};

// Normalize raw ClassDojo counts to 1-5 (positive) or 0-5 (negative) scales
function normPos(val: number, maxRaw: number): number {
  if (maxRaw === 0) return 1;
  return cap(Math.round((val / maxRaw) * 5), 1, 5);
}
function normNeg(val: number): number {
  return cap(val, 0, 5);
}

export const students: Student[] = studentNames.map((name, i) => {
  const b = realBehaviorData[name];
  // Max participation raw in dataset is ~8, cooperation ~2, focus ~2
  const participation = b ? cap(Math.ceil(b.participation * 5 / 8), 1, 5) : sr(1, 5);
  const cooperation = b ? cap(b.cooperation >= 2 ? 5 : b.cooperation === 1 ? 3 : 1, 1, 5) : sr(1, 5);
  const focus = b ? cap(b.focus >= 2 ? 5 : b.focus === 1 ? 3 : 1, 1, 5) : sr(1, 5);
  const distraction = b ? normNeg(b.distraction) : sr(0, 5);
  const tardiness = b ? normNeg(b.tardiness) : sr(0, 5);
  const incompletion = b ? normNeg(b.incompletion) : sr(0, 5);

  // Derive interaction level from positive percentage
  const interactionLevel = b ? cap(Math.round(b.positivePercent / 20), 1, 5) : sr(1, 5);

  return {
    id: String(i + 1),
    name,
    preScore: sr(25, 75),
    postScore: sr(35, 95),
    interactionLevel,
    conceptualUnderstanding: sr(1, 5),
    positiveBehaviors: { participation, cooperation, focus },
    negativeBehaviors: { distraction, tardiness, incompletion },
    skills: {
      calculations: sr(20, 95),
      concepts: sr(20, 95),
      experiments: sr(20, 95),
    },
    assignmentScores: Array.from({ length: 5 }, () => sr(20, 100)),
    testScores: Array.from({ length: 3 }, () => sr(20, 100)),
  };
});

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
