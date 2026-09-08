import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, CheckCircle2, AlertTriangle, TrendingUp,
  FileCheck, BadgeAlert, Sparkles, RefreshCw,
  CheckCircle, BarChart3
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAppData } from '@/hooks/useAppData';
import { useCourse } from '@/context/CourseContext';
import { formatCourse, RANKING_BAND_STYLES, BAND_DISPLAY, getRankingBand, getSafeRankingBand, RankingBand } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const BAND_COLORS: Record<string, string> = {
  [BAND_DISPLAY.DISTINGUISHED]: '#8B5CF6', // Premium Violet
  [BAND_DISPLAY.PROFICIENT]: '#3B82F6',     // Electric Blue
  [BAND_DISPLAY.ADVANCED]: '#10B981',       // Emerald
  [BAND_DISPLAY.EMERGING]: '#F59E0B',       // Amber
};

const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-600',
  'from-blue-500 to-sky-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600'
];

export default function Dashboard() {
  const { config } = useCourse();
  const { students, examResults, loading, error, reload } = useAppData();

  const studentsWithExams = new Set(examResults.map(r => r.student_id));
  const pendingTests = students.filter(s => !studentsWithExams.has(s.id)).length;
  const testsCompleted = examResults.length;
  const totalApplicants = testsCompleted + pendingTests;

  const evaluatedResults = examResults.filter(r => r.status === 'Evaluated');
  const passThreshold = Number(localStorage.getItem('rgu_pass_threshold') || '50');
  const passedStudents = evaluatedResults.filter(r => r.percentage >= passThreshold).length;
  const passRate = evaluatedResults.length
    ? Math.round((passedStudents / evaluatedResults.length) * 100)
    : 0;
  const malpracticeCount = examResults.filter(r => r.status === 'Malpractice').length;

  const bandCounts: Record<RankingBand, number> = {
    DISTINGUISHED: 0, PROFICIENT: 0, ADVANCED: 0, EMERGING: 0,
  };
  examResults.forEach(r => {
    const b = getSafeRankingBand(r.band, r.percentage);
    bandCounts[b] = (bandCounts[b] ?? 0) + 1;
  });
  const distinguishedCount = bandCounts.DISTINGUISHED;

  const sectionAvgs = config.sections.map(sec => {
    const total = examResults.reduce((sum, r) => sum + Number((r as any)[sec.key] ?? 0), 0);
    const avg = examResults.length ? Math.round(total / examResults.length) : 0;
    return { name: sec.label, score: avg, max: sec.max };
  });

  const avgScore = examResults.length
    ? Math.round(examResults.reduce((sum, r) => sum + r.total_score, 0) / examResults.length)
    : 0;

  const summaryCards = [
    { title: 'Total Applicants',   value: totalApplicants,          trend: '+15.2%', icon: Users,        color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-950/40 border border-blue-100/30 dark:border-blue-900/20' },
    { title: 'Tests Completed',    value: testsCompleted,         trend: '+10.4%', icon: FileCheck,    color: 'text-indigo-600 dark:text-indigo-400',   bg: 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/30 dark:border-indigo-900/20' },
    { title: 'Pending Tests',      value: pendingTests,           trend: '-4.1%',  icon: BadgeAlert,   color: 'text-orange-650 dark:text-orange-455',   bg: 'bg-orange-50 dark:bg-orange-950/40 border border-orange-100/30 dark:border-orange-900/20' },
    { title: 'Pass Rate',          value: `${passRate}%`,         trend: '+2.8%',  icon: CheckCircle2, color: 'text-green-600 dark:text-green-400',     bg: 'bg-green-50 dark:bg-green-950/40 border border-green-100/30 dark:border-green-900/20' },
    { title: 'Distinguished Band', value: distinguishedCount,     trend: '+5.0%',  icon: TrendingUp,   color: 'text-purple-600 dark:text-purple-400',   bg: 'bg-purple-50 dark:bg-purple-950/40 border border-purple-100/30 dark:border-purple-900/20' },
    { title: 'Evaluated',          value: evaluatedResults.length,trend: '+12.0%', icon: CheckCircle,  color: 'text-teal-600 dark:text-teal-400',       bg: 'bg-teal-50 dark:bg-teal-950/40 border border-teal-100/30 dark:border-teal-900/20' },
    { title: 'Average Score',      value: `${avgScore}/100`,      trend: '+3.1%',  icon: BarChart3,    color: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-950/40 border border-violet-100/30 dark:border-violet-900/20' },
    { title: 'Malpractice Cases',  value: malpracticeCount,       trend: '-3.2%',  icon: AlertTriangle,color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/40 border border-red-100/30 dark:border-red-900/20' },
  ];

  const bandData = (Object.entries(bandCounts) as [RankingBand, number][])
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: BAND_DISPLAY[k], value: v }));

  const performers = examResults
    .map(res => {
      const student = students.find(s => s.id === res.student_id);
      return {
        name: student?.name || 'Unknown',
        course: student?.course || '',
        score: res.total_score,
        percentage: res.percentage,
        band: getSafeRankingBand(res.band, res.percentage),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const bandStyles: Record<RankingBand, string> = {
    DISTINGUISHED: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100/80 dark:border-purple-900/30',
    PROFICIENT: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 border border-blue-100/80 dark:border-blue-900/30',
    ADVANCED: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-900/30',
    EMERGING: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100/80 dark:border-amber-900/30',
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* 1. TOP HEADER: Realigned Title, Subtitle, & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/85">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
            Engineering Applicant Analytics
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-normal">
            Executive-level candidate performance benchmarks, evaluation progress, and malpractice compliance records.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-zinc-450 dark:text-zinc-550 font-extrabold uppercase tracking-widest hidden md:inline-block bg-zinc-50 dark:bg-zinc-900 p-1.5 px-2.5 rounded-lg border border-zinc-150 dark:border-zinc-850">
            SYSTEM STATUS: <span className="text-emerald-600 dark:text-emerald-400 font-black">ACTIVE MONITORING</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={reload}
            disabled={loading}
            className="h-8 gap-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold"
          >
            <RefreshCw size={13} className={`text-zinc-500 dark:text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-[11px]">Refresh Workspace</span>
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* 2. SECTION 1: Spacious 2-Row KPI Grid - Perfectly aligned standard padding p-5 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((c, idx) => {
          const isNegativeTrend = c.trend.startsWith('-');
          const trendColor = c.title.toLowerCase().includes('malpractice') || c.title.toLowerCase().includes('pending')
            ? (isNegativeTrend ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-100/10' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-100/10')
            : (isNegativeTrend ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-100/10' : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-100/10');

          return (
            <motion.div
              key={c.title}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 flex flex-col justify-between shadow-sm h-[112px]"
            >
              <div className="flex justify-between items-center gap-2">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest leading-none truncate">
                  {c.title}
                </span>
                <div className={`p-1.5 rounded-lg ${c.bg} shrink-0 flex items-center justify-center`}>
                  <c.icon size={13} className={c.color} />
                </div>
              </div>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none font-mono">
                  {loading ? '...' : c.value}
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wide leading-none ${trendColor} border shadow-sm`}>
                  {c.trend}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. SECTION 2: Symmetrical Visualization Grid (Row 2 - Height Matched to h-[450px] to fully contain the 6 score rows + footer) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Band Distribution pie donut */}
        <Card className="h-[450px] flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 shrink-0 p-5">
            <div>
              <CardTitle className="text-xs font-bold text-zinc-850 dark:text-zinc-100 tracking-tight">
                Performance Band Distribution
              </CardTitle>
              <p className="text-[9px] text-zinc-455 dark:text-zinc-500 font-semibold mt-0.5">Grade category breakdown for evaluated tests</p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between p-5 pt-3 pb-3">
            {bandData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-400 font-semibold">
                No evaluation data available.
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                {/* Donut chart relative container configured at h-[160px] and radius outerRadius={62} for excellent visual look */}
                <div className="relative flex justify-center items-center h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bandData}
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={62}
                        paddingAngle={2.5}
                        dataKey="value"
                      >
                        {bandData.map((d, idx) => (
                          <Cell key={idx} fill={BAND_COLORS[d.name] || COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          fontSize: 10,
                          borderRadius: 6,
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                          color: '#1F2937',
                          fontWeight: 'bold',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Inside Center Readout */}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest leading-none">Evaluated</span>
                    <span className="text-3xl font-black text-zinc-800 dark:text-zinc-150 tracking-tight leading-none mt-1 font-mono">
                      {evaluatedResults.length}
                    </span>
                  </div>
                </div>

                {/* Symmetrical Legend Panels upgraded to text-xs font-bold */}
                <div className="grid grid-cols-2 gap-2.5 w-full mt-3 shrink-0 px-1">
                  {bandData.map((d, idx) => (
                    <div key={d.name} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                          style={{ backgroundColor: BAND_COLORS[d.name] || COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-xs font-bold text-zinc-550 dark:text-zinc-400 truncate">
                          {d.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-extrabold text-zinc-850 dark:text-zinc-200 ml-1 font-mono leading-none">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Avg Section Scores Progress Bars Card - matched to height h-[450px] with zero cutoff */}
        <Card className="lg:col-span-2 h-[450px] flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 shrink-0 p-5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-400">
                <BarChart3 size={13} />
              </div>
              <div>
                <CardTitle className="text-xs font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                  Avg Section Scores
                </CardTitle>
                <p className="text-[9px] text-zinc-455 dark:text-zinc-500 font-semibold mt-0.5 font-sans">Benchmark progress indicators for parameter section averages</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between p-5 pt-3 pb-3">
            {/* Rows compacted strictly to space-y-3 and bar thickness h-1.5 to eliminate overflow voids */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {sectionAvgs.map((s, idx) => {
                const colors = [
                  'from-blue-500 to-indigo-500',
                  'from-purple-500 to-pink-500',
                  'from-teal-500 to-emerald-500',
                  'from-amber-500 to-orange-500'
                ];
                const bgGrad = colors[idx % colors.length];
                const pct = s.max > 0 ? Math.min((s.score / s.max) * 100, 100) : 0;
                return (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between text-xs items-baseline">
                      <span className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400">{s.name}</span>
                      <span className="font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200 leading-none">
                        {s.score}<span className="text-[9px] text-zinc-400 dark:text-zinc-550 font-normal">/{s.max}</span>
                      </span>
                    </div>
                    <div className="relative w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 bg-gradient-to-r ${bgGrad} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Avg Score Card fits 100% visible inside container margins */}
            <div className="border-t border-zinc-150 dark:border-zinc-800/80 pt-3 shrink-0 mt-3">
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/40">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Overall Avg Score</span>
                  <span className="text-[10px] font-semibold text-zinc-550 dark:text-[#a0c3ff] mt-1 leading-none">Benchmark Target: 50%</span>
                </div>
                <div className="flex items-baseline gap-0.5 bg-white dark:bg-zinc-950 px-3.5 py-1.5 rounded-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono leading-none">{avgScore}</span>
                  <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 font-mono">/100</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. SECTION 3: Bottom Analytics Panels - Leaderboard & Exam Status Monitor matched symmetrically to h-[440px] */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers Leaderboard */}
        <Card className="h-[440px] flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 shrink-0 p-5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-zinc-50 dark:bg-zinc-900 text-amber-500">
                <Sparkles size={13} />
              </div>
              <div>
                <CardTitle className="text-xs font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                  Top Performers Leaderboard
                </CardTitle>
                <p className="text-[9px] text-zinc-455 dark:text-zinc-500 font-semibold mt-0.5">Top-performing engineering candidates by scorecard metrics</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-5 pt-2 pb-3 flex flex-col">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900 flex flex-col gap-2">
              {performers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                  <p className="text-xs text-zinc-455 font-semibold">No evaluations completed yet.</p>
                </div>
              ) : (
                performers.map((p, idx) => {
                  const isTop3 = idx < 3;
                  const rankingBadge = idx === 0 
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                    : idx === 1 
                      ? 'bg-slate-400/10 text-slate-500 dark:text-slate-400 border border-slate-400/20' 
                      : 'bg-orange-500/10 text-orange-650 dark:text-orange-400 border border-orange-500/20';

                  const avatarGrad = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                  return (
                    <div key={`${p.name}-${idx}`} className="flex items-center justify-between py-2.5 gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 px-1.5 rounded-lg transition-colors shrink-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isTop3 ? (
                          <span className={`text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${rankingBadge} font-mono shadow-sm`}>
                            {idx + 1}
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold text-zinc-400 w-5 text-center shrink-0 font-mono">
                            #{idx + 1}
                          </span>
                        )}
                        
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGrad} text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm border border-white dark:border-zinc-900`}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-55 truncate leading-tight">
                            {p.name}
                          </p>
                          <p className="text-[9px] text-zinc-450 dark:text-zinc-550 font-extrabold uppercase tracking-widest mt-0.5 leading-none">
                            {formatCourse(p.course)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest leading-none uppercase ${bandStyles[p.band]} shadow-sm`}>
                          {BAND_DISPLAY[p.band]}
                        </span>
                        <div className="text-right">
                          <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 leading-none">
                            {p.score}
                          </p>
                          <p className="text-[8px] text-zinc-450 font-mono mt-0.5 leading-none">
                            {(p.percentage || 0).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exam Status Monitor & Health Check Card */}
        <Card className="h-[440px] flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 shrink-0 p-5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-zinc-50 dark:bg-zinc-900 text-indigo-500">
                <CheckCircle size={13} />
              </div>
              <div>
                <CardTitle className="text-xs font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                  Exam Status Monitor
                </CardTitle>
                <p className="text-[9px] text-zinc-455 dark:text-zinc-500 font-semibold mt-0.5">Live assessment pipeline indices, metrics, and quality alerts</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between p-5 pt-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 items-center">
              {/* Left Column: Count tiles & Health indicators */}
              <div className="space-y-4 h-full flex flex-col justify-between py-1">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 rounded-xl p-2 text-center flex flex-col justify-between min-h-[64px] shadow-sm">
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono leading-none">
                      {testsCompleted}
                    </span>
                    <p className="text-[8px] text-zinc-400 dark:text-zinc-550 font-extrabold uppercase tracking-widest leading-none mt-1">Completed</p>
                  </div>
                  <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 rounded-xl p-2 text-center flex flex-col justify-between min-h-[64px] shadow-sm">
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono leading-none">
                      {pendingTests}
                    </span>
                    <p className="text-[8px] text-zinc-400 dark:text-zinc-555 font-extrabold uppercase tracking-widest leading-none mt-1">Pending</p>
                  </div>
                  <div className="bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 rounded-xl p-2 text-center flex flex-col justify-between min-h-[64px] shadow-sm">
                    <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono leading-none">
                      {malpracticeCount}
                    </span>
                    <p className="text-[8px] text-zinc-400 dark:text-zinc-550 font-extrabold uppercase tracking-widest leading-none mt-1">Malpractice</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/40 rounded-lg p-2.5 px-3">
                    <span className="text-[10px] font-bold text-zinc-650 dark:text-zinc-450 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Pass Rate:
                    </span>
                    <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 leading-none">
                      {passRate}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/40 rounded-lg p-2.5 px-3">
                    <span className="text-[10px] font-bold text-zinc-650 dark:text-zinc-455 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      Malpractice Rate:
                    </span>
                    <span className={`font-mono text-xs font-black leading-none ${malpracticeCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-550 dark:text-zinc-400'}`}>
                      {((malpracticeCount / (testsCompleted || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Band Summary Breakdown bars list */}
              <div className="space-y-3.5 h-full flex flex-col justify-center border-l border-zinc-100 dark:border-zinc-900/60 pl-5">
                <p className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-900 pb-1 shrink-0">Band Summary Breakdown</p>
                <div className="space-y-3 flex-1 flex flex-col justify-between py-1">
                  {(Object.entries(bandCounts) as [RankingBand, number][]).map(([band, count]) => {
                    const barColors: Record<RankingBand, string> = {
                      DISTINGUISHED: 'bg-purple-500',
                      PROFICIENT: 'bg-blue-500',
                      ADVANCED: 'bg-emerald-500',
                      EMERGING: 'bg-amber-500',
                    };
                    const barBg = barColors[band] || 'bg-zinc-500';
                    const pct = testsCompleted ? (count / testsCompleted) * 100 : 0;
                    return (
                      <div key={band} className="space-y-0.5">
                        <div className="flex justify-between items-center text-[9px] leading-none">
                          <span className="font-bold text-zinc-650 dark:text-zinc-455">
                            {BAND_DISPLAY[band]}
                          </span>
                          <div className="flex items-center gap-1 font-mono font-extrabold text-zinc-700 dark:text-zinc-300">
                            <span>{count}</span>
                            <span className="text-zinc-400 font-normal">({pct.toFixed(0)}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`${barBg} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
