import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, RefreshCw, Search, ShieldAlert, CheckCircle2,
  Hash, Clock, TrendingUp, Award, Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppData } from '@/hooks/useAppData';
import { useCourse } from '@/context/CourseContext';
import { RANKING_BAND_STYLES, BAND_DISPLAY, RankingBand, getRankingBand, getSafeRankingBand, formatCourse } from '@/types';
import StudentDrawer from '@/components/StudentDrawer';

const PAGE_SIZE = 10;

export default function ExamResults() {
  const { config } = useCourse();
  const { students, examResults, loading, reload, updateStudent } = useAppData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Evaluated' | 'Malpractice'>('All');
  const [bandFilter, setBandFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const passThreshold = Number(localStorage.getItem('rgu_pass_threshold') || '50');
  const distinguishedThreshold = Number(localStorage.getItem('rgu_cutoff_distinguished') || '76');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;
  const selectedExamResult = examResults.find(r => r.id === selectedExamId) || null;

  const enriched = useMemo(() => {
    return examResults
      .map(r => {
        const student = students.find(s => s.id === r.student_id);
        return {
          ...r,
          studentName: student?.name ?? 'Unknown',
          studentCourse: student?.course ?? '',
          studentAppNo: student?.application_no ?? '',
          studentState: student?.state ?? '',
        };
      })
      .filter(r => {
        const matchSearch =
          r.studentName.toLowerCase().includes(search.toLowerCase()) ||
          String(r.studentAppNo).includes(search) ||
          r.exam_set.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || r.status === statusFilter;
        const band = getSafeRankingBand(r.band, r.percentage);
        const matchBand = bandFilter === 'All' || band === bandFilter;
        return matchSearch && matchStatus && matchBand;
      });
  }, [examResults, students, search, statusFilter, bandFilter]);

  const total = examResults.length;
  const evaluated = examResults.filter(r => r.status === 'Evaluated').length;
  const malpractice = examResults.filter(r => r.status === 'Malpractice').length;
  const avgScore = total ? Math.round(examResults.reduce((s, r) => s + r.total_score, 0) / total) : 0;
  const avgPct = total ? (examResults.reduce((s, r) => s + r.percentage, 0) / total).toFixed(1) : '0';
  const distinguished = examResults.filter(r => getSafeRankingBand(r.band, r.percentage) === 'DISTINGUISHED').length;

  const statsCards = [
    { label: 'Total Exams',      value: total,              color: 'text-blue-600',   bg: 'bg-blue-50',   icon: ClipboardList, action: () => { setStatusFilter('All'); setBandFilter('All'); setPage(1); } },
    { label: 'Evaluated',        value: evaluated,          color: 'text-green-600',  bg: 'bg-green-50',  icon: CheckCircle2, action: () => { setStatusFilter('Evaluated'); setBandFilter('All'); setPage(1); } },
    { label: 'Malpractice',      value: malpractice,        color: 'text-red-600',    bg: 'bg-red-50',    icon: ShieldAlert, action: () => { setStatusFilter('Malpractice'); setBandFilter('All'); setPage(1); } },
    { label: 'Avg Score',        value: `${avgScore}/100`,  color: 'text-indigo-600', bg: 'bg-indigo-50', icon: TrendingUp },
    { label: 'Avg Percentage',   value: `${avgPct}%`,       color: 'text-purple-600', bg: 'bg-purple-50', icon: Hash },
    { label: 'Distinguished',    value: distinguished,      color: 'text-amber-600',  bg: 'bg-amber-50',  icon: Award, action: () => { setStatusFilter('All'); setBandFilter('DISTINGUISHED'); setPage(1); } },
  ];

  const colSpanCount = 7 + config.sections.length;
  const totalPages = Math.max(1, Math.ceil(enriched.length / PAGE_SIZE));
  const paginated = enriched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportToCSV = () => {
    const sectionHeaders = config.sections.map(sec => `${sec.label} (/${sec.max})`);
    const headers = [
      'Application No',
      'Name',
      'Course',
      'State',
      'Exam Set',
      ...sectionHeaders,
      'Total Score',
      'Percentage',
      'Status',
      'Band',
      'Completed On',
    ];

    const rows = enriched.map(r => {
      const band = getSafeRankingBand(r.band, r.percentage);
      const sectionScores = config.sections.map(sec =>
        `${Number(r[sec.key as keyof typeof r] ?? 0)}/${sec.max}`
      );
      return [
        r.studentAppNo,
        r.studentName,
        formatCourse(r.studentCourse),
        r.studentState,
        r.exam_set,
        ...sectionScores,
        `${r.total_score}/100`,
        `${(r.percentage || 0).toFixed(1)}%`,
        r.status,
        BAND_DISPLAY[band],
        new Date(r.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      ];
    });

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
    link.download = `${config.label.replace(/\s+/g, '_')}_exam_results_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {statsCards.map((c, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -2 }} 
            onClick={c.action}
            className={`bg-card rounded-2xl border border-border shadow-sm p-4 ${c.action ? 'cursor-pointer hover:border-primary/40' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mb-2`}>
              <c.icon size={14} className={c.color} />
            </div>
            <p className={`text-xl font-extrabold ${c.color}`}>{loading ? '...' : c.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-2.5 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
              <Input className="pl-8 h-8 text-xs bg-background" placeholder="Search applicant..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold shrink-0">Status</span>
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
                  className="h-8 text-xs rounded-lg border border-border bg-background px-3 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Evaluated">Evaluated</option>
                  <option value="Malpractice">Malpractice</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold shrink-0">Band</span>
                <select
                  value={bandFilter}
                  onChange={e => { setBandFilter(e.target.value); setPage(1); }}
                  className="h-8 text-xs rounded-lg border border-border bg-background px-3 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto cursor-pointer"
                >
                  <option value="All">All Bands</option>
                  {['DISTINGUISHED', 'PROFICIENT', 'ADVANCED', 'EMERGING'].map(b => (
                    <option key={b} value={b}>{BAND_DISPLAY[b as RankingBand]}</option>
                  ))}
                </select>
              </div>

              {/* Download CSV Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs font-semibold px-3 hover:bg-muted/80 transition-all duration-200 shrink-0"
                onClick={exportToCSV}
                disabled={enriched.length === 0 || loading}
              >
                <Download size={11} />
                Download CSV {enriched.length > 0 && `(${enriched.length})`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 'max-content' }}>
            <thead>
              <tr className="bg-muted/60 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 whitespace-nowrap sticky left-0 bg-muted/60 z-10 min-w-[160px]">Applicant</th>
                <th className="px-3 py-3 whitespace-nowrap">Exam Set</th>
                {config.sections.map(sec => (
                  <th key={sec.key} className="px-3 py-3 text-center whitespace-nowrap">
                    <span className="block">{sec.label}</span>
                    <span className="font-normal opacity-60">/{sec.max}</span>
                  </th>
                ))}
                <th className="px-3 py-3 text-center whitespace-nowrap">Total</th>
                <th className="px-3 py-3 text-center whitespace-nowrap">%</th>
                <th className="px-3 py-3 text-center whitespace-nowrap">Status</th>
                <th className="px-3 py-3 text-center whitespace-nowrap">Band</th>
                <th className="px-3 py-3 whitespace-nowrap">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 sticky left-0 bg-card"><div className="space-y-1.5"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-3 w-14" /></div></td>
                      <td className="px-3 py-3"><Skeleton className="h-3.5 w-10" /></td>
                      {config.sections.map(sec => <td key={sec.key} className="px-3 py-3"><Skeleton className="h-5 w-12 mx-auto rounded-md" /></td>)}
                      <td className="px-3 py-3"><Skeleton className="h-3.5 w-12 mx-auto" /></td>
                      <td className="px-3 py-3"><Skeleton className="h-3.5 w-10 mx-auto" /></td>
                      <td className="px-3 py-3"><Skeleton className="h-5 w-20 rounded-full mx-auto" /></td>
                      <td className="px-3 py-3"><Skeleton className="h-5 w-20 rounded mx-auto" /></td>
                      <td className="px-3 py-3"><Skeleton className="h-3.5 w-14" /></td>
                    </tr>
                  ))}
                </>
              ) : enriched.length === 0 ? (
                <tr><td colSpan={colSpanCount} className="text-center py-16 text-muted-foreground text-sm">No exam results found.</td></tr>
              ) : paginated.map(r => {
                const band: RankingBand = getSafeRankingBand(r.band, r.percentage);
                const score = r.total_score;
                const pct = r.percentage || 0;
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedStudentId(r.student_id);
                      setSelectedExamId(r.id);
                      setDrawerOpen(true);
                    }}
                  >
                    {/* Applicant — sticky left column */}
                    <td className="px-4 py-3 sticky left-0 bg-card group-hover:bg-muted/40 transition-colors z-[5]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                          {(r.studentName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]">{r.studentName}</p>
                          <p className="text-[10px] text-muted-foreground">#{r.studentAppNo}</p>
                        </div>
                      </div>
                    </td>

                    {/* Exam Set */}
                    <td className="px-3 py-3">
                      <span className="font-mono text-[10px] font-bold uppercase bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{r.exam_set}</span>
                    </td>

                    {/* Section Scores */}
                    {config.sections.map(sec => {
                      const val = Number(r[sec.key as keyof typeof r] ?? 0);
                      const pctScore = Math.round((val / sec.max) * 100);
                      return (
                        <td key={sec.key} className="px-3 py-3 text-center">
                          <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md min-w-[40px]
                            ${pctScore >= distinguishedThreshold ? 'bg-emerald-50 text-emerald-700' : pctScore >= passThreshold ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-600'}`}>
                            {val}/{sec.max}
                          </span>
                        </td>
                      );
                    })}

                    {/* Total Score */}
                    <td className="px-3 py-3 text-center">
                      <span className="text-xs font-bold text-foreground">{score}<span className="text-muted-foreground font-normal">/100</span></span>
                    </td>

                    {/* Percentage */}
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-extrabold ${pct >= distinguishedThreshold ? 'text-emerald-600' : pct >= passThreshold ? 'text-blue-600' : 'text-red-500'}`}>
                        {pct.toFixed(1)}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border
                        ${r.status === 'Malpractice'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-green-50 text-green-700 border-green-200'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'Malpractice' ? 'bg-red-500' : 'bg-green-500'}`} />
                        {r.status}
                      </span>
                    </td>

                    {/* Band */}
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${RANKING_BAND_STYLES[band]}`}>
                        {BAND_DISPLAY[band]}
                      </span>
                    </td>

                    {/* Completed On */}
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock size={11} />
                        {new Date(r.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
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
            <span className="font-medium text-foreground">{Math.min((page - 1) * PAGE_SIZE + 1, enriched.length || 0)}</span>–
            <span className="font-medium text-foreground">{Math.min(page * PAGE_SIZE, enriched.length)}</span> of{' '}
            <span className="font-medium text-foreground">{enriched.length}</span>
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
      </div>

      <StudentDrawer
        student={selectedStudent}
        examResult={selectedExamResult}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdateStudent={updateStudent}
      />
    </div>
  );
}
