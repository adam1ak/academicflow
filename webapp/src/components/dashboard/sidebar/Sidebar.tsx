import AlertsPanel from "./AlertsPanel";
import Deadlines from "./Deadlines";
import ScheduleHealth from "./ScheduleHealth";
import WeeklyLoad from "./WeeklyLoad";
import { useAdvisor } from "../../../context/AdvisorContext";

export function Sidebar() {
  const { isOpen } = useAdvisor();

  return (
    <aside
      className={`shrink-0 transition-all duration-200 ${
        isOpen
          ? "w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:flex 2xl:flex-col 2xl:w-[280px] 2xl:overflow-y-auto gap-3"
          : "w-full lg:w-[280px] grid grid-cols-1 gap-3 md:grid-cols-3 lg:flex lg:flex-col lg:overflow-y-auto"
      }`}
    >
      <WeeklyLoad />
      <ScheduleHealth />
      <AlertsPanel />
      <Deadlines />
    </aside>
  );
}