import AlertsPanel from "./AlertsPanel";
import Deadlines from "./Deadlines";
import ScheduleHealth from "./ScheduleHealth";
import WeeklyLoad from "./WeeklyLoad";
import { useAdvisor } from "../../../context/AdvisorContext";

export function Sidebar() {
  const { isOpen } = useAdvisor();

  return (
    <aside className={`shrink-0 flex flex-col gap-3 ${
      isOpen
        ? "w-full 2xl:w-[280px] 2xl:overflow-y-auto"
        : "w-full lg:w-[280px] lg:overflow-y-auto"
    }`}>
      <ScheduleHealth />
      <WeeklyLoad />
      <AlertsPanel />
      <Deadlines />
    </aside>
  );
}
