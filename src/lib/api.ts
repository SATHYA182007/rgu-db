import { supabase } from './supabase';
import { Student, ExamResult } from '@/types';

// ─── Students ─────────────────────────────────────────────────────────────────
export async function fetchStudents(tableName: string): Promise<Student[]> {
  const courseId = tableName.replace('_students', '');
  
  // Get total count of matching student rows first (very fast head-only query)
  const { count, error: countError } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .or(`course.ilike.${courseId},course_category.ilike.${courseId}`);

  if (countError) {
    console.error(`[API] fetchStudents count error on ${tableName}:`, countError.message);
    throw new Error(countError.message);
  }

  const totalCount = count || 0;
  const targetCount = totalCount; // Fetch all matching records with no upper limit
  
  if (targetCount === 0) {
    return [];
  }

  const chunkSize = 1000;
  const chunkPromises = [];

  for (let from = 0; from < targetCount; from += chunkSize) {
    const to = Math.min(from + chunkSize - 1, targetCount - 1);
    chunkPromises.push(
      supabase
        .from('students')
        .select('*')
        .or(`course.ilike.${courseId},course_category.ilike.${courseId}`)
        .order('created_at', { ascending: false })
        .range(from, to)
    );
  }

  const chunkResults = await Promise.all(chunkPromises);
  let allData: any[] = [];

  for (const { data, error } of chunkResults) {
    if (error) {
      console.error(`[API] fetchStudents chunk error on ${tableName}:`, error.message);
      throw new Error(error.message);
    }
    if (data) {
      allData = allData.concat(data);
    }
  }

  // Deduplicate by student ID to handle concurrent inserts gracefully
  const uniqueData = Array.from(new Map(allData.map(item => [item.id, item])).values());

  const mapped = uniqueData.map(s => ({
    ...s,
    mobile: s.phone,
    group_12th: s.group12th,
    marks_12th: Number(s.marks12 ?? 0),
    marks_10th: Number(s.marks10 ?? 0),
    percentage_12th: Number(s.score12 ?? 0),
    percentage_10th: Number(s.score10 ?? 0),
    course: courseId, // Always map to the correct lowercase course context
    application_no: s.application_no ?? (s.phone ? Number(s.phone.slice(-6)) : Math.floor(Math.random() * 900000) + 100000),
  }));

  return mapped as Student[];
}

// ─── Exam Results ─────────────────────────────────────────────────────────────
export async function fetchExamResults(_tableName: string): Promise<ExamResult[]> {
  // Get total count of exam results first (very fast head-only query)
  const { count, error: countError } = await supabase
    .from('exam_results')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error(`[API] fetchExamResults count error:`, countError.message);
    throw new Error(countError.message);
  }

  const totalCount = count || 0;
  const targetCount = totalCount; // Fetch all records with no upper limit

  if (targetCount === 0) {
    return [];
  }

  const chunkSize = 1000;
  const chunkPromises = [];

  for (let from = 0; from < targetCount; from += chunkSize) {
    const to = Math.min(from + chunkSize - 1, targetCount - 1);
    chunkPromises.push(
      supabase
        .from('exam_results')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)
    );
  }

  const chunkResults = await Promise.all(chunkPromises);
  let allData: any[] = [];

  for (const { data, error } of chunkResults) {
    if (error) {
      console.error(`[API] fetchExamResults chunk error:`, error.message);
      throw new Error(error.message);
    }
    if (data) {
      allData = allData.concat(data);
    }
  }

  // Deduplicate by exam result ID to handle concurrent inserts gracefully
  const uniqueData = Array.from(new Map(allData.map(item => [item.id, item])).values());

  const mapped = uniqueData.map(r => {
    const rawAnswers = r.raw_answers && typeof r.raw_answers === 'object' ? r.raw_answers : {};
    
    // 1. Gather score properties from raw_answers (seeded/mock fallback)
    const seedScores: Record<string, number> = {};
    Object.entries(rawAnswers).forEach(([k, v]) => {
      if (k.endsWith('_score')) {
        seedScores[k] = Number(v ?? 0);
      }
    });

    // 2. Map from section_scores (real database structure)
    const sectionScores = r.section_scores && typeof r.section_scores === 'object' ? r.section_scores : {};
    const parsedScores: Record<string, number> = {};
    
    const keyMap: Record<string, string> = {
      'physics': 'physics_score',
      'chemistry': 'chemistry_score',
      'mathematics': 'mathematics_score',
      'techawareness': 'tech_awareness_score',
      'techawarness': 'tech_awareness_score', // Handle typo in user's DB
      'aptitude': 'aptitude_score',
      'communication': 'communication_score',
      'programming': 'programming_score',
      'accounts': 'accounts_score',
      'commerce': 'commerce_score',
      'logicalreasoning': 'logical_reasoning_score',
      'generalawareness': 'general_awareness_score',
      'verbalability': 'verbal_ability_score',
      'comprehensivereading': 'comprehensive_reading_score',
      'managerialaptitude': 'managerial_aptitude_score',
      'aiknowledge': 'ai_knowledge_score',
      'mcacoreaptitude': 'mca_core_aptitude_score',
    };

    Object.entries(sectionScores).forEach(([dbKey, val]) => {
      const normalized = dbKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mappedKey = keyMap[normalized];
      if (mappedKey) {
        parsedScores[mappedKey] = Number(val ?? 0);
      } else {
        parsedScores[`${normalized}_score`] = Number(val ?? 0);
      }
    });

    // 3. Normalize band format (e.g., "Emerging Band" -> "EMERGING")
    let normalizedBand = r.band || null;
    if (normalizedBand) {
      const bUpper = normalizedBand.toUpperCase();
      if (bUpper.includes('DISTINGUISHED')) normalizedBand = 'DISTINGUISHED';
      else if (bUpper.includes('PROFICIENT')) normalizedBand = 'PROFICIENT';
      else if (bUpper.includes('ADVANCED')) normalizedBand = 'ADVANCED';
      else if (bUpper.includes('EMERGING')) normalizedBand = 'EMERGING';
    }

    return {
      ...r,
      ...rawAnswers,
      ...seedScores,
      ...parsedScores,
      band: normalizedBand,
      completed_at: r.created_at || new Date().toISOString(),
    };
  });

  return mapped as ExamResult[];
}

// ─── Update Student ───────────────────────────────────────────────────────────
export async function updateStudentData(
  _tableName: string,
  studentId: string,
  updates: Partial<Student>
): Promise<void> {
  const dbUpdates: Record<string, any> = {};

  if (updates.mobile !== undefined) dbUpdates.phone = updates.mobile;
  if (updates.group_12th !== undefined) dbUpdates.group12th = updates.group_12th;
  if (updates.marks_12th !== undefined) dbUpdates.marks12 = updates.marks_12th;
  if (updates.marks_10th !== undefined) dbUpdates.marks10 = updates.marks_10th;
  if (updates.percentage_12th !== undefined) dbUpdates.score12 = updates.percentage_12th;
  if (updates.percentage_10th !== undefined) dbUpdates.score10 = updates.percentage_10th;

  const standardFields: (keyof Student)[] = [
    'name', 'father_name', 'dob', 'gender', 'email', 'state', 'city', 'ug_status', 'ug_score'
  ];
  for (const field of standardFields) {
    if (updates[field] !== undefined) {
      dbUpdates[field as string] = updates[field];
    }
  }

  const { error } = await supabase
    .from('students')
    .update(dbUpdates)
    .eq('id', studentId);

  if (error) {
    console.error(`[API] updateStudentData error on students:`, error.message);
    throw new Error(error.message);
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────
export function getLatestResult(
  studentId: string,
  results: ExamResult[]
): ExamResult | null {
  const studentResults = results
    .filter(r => r.student_id === studentId)
    .sort(
      (a, b) =>
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );
  return studentResults[0] ?? null;
}
