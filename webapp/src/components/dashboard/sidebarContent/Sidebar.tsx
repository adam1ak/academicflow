import AlertsPanel from "./AlertsPanel";
import Deadlines from "./Deadlines";
import ScheduleHealth from "./ScheduleHealth";
import WeeklyLoad from "./WeeklyLoad";

export function Sidebar() {
  return (
    <aside className="w-full lg:w-[280px] shrink-0 grid grid-cols-1 md:grid-cols-3 lg:flex lg:flex-col lg:overflow-y-auto">
      
      <div className="md:col-span-3 lg:col-span-1">
        <WeeklyLoad />
      </div>

      <ScheduleHealth />
      <AlertsPanel />
      <Deadlines />
    </aside>
  );
}