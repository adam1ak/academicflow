import { useRef, useState } from "react";
import { useFullscreen } from "../../../hooks/useFullscreen";
import { FullscreenIcon, ExitFullscreenIcon } from "../../ui/FullscreenIcons";
import { usePlan } from "../../../context/PlanContext";
import GanttChart from "./gantt/GanttChart";

export function GanttPanel() {
  const ganttRef = useRef<HTMLElement>(null)
  const { isFullscreen, toggle } = useFullscreen(ganttRef)
  const { activePlan, subjects } = usePlan()
  const [showHint, setShowHint] = useState(true)

  const formatSemester = (sem?: string) => {
    if (!sem) return "Current Semester"
    const val = sem.toLowerCase().trim()
    if (val.startsWith("fall")) {
      const year = val.replace("fall", "")
      return `Fall 20${year}`
    }
    if (val.startsWith("spr")) {
      const year = val.replace("spr", "")
      return `Spring 20${year}`
    }
    return sem.charAt(0).toUpperCase() + sem.slice(1)
  }

  const semesterLabel = formatSemester(activePlan?.semester)
  const creditEstimate = subjects.length * 3

  return (
    <section ref={ganttRef} className={`bg-surface border border-dim rounded-xl overflow-hidden flex flex-col shrink-0 min-w-0 ${isFullscreen ? "panel-full-screen" : ""}`}>
      <header className="w-full flex flex-col items-start gap-3 p-3.5 border-b border-dim bg-surface shrink-0 min-[888px]:flex-row min-[888px]:items-center min-[888px]:justify-between">
        <div className="flex items-start justify-between w-full min-[888px]:w-auto">
          <div>
            <h2 className="text-sm font-semibold text-pri tracking-tight">Semester Timeline</h2>
            <p className="font-mono text-[10px] text-sec mt-0.5">
              Weeks 1–12 · {semesterLabel} · {creditEstimate} credits
            </p>
          </div>
          <button
            onClick={toggle}
            className="border border-dim rounded-md text-sec text-sm px-2 py-1 hover:bg-white/5 transition-colors leading-none min-[888px]:hidden"
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3.5 w-full min-[888px]:w-auto min-[888px]:justify-end">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-xs bg-accent-blue" />
              <span className="font-mono text-[10px] text-sec">Active</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-xs bg-[#3f3f46]" />
              <span className="font-mono text-[10px] text-sec">Upcoming</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-xs bg-accent-amber" />
              <span className="font-mono text-[10px] text-sec">Assignment</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-xs bg-accent-red" />
              <span className="font-mono text-[10px] text-sec">Exam</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-xs bg-accent-purple" />
              <span className="font-mono text-[10px] text-sec">Project</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-xs bg-accent-pink" />
              <span className="font-mono text-[10px] text-sec">Task</span>
            </div>
          </div>

          <button
            onClick={toggle}
            className="hidden min-[888px]:block border border-dim rounded-md text-sec text-sm px-2 py-1 hover:bg-white/5 transition-colors leading-none"
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </button>
        </div>
      </header>

      <div className={`${isFullscreen ? "flex-1 min-h-0" : ""} overflow-auto`}>
        {showHint && (
          <div 
            onClick={() => setShowHint(false)}
            className="sm:hidden mx-4 mt-2 px-3 py-2 rounded-lg flex items-center gap-2.5 cursor-pointer bg-hint-bg border border-hint-border hover:bg-hint-bg/80 transition-colors"
          >
            <span>↺</span>
            <span className="text-xs flex-1 leading-snug text-hint-text">Scroll horizontally to see all 12 weeks.</span>
            <span className="text-xs text-sec">✕</span>
          </div>
        )}

        <div className="p-3 sm:p-4">
          <GanttChart />
        </div>
      </div>
    </section>
  );
}
