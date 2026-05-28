import { ReactNode } from 'react';

interface DashboardShellProps {
  navbar: ReactNode;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

export function DashboardShell({ navbar, mainContent, sidebarContent }: DashboardShellProps) {
  return (
    <div id="app" className="h-screen flex flex-col overflow-hidden">
      {navbar}
      <div className="flex-1 p-2 min-h-0 flex gap-4 flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {mainContent}
        {sidebarContent}
      </div>
    </div>
  );
}
