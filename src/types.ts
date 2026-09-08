// ─── Enums & Union Types ───────────────────────────────────────────────────────
export type ExamStatus = 'Evaluated' | 'Malpractice';
export type RankingBand = 'DISTINGUISHED' | 'PROFICIENT' | 'ADVANCED' | 'EMERGING';

// ─── Student ──────────────────────────────────────────────────────────────────
export type Student = {
  id: string;
  created_at: string;
  name: string;
  father_name: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  state: string;
  city: string;
  group_12th: string;
  marks_12th: number;
  marks_10th: number;
  percentage_12th: number;
  percentage_10th: number;
  course: string;
  application_no: number;
  ug_status: string;
  ug_score: number | null;
  exam_set: string;
  exam_source: string | null;
};

// ─── Exam Result (supports all courses dynamically) ──────────────────────────
export type ExamResult = {
  id: string;
  student_id: string;
  exam_set: string;

  // BBA / MBA / MCA Shared
  logical_reasoning_score?: number;
  verbal_ability_score?: number;

  // BBA specific
  general_awareness_score?: number;
  comprehensive_reading_score?: number;

  // Engineering specific
  physics_score?: number;
  chemistry_score?: number;

  // Engineering & Arts shared
  mathematics_score?: number;
  tech_awareness_score?: number;
  aptitude_score?: number;
  communication_score?: number;
  programming_score?: number;

  // Arts specific
  accounts_score?: number;
  commerce_score?: number;

  // MBA specific
  managerial_aptitude_score?: number;
  ai_knowledge_score?: number;

  // MCA specific
  mca_core_aptitude_score?: number;

  total_score: number;
  percentage: number;
  status: ExamStatus;
  raw_answers: Record<string, string>;
  ai_feedback: string;
  completed_at: string;
  band: RankingBand | null;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
export const COURSE_LABELS: Record<string, string> = {
  bba: 'BBA',
  arts_science: 'Arts & Science',
  mba: 'MBA',
  engineering: 'Engineering',
  mca: 'MCA',
  bca: 'BCA',
  bcom: 'B.Com',
};

export function formatCourse(course: string): string {
  return COURSE_LABELS[course] ?? course?.toUpperCase() ?? '—';
}

export function getRankingBand(percentage: number): RankingBand {
  const dist = Number(localStorage.getItem('rgu_cutoff_distinguished') || '76');
  const prof = Number(localStorage.getItem('rgu_cutoff_proficient') || '51');
  const adv = Number(localStorage.getItem('rgu_cutoff_advanced') || '26');

  if (percentage >= dist) return 'DISTINGUISHED';
  if (percentage >= prof) return 'PROFICIENT';
  if (percentage >= adv) return 'ADVANCED';
  return 'EMERGING';
}

export function getSafeRankingBand(band: string | null | undefined, percentage: number): RankingBand {
  const validBands: RankingBand[] = ['DISTINGUISHED', 'PROFICIENT', 'ADVANCED', 'EMERGING'];
  if (band && validBands.includes(band as RankingBand)) {
    return band as RankingBand;
  }
  return getRankingBand(percentage);
}

export const RANKING_BAND_STYLES: Record<RankingBand, string> = {
  DISTINGUISHED: 'bg-purple-100 text-purple-700 border border-purple-200',
  PROFICIENT: 'bg-blue-100 text-blue-700 border border-blue-200',
  ADVANCED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  EMERGING: 'bg-orange-100 text-orange-700 border border-orange-200',
};

export const BAND_DISPLAY: Record<RankingBand, string> = {
  DISTINGUISHED: 'Distinguished',
  PROFICIENT: 'Proficient',
  ADVANCED: 'Advanced',
  EMERGING: 'Emerging',
};
