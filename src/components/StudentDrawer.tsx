import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, BookOpen, GraduationCap, Phone, Mail, MapPin,
  AlertTriangle, CheckCircle2, Hash, Calendar, Clock, ShieldAlert, Activity, TrendingUp
} from 'lucide-react';
import { Student, ExamResult, RankingBand, RANKING_BAND_STYLES, BAND_DISPLAY, formatCourse } from '@/types';
import { useCourse } from '@/context/CourseContext';
import { Button } from '@/components/ui/button';

interface StudentDrawerProps {
  student: Student | null;
  examResult: ExamResult | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
}

export default function StudentDrawer({
  student,
  examResult,
  isOpen,
  onClose,
}: StudentDrawerProps) {
  const { config } = useCourse();
  if (!student) return null;

  const band: RankingBand = examResult?.band ?? 'EMERGING';

  const sections = examResult ? config.sections.map(sec => ({
    name: sec.label,
    val: Number(examResult[sec.key as keyof ExamResult] ?? 0),
    max: sec.max
  })) : [];

  const showFeedback = examResult?.ai_feedback &&
    examResult.ai_feedback.trim().replace(/^["']|["']$/g, '').trim().toLowerCase() !== "candidate shows proficiency across multiple sections.";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-2xl flex flex-col shadow-premium overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-card border-b border-border sticky top-0 z-10">
              <div>
                <h2 className="text-base font-bold text-foreground font-heading">Applicant Profile ({config.label})</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Application No: #{student.application_no}</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X size={18} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Profile Header */}
              <div className="bg-card rounded-2xl ring-1 ring-foreground/10 p-5 shadow-soft">
                <div className="flex gap-5 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                    {(student.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-foreground">{student.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Father: {student.father_name}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">
                        <BookOpen size={10} />{formatCourse(student.course)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-semibold">
                        <MapPin size={10} />{student.city}, {student.state}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-semibold">
                        <Activity size={10} />{student.gender}
                      </span>
                    </div>
                  </div>
                  {examResult && (
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${RANKING_BAND_STYLES[band]}`}>
                      {BAND_DISPLAY[band]}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact & Personal Details */}
              <div className="bg-card rounded-2xl ring-1 ring-foreground/10 p-5 shadow-soft space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact & Personal</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-muted-foreground">Mobile</p>
                      <p className="font-semibold text-foreground mt-0.5">{student.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground mt-0.5 truncate">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-muted-foreground">Date of Birth</p>
                      <p className="font-semibold text-foreground mt-0.5">{student.dob}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-muted-foreground">UG Status</p>
                      <p className="font-semibold text-foreground mt-0.5">{student.ug_status ?? '—'}</p>
                    </div>
                  </div>
                  {student.ug_score !== null && (
                    <div className="flex items-center gap-2">
                      <TrendingUp size={13} className="text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-muted-foreground">UG Score</p>
                        <p className="font-semibold text-foreground mt-0.5">{student.ug_score}</p>
                      </div>
                    </div>
                  )}
                  {student.exam_source && (
                    <div className="flex items-center gap-2">
                      <Hash size={13} className="text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-muted-foreground">Exam Source</p>
                        <p className="font-semibold text-foreground mt-0.5">{student.exam_source}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Portfolio */}
              <div className="bg-card rounded-2xl ring-1 ring-foreground/10 p-5 shadow-soft space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <GraduationCap size={15} className="text-primary" />
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">Academic Portfolio</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-lg font-bold text-foreground">{student.marks_10th}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">10th Marks</p>
                    <p className="text-xs font-semibold text-primary">{student.percentage_10th}%</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-lg font-bold text-foreground">{student.marks_12th}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">12th Marks</p>
                    <p className="text-xs font-semibold text-primary">{student.percentage_12th}%</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">12th Group</p>
                    <p className="text-sm font-bold text-foreground mt-1">{student.group_12th}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Stream</p>
                  </div>
                </div>
              </div>

              {/* Exam Results */}
              {examResult ? (
                <div className="bg-card rounded-2xl ring-1 ring-foreground/10 p-5 shadow-soft space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <Hash size={15} className="text-primary" />
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider">Exam Performance</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      examResult.status === 'Malpractice' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {examResult.status === 'Malpractice' ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                      {examResult.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-muted rounded-xl p-3">
                      <p className="text-2xl font-bold text-foreground">{examResult.total_score}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Total Score</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3">
                      <p className="text-2xl font-bold text-foreground">{(examResult.percentage || 0).toFixed(1)}%</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Percentage</p>
                    </div>
                    <div className={`rounded-xl p-3 ${RANKING_BAND_STYLES[band]}`}>
                      <p className="text-sm font-bold">{BAND_DISPLAY[band]}</p>
                      <p className="text-[10px] mt-0.5 opacity-80">Band</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Section Breakdown</p>
                    {sections.map(sec => (
                      <div key={sec.name} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-44 shrink-0">{sec.name}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(sec.val / sec.max) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground w-10 text-right">{sec.val}/{sec.max}</span>
                      </div>
                    ))}
                  </div>

                  {showFeedback && (
                    <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 space-y-1.5">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={12} /> AI Evaluation Feedback
                      </p>
                      <p className="text-xs text-foreground italic leading-relaxed">
                        "{examResult.ai_feedback}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted rounded-xl p-3">
                    <span className="flex items-center gap-1"><Hash size={11} /> Set: <span className="font-mono font-bold text-foreground ml-1 uppercase">{examResult.exam_set}</span></span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {new Date(examResult.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl ring-1 ring-border border-dashed p-8 text-center">
                  <AlertTriangle size={24} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No exam result recorded for this applicant yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
