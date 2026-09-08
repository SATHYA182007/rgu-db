import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, ChevronLeft, ChevronRight, ChevronDown, MoreHorizontal, Download,
  CheckCircle2, RefreshCw, AlertCircle, ShieldAlert
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Student, ExamStatus, RankingBand, RANKING_BAND_STYLES, BAND_DISPLAY, formatCourse, getSafeRankingBand } from '@/types';
import StudentDrawer from '@/components/StudentDrawer';
import { useAppData } from '@/hooks/useAppData';
import { useCourse } from '@/context/CourseContext';

const examStatusColors: Record<ExamStatus, string> = {
  'Evaluated': 'bg-green-100 text-green-700 border border-green-200',
  'Malpractice': 'bg-red-100 text-red-700 border border-red-200',
};

type FilterStatus = ExamStatus | 'All' | 'Pending';
const ALL_STATUSES: FilterStatus[] = ['All', 'Evaluated', 'Malpractice', 'Pending'];
const PAGE_SIZE = 10;

export default function Students() {
  const { config } = useCourse();
  const { students, examResults, loading, error, reload, updateStudent } = useAppData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All');
  const [bandFilter, setBandFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;
  const selectedExamResult = examResults.find(r => r.id === selectedExamId) || null;

  const enrichedList = useMemo(() => {
    const list: any[] = [];

    // 1. Add all completed exams as individual applicant entries
    examResults.forEach(r => {
      const student = students.find(s => s.id === r.student_id);
      list.push({
        id: r.id, // Unique row ID (the exam result ID)
        studentId: r.student_id,
        name: student?.name ?? 'Unknown',
        application_no: student?.application_no ?? '—',
        gender: student?.gender ?? '—',
        course: student?.course ?? '',
        city: student?.city ?? '—',
        state: student?.state ?? '—',
        percentage_12th: student?.percentage_12th ?? 0,
        ug_status: student?.ug_status ?? '—',
        exam_set: r.exam_set,
        score: `${r.total_score}/100 (${(r.percentage || 0).toFixed(0)}%)`,
        status: r.status,
        band: getSafeRankingBand(r.band, r.percentage),
        hasExam: true,
        examResult: r,
        studentObj: student,
      });
    });

    // 2. Add students who have NO exam results (Pending status)
    students.forEach(s => {
      const hasExam = examResults.some(r => r.student_id === s.id);
      if (!hasExam) {
        list.push({
          id: `pending-${s.id}`,
          studentId: s.id,
          name: s.name,
          application_no: s.application_no,
          gender: s.gender,
          course: s.course,
          city: s.city,
          state: s.state,
          percentage_12th: s.percentage_12th,
          ug_status: s.ug_status,
          exam_set: s.exam_set ?? '—',
          score: '—',
          status: 'Pending',
          band: '—',
          hasExam: false,
          examResult: null,
          studentObj: s,
        });
      }
    });

    return list;
  }, [students, examResults]);

  const filtered = useMemo(() => {
    return enrichedList.filter(item => {
      const matchSearch =
        (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
        String(item.application_no || '').includes(search) ||
        (item.city || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.exam_set || '').toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Pending' && item.status === 'Pending') ||
        (item.hasExam && item.status === statusFilter);

      const matchBand =
        bandFilter === 'All' ||
        (item.hasExam && item.band === bandFilter);

      return matchSearch && matchStatus && matchBand;
    });
  }, [enrichedList, search, statusFilter, bandFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportToCSV = () => {
    const headers = [
      'Application No',
      'Name',
      'Gender',
      'Branch / Course',
      'City',
      'State',
      '12th %',
      '10th %',
      'UG Status',
      'Exam Set',
      'Total Score',
      'Percentage',
      'Exam Status',
      'Band',
      'Email',
      'Mobile',
    ];

    const rows = filtered.map(item => [
      item.application_no,
      item.name,
      item.gender,
      formatCourse(item.course),
      item.city,
      item.state,
      item.percentage_12th,
      item.studentObj?.percentage_10th ?? '—',
      item.ug_status ?? '—',
      item.exam_set,
      item.hasExam ? item.examResult?.total_score : '—',
      item.hasExam ? `${(item.examResult?.percentage ?? 0).toFixed(1)}%` : '—',
      item.status,
      item.hasExam ? (BAND_DISPLAY[item.band as RankingBand] ?? '—') : '—',
      item.studentObj?.email ?? '—',
      item.studentObj?.mobile ?? '—',
    ]);

    const escape = (val: unknown) => {
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const csvContent = [
      headers.map(escape).join(','),
      ...rows.map(row => row.map(escape).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${config.label.replace(/\s+/g, '_')}_applicants_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Consolidated Premium Header & Filter Card */}
      <Card className="overflow-hidden border border-border/80 shadow-sm rounded-xl bg-card py-0 gap-0">
        {/* Top Row: Title, Subtitle, and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/5 gap-3">
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              {config.label} Applicant Management
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              {loading ? 'Syncing...' : `${filtered.length} applicants`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1.5 text-xs font-semibold px-2.5 hover:bg-muted/80 transition-all duration-200" 
              onClick={reload}
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1.5 text-xs font-semibold px-2.5 hover:bg-muted/80 transition-all duration-200" 
              onClick={exportToCSV}
              disabled={filtered.length === 0}
            >
              <Download size={11} />
              Export CSV {filtered.length > 0 && `(${filtered.length})`}
            </Button>
          </div>
        </div>

        {/* Second Row: Integrated Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2 bg-card gap-3">
          {/* Left: Compact Search Bar */}
          <div className="relative w-full sm:w-60 md:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={12} />
            <Input
              className="pl-8 h-8 text-xs bg-background border border-border/80 rounded-lg placeholder:text-muted-foreground/50 w-full focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-neutral-400"
              placeholder="Search applicant..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Right: Dropdowns Group */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            {/* Status Selector */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold shrink-0">Status</span>
              <div className="relative w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
                  className="appearance-none pr-8 pl-3 h-8 text-xs rounded-lg border border-border/80 bg-background font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto cursor-pointer shadow-sm hover:bg-muted/30 transition-all"
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={11} />
              </div>
            </div>

            {/* Band Selector */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold shrink-0">Band</span>
              <div className="relative w-full sm:w-auto">
                <select
                  value={bandFilter}
                  onChange={e => { setBandFilter(e.target.value); setPage(1); }}
                  className="appearance-none pr-8 pl-3 h-8 text-xs rounded-lg border border-border/80 bg-background font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto cursor-pointer shadow-sm hover:bg-muted/30 transition-all"
                >
                  <option value="All">All Bands</option>
                  {['DISTINGUISHED', 'PROFICIENT', 'ADVANCED', 'EMERGING'].map(b => (
                    <option key={b} value={b}>{BAND_DISPLAY[b as RankingBand]}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={11} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm mt-4">
          <AlertCircle size={17} />
          <span><strong>Database error:</strong> {error}</span>
        </div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="bg-card rounded-2xl ring-1 ring-foreground/10 shadow-soft overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="px-3 py-3 font-semibold">Applicant</th>
                <th className="px-3 py-3 font-semibold">Branch/Course</th>
                <th className="px-3 py-3 font-semibold">Location</th>
                <th className="px-3 py-3 font-semibold text-center">12th %</th>
                <th className="px-3 py-3 font-semibold">UG Status</th>
                <th className="px-3 py-3 font-semibold">Exam Set</th>
                <th className="px-3 py-3 font-semibold">Score</th>
                <th className="px-3 py-3 font-semibold">Exam Status</th>
                <th className="px-3 py-3 font-semibold">Band</th>
                <th className="px-3 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={10} className="text-center py-16">
                    <div className="flex items-center justify-center gap-3 text-muted-foreground">
                      <RefreshCw size={19} className="animate-spin" />
                      <span className="text-sm">Loading applicants from {config.studentsTable}...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-muted-foreground text-sm">
                    No applicants found matching your criteria.
                  </td>
                </tr>
              )}
              {!loading && paginated.map((item, i) => {
                const band: RankingBand = item.band as RankingBand;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer group text-xs"
                    onClick={() => {
                      setSelectedStudentId(item.studentId);
                      setSelectedExamId(item.hasExam ? item.examResult.id : null);
                      setDrawerOpen(true);
                    }}
                  >
                    <td className="px-3 py-2.5 max-w-[180px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {(item.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">#{item.application_no} • {item.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-foreground font-medium truncate whitespace-nowrap max-w-[120px]">{formatCourse(item.course)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[130px]" title={`${item.city}, ${item.state}`}>{item.city}, {item.state}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-foreground">{item.percentage_12th}%</span>
                        <div className="hidden md:block w-8 bg-muted rounded-full h-1 shrink-0">
                          <div className="bg-primary h-1 rounded-full" style={{ width: `${Math.min(item.percentage_12th, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground truncate whitespace-nowrap">{item.ug_status ?? '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-muted-foreground uppercase truncate whitespace-nowrap">{item.exam_set}</td>
                    <td className="px-3 py-2.5 font-semibold text-foreground truncate whitespace-nowrap">
                      {item.score}
                    </td>
                    <td className="px-3 py-2.5 truncate whitespace-nowrap">
                      {item.hasExam ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${examStatusColors[item.status as ExamStatus]}`}>
                          {item.status === 'Malpractice' ? <ShieldAlert size={10} /> : <CheckCircle2 size={10} />}
                          <span>{item.status}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Pending</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 truncate whitespace-nowrap">
                      {item.hasExam ? (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${RANKING_BAND_STYLES[band]}`}>
                          {BAND_DISPLAY[band]}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setSelectedStudentId(item.studentId);
                          setSelectedExamId(item.hasExam ? item.examResult.id : null);
                          setDrawerOpen(true);
                        }}
                      >
                        <MoreHorizontal size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length || 0)}</span>–
            <span className="font-medium text-foreground">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of{' '}
            <span className="font-medium text-foreground">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={15} />
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition ${page === i + 1 ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
                {i + 1}
              </button>
            ))}
            <Button variant="outline" size="icon-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      </motion.div>

      <StudentDrawer student={selectedStudent} examResult={selectedExamResult} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onUpdateStudent={updateStudent} />
    </div>
  );
}
