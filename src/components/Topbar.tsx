import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell, Search, ChevronDown, LogOut, UserCircle,
  FileText, Settings, X, Check, Sparkles
} from 'lucide-react';
import { useCourse } from '@/context/CourseContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { supabase } from '@/lib/supabase';

const ntStyles: Record<string, { dot: string; bar: string; text: string }> = {
  warning: { dot: 'bg-amber-400',  bar: 'border-l-amber-400',  text: 'text-amber-700' },
  info:    { dot: 'bg-blue-400',   bar: 'border-l-blue-400',   text: 'text-blue-700'  },
  success: { dot: 'bg-green-400',  bar: 'border-l-green-400',  text: 'text-green-700' },
  danger:  { dot: 'bg-red-400',    bar: 'border-l-red-400',    text: 'text-red-700'   },
};

const COURSES = [
  { value: 'bba',          label: 'BBA'            },
  { value: 'engineering',  label: 'Engineering'    },
  { value: 'arts_science', label: 'Arts & Science' },
  { value: 'mba',          label: 'MBA'            },
  { value: 'mca',          label: 'MCA'            },
] as const;

export default function Topbar() {
  const { currentCourse, setCurrentCourse, config } = useCourse();
  const navigate = useNavigate();

  // Dynamic Profile States
  const [adminName, setAdminName] = useState(() => localStorage.getItem('admin_fullName') || 'Admin User');
  const [adminPhoto, setAdminPhoto] = useState(() => localStorage.getItem('admin_profilePhoto') || '');
  const [adminRole, setAdminRole] = useState(() => localStorage.getItem('admin_role') || 'Admin');

  const [searchOpen, setSearchOpen]             = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const [notifOpen, setNotifOpen]               = useState(false);
  const [profileOpen, setProfileOpen]           = useState(false);
  const [courseOpen, setCourseOpen]             = useState(false);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const courseRef  = useRef<HTMLDivElement>(null);

  // Realtime Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Helper for relative time
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const loadNotifications = async () => {
    try {
      // 1. Fetch recent students
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name, course, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // 2. Fetch recent exam results with students join
      const { data: resultsData } = await supabase
        .from('exam_results')
        .select('id, student_id, status, total_score, exam_set, created_at, students(name, course)')
        .order('created_at', { ascending: false })
        .limit(10);

      const list: any[] = [];

      // Process students
      if (studentsData) {
        studentsData.forEach((s: any) => {
          list.push({
            id: `student-${s.id}`,
            type: 'info',
            msg: `New registration: ${s.name} applied for ${s.course?.toUpperCase() || 'Admission'}`,
            time: getRelativeTime(s.created_at),
            timestamp: new Date(s.created_at).getTime(),
          });
        });
      }

      // Process exam results
      if (resultsData) {
        resultsData.forEach((r: any) => {
          const studentName = r.students?.name || 'An applicant';
          const courseName = r.students?.course?.toUpperCase() || '';
          
          if (r.status === 'Malpractice') {
            list.push({
              id: `malpractice-${r.id}`,
              type: 'danger',
              msg: `⚠️ Malpractice Alert: ${studentName} flagged in ${courseName} (Set ${r.exam_set})`,
              time: getRelativeTime(r.created_at),
              timestamp: new Date(r.created_at).getTime(),
            });
          } else if (r.status === 'Evaluated' && r.total_score >= 75) {
            list.push({
              id: `distinguished-${r.id}`,
              type: 'success',
              msg: `🏆 Outstanding Score: ${studentName} achieved ${r.total_score}/100 in ${courseName}`,
              time: getRelativeTime(r.created_at),
              timestamp: new Date(r.created_at).getTime(),
            });
          } else {
            list.push({
              id: `evaluated-${r.id}`,
              type: 'warning',
              msg: `📝 Exam Completed: ${studentName} scored ${r.total_score}/100 in ${courseName}`,
              time: getRelativeTime(r.created_at),
              timestamp: new Date(r.created_at).getTime(),
            });
          }
        });
      }

      // Sort by timestamp descending
      const sorted = list
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      // Check read status from localStorage
      const readIds = JSON.parse(localStorage.getItem('rgu_read_notification_ids') || '[]');
      const finalNotifications = sorted.map(item => ({
        ...item,
        unread: !readIds.includes(item.id)
      }));

      setNotifications(finalNotifications);
      setUnreadCount(finalNotifications.filter(n => n.unread).length);
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  };

  const handleMarkAsRead = (id: string) => {
    const readIds = JSON.parse(localStorage.getItem('rgu_read_notification_ids') || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('rgu_read_notification_ids', JSON.stringify(readIds));
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('rgu_read_notification_ids', JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  // Realtime subscription setup
  useEffect(() => {
    loadNotifications();

    const studentChannel = supabase
      .channel('realtime-students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        loadNotifications();
      })
      .subscribe();

    const examChannel = supabase
      .channel('realtime-exams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exam_results' }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(studentChannel);
      supabase.removeChannel(examChannel);
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setAdminName(localStorage.getItem('admin_fullName') || 'Admin User');
      setAdminPhoto(localStorage.getItem('admin_profilePhoto') || '');
      setAdminRole(localStorage.getItem('admin_role') || 'Admin');
    };
    window.addEventListener('admin-profile-update', handleProfileUpdate);
    return () => window.removeEventListener('admin-profile-update', handleProfileUpdate);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (courseRef.current  && !courseRef.current.contains(e.target as Node))  setCourseOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dropdownClass = 'absolute z-50 bg-white rounded-xl border border-border shadow-premium overflow-hidden';

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-border flex items-center gap-3 px-4 h-14 shrink-0">
      
      {/* Sidebar Toggle */}
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:bg-muted" />

      {/* Search */}
      <AnimatePresence initial={false}>
        {searchOpen ? (
          <motion.div
            key="search-open"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative overflow-hidden flex-shrink-0"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search students, results..."
              className="w-full h-9 pl-8 pr-8 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={13} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="search-icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0"
          >
            <Search size={17} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Course switcher */}
      <div className="relative flex-shrink-0" ref={courseRef}>
        <button
          onClick={() => setCourseOpen(v => !v)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all border border-border bg-muted/50 text-foreground hover:bg-muted"
        >
          <Sparkles size={12} />
          {config.label}
          <ChevronDown size={12} className={`transition-transform duration-150 ${courseOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {courseOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className={`${dropdownClass} right-0 top-10 w-44 py-1`}
            >
              {COURSES.map(c => (
                <button
                  key={c.value}
                  onClick={() => { setCurrentCourse(c.value); setCourseOpen(false); }}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  style={currentCourse === c.value ? { background: 'var(--muted)' } : {}}
                >
                  {c.label}
                  {currentCourse === c.value && <Check size={12} className="text-foreground" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-border flex-shrink-0" />

      {/* Notifications */}
      <div className="relative flex-shrink-0" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(v => !v)}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className={`${dropdownClass} right-0 top-11 w-80`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                {unreadCount > 0 && (
                  <span onClick={handleMarkAllRead} className="text-xs font-medium text-primary cursor-pointer hover:underline">Mark all read</span>
                )}
              </div>
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  notifications.map(n => {
                    const s = ntStyles[n.type];
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors cursor-pointer relative ${n.unread ? 'bg-primary/5' : ''}`}
                      >
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-[11px] font-semibold leading-normal ${s.text}`}>{n.msg}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">{n.time}</p>
                        </div>
                        {n.unread && (
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 self-center" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative flex-shrink-0" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(v => !v)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-muted transition-colors"
        >
          {adminPhoto ? (
            <img 
              src={adminPhoto} 
              alt="Admin Avatar" 
              className="w-6 h-6 rounded-full object-cover shrink-0 border border-border shadow-sm" 
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm border border-border">
              {adminName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-foreground leading-none">{adminName}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{adminRole}</p>
          </div>
          <ChevronDown size={12} className="text-muted-foreground hidden sm:block" />
        </button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className={`${dropdownClass} right-0 top-11 w-48 py-1`}
            >
              {[
                { icon: UserCircle, label: 'My Profile',   action: () => navigate('/settings') },
                { icon: FileText,   label: 'Activity Log', action: () => {} },
                { icon: Settings,   label: 'Settings',     action: () => navigate('/settings') },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <item.icon size={14} className="text-muted-foreground" />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={() => {
                    localStorage.removeItem('rgu_authenticated');
                    navigate('/login');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
