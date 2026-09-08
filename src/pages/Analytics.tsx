import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { FileDown, FileSpreadsheet, Printer, Sparkles, RefreshCw } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useCourse } from '@/context/CourseContext';
import { formatCourse, getRankingBand, getSafeRankingBand, RANKING_BAND_STYLES, BAND_DISPLAY, RankingBand, ExamResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
const BAND_COLORS: Record<RankingBand, string> = {
  DISTINGUISHED: '#7C3AED',
  PROFICIENT: '#3B82F6',
  ADVANCED: '#10B981',
  EMERGING: '#F59E0B',
};

export default function Analytics() {
  const { config } = useCourse();
  const { students, examResults, loading, reload } = useAppData();

  const total = students.length;
  const evaluated = examResults.filter(r => r.status === 'Evaluated');
  const malpractice = examResults.filter(r => r.status === 'Malpractice').length;
  const passThreshold = Number(localStorage.getItem('rgu_pass_threshold') || '50');
  const passed = evaluated.filter(r => r.percentage >= passThreshold).length;
  const passPercent = evaluated.length ? Math.round((passed / evaluated.length) * 100) : 0;

  const courseCounts: Record<string, number> = {};
  students.forEach(s => {
    const label = formatCourse(s.course);
    courseCounts[label] = (courseCounts[label] ?? 0) + 1;
  });
  const deptData = Object.entries(courseCounts).map(([name, count]) => ({ name, count }));

  const stateCounts: Record<string, number> = {};
  students.forEach(s => { stateCounts[s.state] = (stateCounts[s.state] ?? 0) + 1; });
  const stateData = Object.entries(stateCounts)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const genderCounts: Record<string, number> = {};
  students.forEach(s => { genderCounts[s.gender] = (genderCounts[s.gender] ?? 0) + 1; });
  const genderData = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));

  const bandCounts: Record<RankingBand, number> = { DISTINGUISHED: 0, PROFICIENT: 0, ADVANCED: 0, EMERGING: 0 };
  examResults.forEach(r => {
    const b = getSafeRankingBand(r.band, r.percentage);
    bandCounts[b] = (bandCounts[b] ?? 0) + 1;
  });
  const bandData = (Object.entries(bandCounts) as [RankingBand, number][])
    .map(([k, v]) => ({ name: BAND_DISPLAY[k], value: v, key: k }));

  const calcAvg = (field: keyof ExamResult) =>
    examResults.length
      ? parseFloat((examResults.reduce((s, r) => s + (Number(r[field]) || 0), 0) / examResults.length).toFixed(1))
      : 0;

  const sectionAvgs = config.sections.map(sec => ({
    subject: sec.label,
    A: calcAvg(sec.key as keyof ExamResult),
    fullMark: sec.max
  }));

  const pctBuckets = { '90-100%': 0, '75-89%': 0, '60-74%': 0, '50-59%': 0, '<50%': 0 };
  students.forEach(s => {
    const p = s.percentage_12th;
    if (p >= 90) pctBuckets['90-100%']++;
    else if (p >= 75) pctBuckets['75-89%']++;
    else if (p >= 60) pctBuckets['60-74%']++;
    else if (p >= 50) pctBuckets['50-59%']++;
    else pctBuckets['<50%']++;
  });
  const pctData = Object.entries(pctBuckets).map(([name, count]) => ({ name, count }));

  const ugCounts: Record<string, number> = {};
  students.forEach(s => { const k = s.ug_status ?? 'Unknown'; ugCounts[k] = (ugCounts[k] ?? 0) + 1; });
  const ugData = Object.entries(ugCounts).map(([name, value]) => ({ name, value }));

  const kpiCards = [
    { label: 'Overall Pass Rate', value: `${passPercent}%`, desc: `${passed} of ${evaluated.length} qualified` },
    { label: 'Total Applicants', value: total, desc: `Registered in ${config.studentsTable}` },
    { label: 'Exam Completion', value: `${examResults.length}/${total}`, desc: 'Tests processed' },
    { label: 'Malpractice Rate', value: `${examResults.length ? ((malpractice / examResults.length) * 100).toFixed(1) : 0}%`, desc: `${malpractice} flagged cases` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
        <RefreshCw size={22} className="animate-spin" />
        <span>Loading analytics data for {config.label}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0 w-full overflow-hidden pb-8">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-row items-start justify-between gap-4 p-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={17} className="text-primary" />
              <span className="text-base font-bold text-foreground">{config.label} Analytics Intelligence</span>
            </div>
            <p className="text-sm text-muted-foreground">Deep analytics on exam performance, demographics &amp; section-wise scores</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => alert(`Exporting ${config.label} analytics to PDF...`)}>
              <FileDown size={13} className="text-red-500" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => alert(`Exporting ${config.label} analytics to Excel...`)}>
              <FileSpreadsheet size={13} className="text-green-600" /> Excel
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => window.print()}>
              <Printer size={13} className="text-blue-600" /> Print
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        {/* Premium pill-style tab bar */}
        <TabsList className="h-auto p-1 rounded-xl bg-muted/60 border border-border gap-0 w-fit inline-flex">
          {[
            { value: 'overview', label: 'Overview' },
            { value: 'demographics', label: 'Demographics' },
            { value: 'exams', label: 'Exam Performance' },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200',
                'text-muted-foreground hover:text-foreground',
                'data-[state=active]:bg-background data-[state=active]:text-primary',
                'data-[state=active]:shadow-sm data-[state=active]:font-semibold'
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6 m-0 focus:outline-none">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((c, i) => (
              <motion.div key={i} whileHover={{ y: -2 }} className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <p className="text-xs font-semibold text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{c.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Branch/Course-wise Applications</CardTitle>
                <CardDescription className="text-[10px]">Application distribution across programs</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData} margin={{ left: -15 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EEF9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Applicants" barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">12th % Distribution</CardTitle>
                <CardDescription className="text-[10px]">Academic performance buckets</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pctData} margin={{ left: -15 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EEF9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 9 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Students" barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6 m-0 focus:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Geographic Reach (Top 8 States)</CardTitle>
                <CardDescription className="text-[10px]">State-wise applicant distribution</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5EEF9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                      <YAxis type="category" dataKey="state" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} width={80} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#60A5FA" radius={[0, 4, 4, 0]} name="Applicants" barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3} nameKey="name">
                        {genderData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  {genderData.map((d, idx) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 min-w-0 overflow-hidden">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">UG Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ugData} margin={{ left: -15 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EEF9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="value" fill="#818CF8" radius={[4, 4, 0, 0]} name="Students" barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {ugData.map((d, idx) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exams" className="space-y-6 m-0 focus:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Section Scores (Radar)</CardTitle>
                <CardDescription className="text-[10px]">Average score per section in {config.label}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-52">
                  {sectionAvgs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No section averages.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={sectionAvgs}>
                        <PolarGrid stroke="#E5EEF9" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748B' }} />
                        <Radar name="Avg Score" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                        <Tooltip contentStyle={{ fontSize: 10 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Band Distribution</CardTitle>
                <CardDescription className="text-[10px]">From {config.examResultsTable}.band</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {bandData.every(d => d.value === 0) ? (
                  <div className="h-52 flex items-center justify-center text-xs text-muted-foreground">No exam data.</div>
                ) : (
                  <div className="h-52 flex flex-col justify-between">
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={bandData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={2}>
                          {bandData.map((d, idx) => <Cell key={idx} fill={BAND_COLORS[d.key as RankingBand] ?? COLORS[idx]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-muted-foreground">
                      {bandData.map(d => (
                        <div key={d.name} className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: BAND_COLORS[d.key as RankingBand] }} />
                          <span>{d.name} ({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
