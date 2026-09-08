import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ClipboardList,
  BarChart2, Settings, Bell, Search, ChevronDown,
  LogOut, UserCircle, FileText, X, Sparkles, Check
} from 'lucide-react';
import { useCourse } from '@/context/CourseContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Applicants', icon: Users, path: '/students' },
  { label: 'Exam Results', icon: ClipboardList, path: '/scholarships' },
  { label: 'Analytics', icon: BarChart2, path: '/analytics' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

const notifications = [
  { id: 1, type: 'warning', msg: '3 students flagged for malpractice', time: '2m ago' },
  { id: 2, type: 'info', msg: '12 new applications submitted today', time: '15m ago' },
  { id: 3, type: 'success', msg: 'Ram Kannan approved for scholarship', time: '1h ago' },
  { id: 4, type: 'danger', msg: '5 payment dues pending review', time: '2h ago' },
];

const ntColors: Record<string, string> = {
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  danger: 'bg-red-50 border-red-200 text-red-700',
};

const COURSES = [
  { value: 'bba', label: 'BBA' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'arts_science', label: 'Arts & Science' },
  { value: 'mba', label: 'MBA' },
  { value: 'mca', label: 'MCA' },
] as const;

export default function Navbar() {
  const { currentCourse, setCurrentCourse, config } = useCourse();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [adminName, setAdminName] = useState(() => localStorage.getItem('admin_fullName') || 'Admin User');
  const [adminRole, setAdminRole] = useState(() => localStorage.getItem('admin_role') || 'Admin');
  const navigate = useNavigate();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const courseSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (courseSelectorRef.current && !courseSelectorRef.current.contains(e.target as Node)) setCourseDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setAdminName(localStorage.getItem('admin_fullName') || 'Admin User');
      setAdminRole(localStorage.getItem('admin_role') || 'Admin');
    };
    window.addEventListener('admin-profile-update', handleProfileUpdate);
    return () => window.removeEventListener('admin-profile-update', handleProfileUpdate);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-soft h-[64px] flex items-center px-6 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <Sparkles size={15} className="text-primary-foreground" />
        </div>
        <span className="text-base font-bold tracking-tight text-foreground font-heading">
          RGU<span className="text-primary">DB</span>
        </span>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Global Course Switcher */}
      <div className="relative" ref={courseSelectorRef}>
        <button
          onClick={() => setCourseDropdownOpen(v => !v)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/8 hover:bg-primary/15 border border-primary/25 rounded-lg text-xs font-semibold text-primary transition-all"
        >
          <span>{config.label}</span>
          <ChevronDown size={13} className={`transition-transform duration-200 ${courseDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {courseDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 top-10 w-44 bg-popover rounded-xl border border-border shadow-premium z-50 overflow-hidden py-1"
            >
              {COURSES.map(c => (
                <button
                  key={c.value}
                  onClick={() => { setCurrentCourse(c.value); setCourseDropdownOpen(false); }}
                  className={`flex items-center justify-between w-full px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors ${
                    currentCourse === c.value ? 'bg-primary/6 text-primary' : ''
                  }`}
                >
                  <span>{c.label}</span>
                  {currentCourse === c.value && <Check size={13} className="text-primary" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center gap-0.5 flex-1">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon size={15} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Search */}
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="relative overflow-hidden"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search students, apps..."
                className="w-full pl-8 pr-8 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={13} />
              </button>
            </motion.div>
          ) : (
            <Button variant="ghost" size="icon-sm" onClick={() => setSearchOpen(true)}>
              <Search size={17} />
            </Button>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setNotifOpen(v => !v)}
            className="relative"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
          </Button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-10 w-80 bg-popover rounded-xl border border-border shadow-premium z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Notifications</p>
                  <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="divide-y divide-border max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`mx-3 my-2 px-3 py-2.5 text-xs border-l-2 rounded-lg ${ntColors[n.type]}`}>
                      <p className="font-medium">{n.msg}</p>
                      <p className="opacity-70 mt-0.5">{n.time}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-muted transition-colors ml-1"
          >
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">A</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-foreground leading-none">{adminName}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{adminRole}</p>
            </div>
            <ChevronDown size={13} className="text-muted-foreground hidden md:block" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-11 w-48 bg-popover rounded-xl border border-border shadow-premium z-50 overflow-hidden py-1"
              >
                {[
                  { icon: UserCircle, label: 'My Profile', action: () => {} },
                  { icon: FileText, label: 'Activity Log', action: () => {} },
                  { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
                ].map(item => (
                  <button key={item.label} onClick={item.action} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
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
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/8 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
