import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppSidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function MainLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
          <div className="w-full px-5 py-6">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  );
}
