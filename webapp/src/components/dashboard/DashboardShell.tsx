import { ReactNode } from 'react';
import { AdvisorPanel } from '../AdvisorPanel';
import { useAdvisor } from '../../context/AdvisorContext';

interface DashboardShellProps {
  navbar: ReactNode;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

export function DashboardShell({ navbar, mainContent, sidebarContent }: DashboardShellProps) {
  const { isOpen } = useAdvisor()

  return (
    <div id="app" className="h-screen flex flex-col overflow-hidden">
      {navbar}
      <div className="flex-1 p-2 min-h-0 flex gap-4 flex-col lg:flex-row overflow-hidden relative">
        <div className={`flex-1 min-h-0 min-w-0 flex gap-4 overflow-y-auto ${
            isOpen
              ? "flex-col 2xl:flex-row"
              : "flex-col lg:flex-row"
          }`}>
          {mainContent}
          {sidebarContent}
        </div>

        <AdvisorPanel />
      </div>
    </div>
  );
}
