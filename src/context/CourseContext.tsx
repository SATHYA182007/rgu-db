import React, { createContext, useContext, useState, useEffect } from 'react';

export type CourseId = 'bba' | 'engineering' | 'arts_science' | 'mba' | 'mca';

export interface SectionConfig {
  key: string;
  label: string;
  max: number;
}

export interface CourseConfig {
  id: CourseId;
  label: string;
  studentsTable: string;
  examResultsTable: string;
  sections: SectionConfig[];
}

export const COURSE_CONFIGS: Record<CourseId, CourseConfig> = {
  bba: {
    id: 'bba',
    label: 'BBA',
    studentsTable: 'bba_students',
    examResultsTable: 'bba_exam_results',
    sections: [
      { key: 'logical_reasoning_score', label: 'Logical Reasoning', max: 25 },
      { key: 'general_awareness_score', label: 'General Awareness', max: 25 },
      { key: 'verbal_ability_score', label: 'Verbal Ability', max: 25 },
      { key: 'comprehensive_reading_score', label: 'Comprehensive Reading', max: 25 },
    ],
  },
  engineering: {
    id: 'engineering',
    label: 'Engineering',
    studentsTable: 'engineering_students',
    examResultsTable: 'engineering_exam_results',
    sections: [
      { key: 'physics_score', label: 'Physics', max: 10 },
      { key: 'chemistry_score', label: 'Chemistry', max: 10 },
      { key: 'mathematics_score', label: 'Mathematics', max: 15 },
      { key: 'tech_awareness_score', label: 'Tech Awareness', max: 5 },
      { key: 'aptitude_score', label: 'Aptitude', max: 25 },
      { key: 'communication_score', label: 'Communication', max: 15 },
      { key: 'programming_score', label: 'Programming', max: 20 },
    ],
  },
  arts_science: {
    id: 'arts_science',
    label: 'Arts & Science',
    studentsTable: 'arts_science_students',
    examResultsTable: 'arts_science_exam_results',
    sections: [
      { key: 'accounts_score', label: 'Accounts', max: 10 },
      { key: 'commerce_score', label: 'Commerce', max: 10 },
      { key: 'mathematics_score', label: 'Mathematics', max: 15 },
      { key: 'tech_awareness_score', label: 'Tech Awareness', max: 5 },
      { key: 'aptitude_score', label: 'Aptitude', max: 25 },
      { key: 'communication_score', label: 'Communication', max: 15 },
      { key: 'programming_score', label: 'Programming', max: 20 },
    ],
  },
  mba: {
    id: 'mba',
    label: 'MBA',
    studentsTable: 'mba_students',
    examResultsTable: 'mba_exam_results',
    sections: [
      { key: 'logical_reasoning_score', label: 'Logical Reasoning', max: 25 },
      { key: 'managerial_aptitude_score', label: 'Managerial Aptitude', max: 25 },
      { key: 'ai_knowledge_score', label: 'AI Knowledge', max: 25 },
      { key: 'verbal_ability_score', label: 'Verbal Ability', max: 25 },
    ],
  },
  mca: {
    id: 'mca',
    label: 'MCA',
    studentsTable: 'mca_students',
    examResultsTable: 'mca_exam_results',
    sections: [
      { key: 'logical_reasoning_score', label: 'Logical Reasoning', max: 25 },
      { key: 'mca_core_aptitude_score', label: 'MCA Core Aptitude', max: 25 },
      { key: 'ai_knowledge_score', label: 'AI Knowledge', max: 25 },
      { key: 'verbal_ability_score', label: 'Verbal Ability', max: 25 },
    ],
  },
};

interface CourseContextType {
  currentCourse: CourseId;
  setCurrentCourse: (course: CourseId) => void;
  config: CourseConfig;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [currentCourse, setCurrentCourseState] = useState<CourseId>(() => {
    const saved = localStorage.getItem('rgu_active_course');
    return (saved as CourseId) || 'bba';
  });

  const setCurrentCourse = (course: CourseId) => {
    setCurrentCourseState(course);
    localStorage.setItem('rgu_active_course', course);
  };

  const config = COURSE_CONFIGS[currentCourse];

  return (
    <CourseContext.Provider value={{ currentCourse, setCurrentCourse, config }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}
