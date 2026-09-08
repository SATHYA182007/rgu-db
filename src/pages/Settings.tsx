import React, { useState, useRef } from 'react';
import {
  User, Lock, Sliders, Database, Bell, Shield, Sparkles, RefreshCw, Save,
  CheckCircle2, ToggleLeft, ToggleRight, Key, Laptop, Globe, Check, AlertCircle,
  PlusCircle, Trash2
} from 'lucide-react';
import { useCourse } from '@/context/CourseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

type TabId = 'profile' | 'admissions' | 'database' | 'preferences';

export default function Settings() {
  const { config } = useCourse();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Hidden File Input Ref for photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form States (Persistent via LocalStorage)
  const [fullName, setFullName] = useState(() => localStorage.getItem('admin_fullName') || 'Admin User');
  const [email, setEmail] = useState(() => localStorage.getItem('admin_email') || 'admin@rathinam.in');
  const [phone, setPhone] = useState(() => localStorage.getItem('admin_phone') || '+91 9876543210');
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem('admin_profilePhoto') || '');
  const [adminRole, setAdminRole] = useState(() => localStorage.getItem('admin_role') || 'Admin');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Admissions Config States
  const [examDuration, setExamDuration] = useState(() => localStorage.getItem('rgu_exam_duration') || '60');
  const [totalMarks, setTotalMarks] = useState(() => localStorage.getItem('rgu_total_marks') || '100');
  const [admissionOpen, setAdmissionOpen] = useState(true);
  const [selfReg, setSelfReg] = useState(true);

  // Dynamic Cutoffs States
  const [passThreshold, setPassThreshold] = useState(() => localStorage.getItem('rgu_pass_threshold') || '50');
  const [cutoffDistinguished, setCutoffDistinguished] = useState(() => localStorage.getItem('rgu_cutoff_distinguished') || '76');
  const [cutoffProficient, setCutoffProficient] = useState(() => localStorage.getItem('rgu_cutoff_proficient') || '51');
  const [cutoffAdvanced, setCutoffAdvanced] = useState(() => localStorage.getItem('rgu_cutoff_advanced') || '26');
  
  // Realtime Seeding & Cleaning States
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanSuccess, setCleanSuccess] = useState<string | null>(null);

  // Preference States
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [waAlerts, setWaAlerts] = useState(false);
  const [mfa, setMfa] = useState(false);
  const [activityLog, setActivityLog] = useState(true);

  // UX Feedback States
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lxksoojimkleldsjiofu.supabase.co';

  // Handle image file selection and conversion to Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
  };

  // Handler for Profile Form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    localStorage.setItem('admin_fullName', fullName);
    localStorage.setItem('admin_email', email);
    localStorage.setItem('admin_phone', phone);
    localStorage.setItem('admin_profilePhoto', profilePhoto);
    localStorage.setItem('admin_role', adminRole);

    window.dispatchEvent(new Event('admin-profile-update'));

    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Handler for Admissions Rules Form
  const handleSaveAdmissions = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    localStorage.setItem('rgu_exam_duration', examDuration);
    localStorage.setItem('rgu_total_marks', totalMarks);
    localStorage.setItem('rgu_pass_threshold', passThreshold);
    localStorage.setItem('rgu_cutoff_distinguished', cutoffDistinguished);
    localStorage.setItem('rgu_cutoff_proficient', cutoffProficient);
    localStorage.setItem('rgu_cutoff_advanced', cutoffAdvanced);

    // Broadcast update event so charts immediately synchronize
    window.dispatchEvent(new Event('rgu-cutoffs-update'));

    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Generate and seed a realistic mock applicant directly into live Supabase
  const generateMockApplicant = async () => {
    setSeeding(true);
    setSeedSuccess(null);
    try {
      const firstNames = ['Amit', 'Siddharth', 'Neha', 'Divya', 'Vikram', 'Rohan', 'Anjali', 'Kunal', 'Pooja', 'Deepak', 'Sanjay', 'Meera', 'Karan', 'Priyanka', 'Vijay', 'Sneha', 'Lakshmi', 'Rahul', 'Rohit', 'Aditya'];
      const lastNames = ['Sharma', 'Verma', 'Patel', 'Sen', 'Rao', 'Nair', 'Joshi', 'Gupta', 'Mehta', 'Reddy', 'Kumar', 'Paul', 'Deshmukh', 'Sharma', 'Verma'];
      const cities = ['Bengaluru', 'Chennai', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Mangaluru', 'Vijayawada'];
      const states = ['Karnataka', 'Tamil Nadu', 'Maharashtra', 'Delhi', 'Telangana', 'Maharashtra', 'West Bengal', 'Gujarat', 'Karnataka', 'Andhra Pradesh'];
      
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${fName} ${lName}`;
      
      const randomIdx = Math.floor(Math.random() * cities.length);
      const city = cities[randomIdx];
      const state = states[randomIdx];
      
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${Math.floor(Math.random() * 900)}@example.edu`;
      const phone = '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
      
      const currentCourseId = config.id; 
      const courseLabel = config.label;
      
      const isMalpractice = Math.random() < 0.12; 
      const totalScore = isMalpractice ? Math.floor(12 + Math.random() * 15) : Math.floor(42 + Math.random() * 54);
      
      const marks10 = Math.floor(360 + Math.random() * 130);
      const marks12 = Math.floor(360 + Math.random() * 130);
      const score10 = (marks10 / 5).toFixed(1);
      const score12 = (marks12 / 5).toFixed(1);

      // 1. Insert Student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          first_name: fName,
          last_name: lName,
          name: fullName,
          father_name: `G. ${lName}`,
          dob: '2004-06-15',
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          email,
          phone,
          state,
          city,
          course_category: currentCourseId,
          course: courseLabel,
          board_type: 'CBSE',
          group12th: currentCourseId === 'engineering' ? 'MPC' : 'Commerce',
          marks10,
          marks12,
          score10: Number(score10),
          score12: Number(score12),
          ug_status: currentCourseId.includes('m') ? 'Completed' : 'Pursuing',
          ug_score: currentCourseId.includes('m') ? 8.2 : null
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // 2. Distribute scores cleanly
      const rawAnswers: Record<string, number> = {};
      const sectionScores: Record<string, number> = {};
      
      let remainingScore = totalScore;
      config.sections.forEach((sec, index) => {
        let secVal = 0;
        if (index === config.sections.length - 1) {
          secVal = Math.min(remainingScore, sec.max);
        } else {
          const target = Math.round(remainingScore / (config.sections.length - index));
          secVal = Math.min(Math.floor(Math.random() * (target + 1)), sec.max);
        }
        remainingScore -= secVal;
        
        rawAnswers[`${sec.key}`] = secVal;
        const cleanKey = sec.key.replace('_score', '');
        sectionScores[cleanKey] = secVal;
      });

      const feedbacks = [
        "Good performance overall. Analytical thinking and conceptual grasp are highly satisfactory.",
        "Candidate displays extraordinary verbal fluidity, analytical accuracy, and fast reading skills.",
        "Reasonable comprehension levels. General awareness is average. Recommended.",
        "Flagged by automated proctoring AI for multiple tab switches and unauthorized device use."
      ];
      
      const aiFeedback = isMalpractice ? feedbacks[3] : feedbacks[Math.floor(Math.random() * 3)];
      
      const distCutoff = Number(localStorage.getItem('rgu_cutoff_distinguished') || '76');
      const profCutoff = Number(localStorage.getItem('rgu_cutoff_proficient') || '51');
      const advCutoff = Number(localStorage.getItem('rgu_cutoff_advanced') || '26');
      
      let band = 'EMERGING';
      if (totalScore >= distCutoff) band = 'DISTINGUISHED';
      else if (totalScore >= profCutoff) band = 'PROFICIENT';
      else if (totalScore >= advCutoff) band = 'ADVANCED';

      // 3. Insert Exam Result
      const { error: examError } = await supabase
        .from('exam_results')
        .insert({
          student_id: studentData.id,
          exam_set: 'Set ' + ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
          total_score: totalScore,
          percentage: totalScore,
          status: isMalpractice ? 'Malpractice' : 'Evaluated',
          raw_answers: rawAnswers,
          section_scores: sectionScores,
          ai_feedback: aiFeedback,
          band
        });

      if (examError) throw examError;

      setSeedSuccess(`Generated live mock applicant: ${fullName} (Score: ${totalScore}/100)`);
      setTimeout(() => setSeedSuccess(null), 5000);
    } catch (err: any) {
      console.error(err);
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  // Clean all generated mock applicants from the system
  const cleanMockApplicants = async () => {
    setCleaning(true);
    setCleanSuccess(null);
    try {
      const { data: mockStudentsLike, error: fetchErr } = await supabase
        .from('students')
        .select('id')
        .ilike('email', '%@example.edu');

      if (fetchErr) throw fetchErr;

      if (!mockStudentsLike || mockStudentsLike.length === 0) {
        alert('No mock candidates found to clean up.');
        setCleaning(false);
        return;
      }

      const ids = mockStudentsLike.map(s => s.id);

      const { error: delExamsErr } = await supabase
        .from('exam_results')
        .delete()
        .in('student_id', ids);

      if (delExamsErr) throw delExamsErr;

      const { error: delStudsErr } = await supabase
        .from('students')
        .delete()
        .in('id', ids);

      if (delStudsErr) throw delStudsErr;

      setCleanSuccess(`Cleaned up ${ids.length} mock candidate records successfully.`);
      setTimeout(() => setCleanSuccess(null), 5000);
    } catch (err: any) {
      console.error(err);
      alert(`Cleanup failed: ${err.message}`);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200/80">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-sans">
            Settings & System Preferences
          </h1>
          <p className="text-xs text-muted-foreground font-semibold leading-normal">
            Manage your administrator profile, configure admission intakes, database snapshots, and security preferences.
          </p>
        </div>
      </div>

      {/* Main Settings Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-border shadow-soft p-2.5 space-y-1 bg-white">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 mb-2 pt-1">Settings Categories</p>
            {[
              { id: 'profile', label: 'My Profile', desc: 'Personal info & password', icon: User },
              { id: 'admissions', label: 'Admission Config', desc: 'Exam rules & cutoffs', icon: Sparkles },
              { id: 'database', label: 'Database & Sync', desc: 'Supabase status & logs', icon: Database },
              { id: 'preferences', label: 'Security & Access', desc: 'Toggles & user roles', icon: Shield },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 border-l-4 ${
                    isActive
                      ? 'bg-primary/8 text-primary border-primary font-bold shadow-sm'
                      : 'text-muted-foreground border-transparent hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold leading-none">{tab.label}</p>
                    <p className={`text-[9px] mt-0.5 leading-none opacity-80 ${isActive ? 'text-primary' : 'text-muted-foreground/75'}`}>{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </Card>

          {/* Quick Summary card explaining the page utility */}
          <Card className="border border-border shadow-soft p-4 space-y-3 bg-muted/20">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest leading-none">System Active Configurations</p>
            <div className="space-y-2.5 text-[11px] font-medium text-foreground">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Passing Cutoff</span>
                <span className="font-mono bg-green-55 border border-green-200 text-green-700 px-1.5 py-0.5 rounded font-bold">{passThreshold}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Distinguished Band</span>
                <span className="font-mono bg-purple-55 border border-purple-200 text-purple-700 px-1.5 py-0.5 rounded font-bold">&ge;{cutoffDistinguished}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Supabase Synced</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
            <Separator />
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              This settings panel controls the core criteria of RGU's admission database. Adjusting any cutoff immediately recalculates applicant status bands across the entire dashboard in real-time.
            </p>
          </Card>
        </div>

        {/* Content View Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <Card className="border border-border shadow-soft">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <User size={15} className="text-primary" /> Profile Settings
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Update your personal information and change your admin security credentials.</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Photo Profile Selection */}
                  <div className="flex gap-4 items-center bg-muted/40 p-4 rounded-2xl ring-1 ring-border">
                    {/* Hidden File Input */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    
                    {profilePhoto ? (
                      <img 
                        src={profilePhoto} 
                        alt="Avatar" 
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-soft ring-1 ring-border" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white text-xl font-bold font-heading shrink-0 shadow-soft">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-foreground">Profile Photo</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Avatar is generated from your name or uploads.</p>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] h-7 px-2.5"
                        >
                          Upload Custom Photo
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={handleRemovePhoto}
                          className="text-[10px] h-7 px-2.5 text-destructive hover:bg-destructive/10"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Personal Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                      <Input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                      <Input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assigned Role</Label>
                      <select
                        value={adminRole}
                        onChange={e => setAdminRole(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-soft text-foreground font-medium"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </div>
                  </div>

                  <Separator />

                  {/* Password Security */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Key size={13} className="text-primary" /> Update Password Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Password</Label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Trigger */}
                  <div className="flex justify-end gap-3 pt-2">
                    {saved && (
                      <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                        <CheckCircle2 size={13} /> Profile updated successfully
                      </span>
                    )}
                    <Button type="submit" disabled={saving} className="gap-1.5 text-xs h-9">
                      {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: ADMISSION CONFIGS */}
          {activeTab === 'admissions' && (
            <div className="space-y-6">
              {/* Exam settings */}
              <Card className="border border-border shadow-soft">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles size={15} className="text-primary" /> Admission, Cutoffs & Grading Configurations ({config.label})
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">Configure intakes, pass marks, and dynamic bands cutoffs. Updates will instantly synchronize dashboard performance metrics.</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  <form onSubmit={handleSaveAdmissions} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Exam Duration (Minutes)</Label>
                        <Input
                          type="number"
                          value={examDuration}
                          onChange={e => setExamDuration(e.target.value)}
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Total Exam Marks</Label>
                        <Input
                          type="number"
                          value={totalMarks}
                          onChange={e => setTotalMarks(e.target.value)}
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Passing Threshold Score (%)</Label>
                        <Input
                          type="number"
                          value={passThreshold}
                          onChange={e => setPassThreshold(e.target.value)}
                          className="text-xs font-semibold text-green-700 bg-green-50/20 border-green-200"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Dynamic Performance Band Thresholds (Minimum %)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-wide text-purple-750">Distinguished Band (%)</Label>
                          <Input
                            type="number"
                            value={cutoffDistinguished}
                            onChange={e => setCutoffDistinguished(e.target.value)}
                            className="text-xs font-semibold text-purple-700 bg-purple-50/20 border-purple-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-wide text-blue-750">Proficient Band (%)</Label>
                          <Input
                            type="number"
                            value={cutoffProficient}
                            onChange={e => setCutoffProficient(e.target.value)}
                            className="text-xs font-semibold text-blue-700 bg-blue-50/20 border-blue-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-wide text-emerald-750">Advanced Band (%)</Label>
                          <Input
                            type="number"
                            value={cutoffAdvanced}
                            onChange={e => setCutoffAdvanced(e.target.value)}
                            className="text-xs font-semibold text-emerald-700 bg-emerald-50/20 border-emerald-200"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Note: Any score below Advanced will automatically be marked in the Emerging Band.</p>
                    </div>

                    <Separator />

                    <div className="space-y-2.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Hardcoded Sectional Max Limits (Read-Only)</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        {config.sections.map(sec => (
                          <div key={sec.key} className="p-3 border border-border rounded-xl bg-muted/50">
                            <p className="text-[10px] text-muted-foreground font-bold">{sec.label}</p>
                            <p className="font-bold text-foreground mt-1">{sec.max} marks</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      {saved && (
                        <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                          <CheckCircle2 size={13} /> Admission Rules & Cutoffs updated
                        </span>
                      )}
                      <Button type="submit" disabled={saving} className="gap-1.5 text-xs h-9">
                        {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                        Save System Rules
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Admission Channels */}
              <Card className="border border-border shadow-soft">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Laptop size={15} className="text-primary" /> Registration Channels
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">Control self-registration limits and cycles for new candidate intakes.</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-foreground">Enable Candidate Self-Registration</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Let new applicants create registrations on the public portal.</p>
                    </div>
                    <button type="button" onClick={() => setSelfReg(!selfReg)}>
                      {selfReg
                        ? <ToggleRight size={34} className="text-primary" />
                        : <ToggleLeft size={34} className="text-muted-foreground" />
                      }
                    </button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-foreground">Admission Intake Cycle Open</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Marking the current admission cycle open for selections.</p>
                    </div>
                    <button type="button" onClick={() => setAdmissionOpen(!admissionOpen)}>
                      {admissionOpen
                        ? <ToggleRight size={34} className="text-primary" />
                        : <ToggleLeft size={34} className="text-muted-foreground" />
                      }
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: DATABASE DIAGNOSTICS & SYNC */}
          {/* TAB 3: DATABASE DIAGNOSTICS & SYNC */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              {/* Diagnostics & Connection Status */}
              <Card className="border border-border shadow-soft">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Database size={15} className="text-primary" /> Supabase Connection & Diagnostics
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">View database connection health, REST API endpoints, and manage live realtime pipelines.</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  <div className="bg-muted/40 rounded-2xl ring-1 ring-border p-4 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-semibold">Database Provider</span>
                      <span className="font-bold text-foreground">Supabase (PostgreSQL)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-semibold">Connection Status</span>
                      <Badge className="bg-green-100 hover:bg-green-100 text-green-700 border border-green-200 gap-1 rounded-md text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active / Healthy
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-semibold">REST API Endpoint</span>
                      <span className="font-mono text-primary font-bold truncate max-w-[250px]">{supabaseUrl}</span>
                    </div>
                    <div className="flex justify-between items-start text-xs">
                      <span className="text-muted-foreground font-semibold shrink-0">Table Listeners</span>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        <Badge variant="outline" className="font-mono text-[9px] px-1.5">students</Badge>
                        <Badge variant="outline" className="font-mono text-[9px] px-1.5">exam_results</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* LIVE MOCK DATA INJECTOR ENGINE (Fully working, premium addition) */}
              <Card className="border border-border shadow-soft bg-gradient-to-r from-blue-50/10 to-indigo-50/10">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles size={15} className="text-indigo-600" /> Interactive Mock Data Engine
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">Generate realistic test applicants and scorecard results in Supabase instantly to test the platform. Seeding automatically triggers realtime administrator notifications!</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      onClick={generateMockApplicant}
                      disabled={seeding}
                      className="flex-1 text-xs h-10 gap-2 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
                    >
                      {seeding ? <RefreshCw size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                      Generate & Seed 1 Live Candidate ({config.label})
                    </Button>
                    <Button
                      onClick={cleanMockApplicants}
                      disabled={cleaning}
                      variant="outline"
                      className="flex-1 text-xs h-10 gap-2 font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      {cleaning ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      Purge Generated Mock Candidates
                    </Button>
                  </div>

                  {seedSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-xl p-3.5 text-green-700 text-xs font-semibold flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} className="shrink-0" />
                      <span>{seedSuccess}</span>
                    </motion.div>
                  )}

                  {cleanSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-700 text-xs font-semibold flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} className="shrink-0" />
                      <span>{cleanSuccess}</span>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: SECURITY & USER ROLES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Security Preferences */}
              <Card className="border border-border shadow-soft">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Shield size={15} className="text-primary" /> Security & Notification Policies
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">Manage access policies, malpractice alert systems, and multi-factor compliance.</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-foreground">Enforce Multi-Factor Authentication (MFA)</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Force all coordinators and reviewers to verify via 2FA.</p>
                    </div>
                    <button type="button" onClick={() => setMfa(!mfa)}>
                      {mfa
                        ? <ToggleRight size={34} className="text-primary" />
                        : <ToggleLeft size={34} className="text-muted-foreground" />
                      }
                    </button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-foreground">Enable Malpractice Email Alerts</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Send high-priority email alerts to the reviewer instantly on proctoring failures.</p>
                    </div>
                    <button type="button" onClick={() => setEmailAlerts(!emailAlerts)}>
                      {emailAlerts
                        ? <ToggleRight size={34} className="text-primary" />
                        : <ToggleLeft size={34} className="text-muted-foreground" />
                      }
                    </button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-foreground">Enable WhatsApp Reminders for Interviews</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Send reminders to candidates 2 hours prior to scheduled interviews.</p>
                    </div>
                    <button type="button" onClick={() => setWaAlerts(!waAlerts)}>
                      {waAlerts
                        ? <ToggleRight size={34} className="text-primary" />
                        : <ToggleLeft size={34} className="text-muted-foreground" />
                      }
                    </button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-foreground">System Audit Activity Logging</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Keep transparent records of updates, approvals, and score modifications.</p>
                    </div>
                    <button type="button" onClick={() => setActivityLog(!activityLog)}>
                      {activityLog
                        ? <ToggleRight size={34} className="text-primary" />
                        : <ToggleLeft size={34} className="text-muted-foreground" />
                      }
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Roles Summary */}
              <Card className="border border-border shadow-soft">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Shield size={15} className="text-primary" /> User Roles & Permissions Matrix
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">Overview of active permissions allocated across different administrative roles.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3.5">
                  {[
                    { role: 'Super Admin', desc: 'Full system configuration, backup privileges, and user access control' },
                    { role: 'Admission Coordinator', desc: 'Process applications, modify student scores, update profiles' },
                    { role: 'Reviewer', desc: 'Assess candidate exam results, add proctoring feedback, recommend actions' },
                    { role: 'Staff Member', desc: 'Read-only verification of application attachments and basic details check' },
                  ].map((u, i, arr) => (
                    <div key={u.role}>
                      <div className="flex justify-between items-start py-1">
                        <div>
                          <p className="text-xs font-bold text-foreground">{u.role}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{u.desc}</p>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200 text-[9px] px-2 rounded-md font-bold">Active</Badge>
                      </div>
                      {i < arr.length - 1 && <Separator className="mt-2.5" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
