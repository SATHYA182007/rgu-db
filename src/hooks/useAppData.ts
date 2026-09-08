import { useState, useEffect } from 'react';
import { Student, ExamResult } from '@/types';
import { useCourse } from '@/context/CourseContext';
import {
  fetchStudents,
  fetchExamResults,
  getLatestResult,
  updateStudentData as apiUpdateStudentData,
} from '@/lib/api';

interface AppData {
  students: Student[];
  examResults: ExamResult[];
  loading: boolean;
  error: string | null;
  getLatestExamResult: (studentId: string) => ExamResult | null;
  reload: () => void;
  updateStudent: (studentId: string, updates: Partial<Student>) => Promise<void>;
}

export function useAppData(): AppData {
  const { config } = useCourse();
  const [students, setStudents] = useState<Student[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchStudents(config.studentsTable),
      fetchExamResults(config.examResultsTable),
    ])
      .then(([s, e]) => {
        if (!cancelled) {
          setStudents(s);
          // Filter exam results to only include those belonging to students of the current course context
          const studentIds = new Set(s.map(student => student.id));
          const filteredExams = e.filter(exam => studentIds.has(exam.student_id));
          setExamResults(filteredExams);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message ?? `Failed to load data for ${config.label}`);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [config.studentsTable, config.examResultsTable, tick]);

  const reload = () => setTick(t => t + 1);

  const updateStudent = async (studentId: string, updates: Partial<Student>) => {
    await apiUpdateStudentData(config.studentsTable, studentId, updates);
    reload();
  };

  return {
    students,
    examResults,
    loading,
    error,
    getLatestExamResult: (id) => getLatestResult(id, examResults),
    reload,
    updateStudent,
  };
}
