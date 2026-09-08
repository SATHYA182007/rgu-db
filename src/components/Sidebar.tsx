import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardList,
  BarChart2, Settings, GraduationCap, LogOut
} from 'lucide-react';
import { useCourse } from '@/context/CourseContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/' },
  { label: 'Applicants',   icon: Users,           path: '/students' },
  { label: 'Exam Results', icon: ClipboardList,   path: '/scholarships' },
  { label: 'Analytics',    icon: BarChart2,       path: '/analytics' },
  { label: 'Settings',     icon: Settings,        path: '/settings' },
];

export default function AppSidebar() {
  const navigate = useNavigate();
  const { config } = useCourse();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Sidebar Header: Dynamic horizontal padding to center the shield icon perfectly when collapsed */}
      <SidebarHeader className="border-b border-sidebar-border pb-5 pt-5 px-4 group-data-[collapsible=icon]:px-0 flex items-center group-data-[collapsible=icon]:justify-center">
        {/* Brand Logo Container */}
        <div className="flex items-center w-full justify-start group-data-[collapsible=icon]:justify-center">
          {/* Expanded view: full logo banner (cropped, transparent, optimized dark slate text) */}
          <img 
            src="/rgu-img.png" 
            alt="RGU Logo" 
            className="h-16 w-auto object-contain max-w-[230px] group-data-[collapsible=icon]:hidden"
          />
          {/* Collapsed view: square shield icon centered with soft shadow */}
          <img 
            src="/rathinam.png" 
            alt="Rathinam Logo" 
            className="hidden group-data-[collapsible=icon]:block w-10 h-10 object-contain shrink-0 rounded-xl shadow-soft"
          />
        </div>
      </SidebarHeader>

      {/* Sidebar Content: Dynamic horizontal padding to prevent icon button clipping when collapsed */}
      <SidebarContent className="px-3 group-data-[collapsible=icon]:px-1 py-2 space-y-4">
        {/* Course badge: Converts from wide banner to a sleek centered w-10 square icon when collapsed */}
        <SidebarGroup className="pt-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mx-auto">
          <div className="flex items-center gap-3.5 rounded-2xl bg-primary/10 px-5 py-4 text-primary shadow-soft group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto shrink-0">
            <GraduationCap size={22} className="shrink-0" />
            <span className="text-[15px] font-bold group-data-[collapsible=icon]:hidden">{config.label}</span>
          </div>
        </SidebarGroup>

        {/* Navigation Section */}
        <SidebarGroup className="group-data-[collapsible=icon]:p-0">
          <SidebarGroupLabel className="px-4 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/50 mb-3 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu className="gap-2 group-data-[collapsible=icon]:gap-3 group-data-[collapsible=icon]:p-0">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                {/* Menu button: transitions to a centered w-10 rounded block with no padding overrides when collapsed */}
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.label} 
                  className="h-12! px-4! rounded-xl [&_svg]:w-[22px]! [&_svg]:h-[22px]! gap-3.5! group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:mx-auto"
                >
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-bold text-[16px]'
                        : 'text-[16px] font-semibold text-foreground/75 hover:text-foreground'
                    }
                  >
                    <item.icon className="shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer: Dynamically centered layout when collapsed */}
      <SidebarFooter className="border-t border-sidebar-border pb-5 pt-5 px-4 group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="group-data-[collapsible=icon]:p-0">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            {/* Sign Out Button: transitions to a centered w-10 rounded block when collapsed */}
            <SidebarMenuButton
              onClick={() => {
                localStorage.removeItem('rgu_authenticated');
                navigate('/login');
              }}
              className="h-12! px-4! rounded-xl [&_svg]:w-[22px]! [&_svg]:h-[22px]! gap-3.5! text-[16px] font-semibold text-muted-foreground/80 hover:bg-destructive/10 hover:text-destructive hover:font-bold group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:mx-auto"
            >
              <LogOut className="shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
