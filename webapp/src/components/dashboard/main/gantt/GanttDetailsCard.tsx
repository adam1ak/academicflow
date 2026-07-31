import { RefObject } from "react"
import { GanttRowData, GanttDeadlineMark } from "./ganttUtils"
import { usePlan } from "../../../../context/PlanContext"
import { useToggleCompleteMutation } from "../../../../hooks/queries/useToggleCompleteMutation"

interface GanttDetailsCardProps {
  cardRef: RefObject<HTMLDivElement | null>
  selectedRowName: string | null
  displayedRow: GanttRowData | null
  getBarLabel: (status: string) => string
  deadlineMarks: GanttDeadlineMark[]
  assignedDeadlinesMap: Map<number, string>
  setHoveredCardDeadlineId: (id: number | null) => void
  isFullscreen: boolean
}

export default function GanttDetailsCard({
  cardRef,
  selectedRowName,
  displayedRow,
  getBarLabel,
  deadlineMarks,
  assignedDeadlinesMap,
  setHoveredCardDeadlineId,
  isFullscreen
}: GanttDetailsCardProps) {
  const { activePlanId, subjects } = usePlan()
  const toggleMutation = useToggleCompleteMutation(activePlanId)

  const targetSubject = subjects.find(s => s.name === displayedRow?.name)

  return (
    <div 
      ref={cardRef}
      onClick={(e) => e.stopPropagation()}
      className={`rounded-xl border border-dim bg-surface/60 backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ease-in-out overflow-hidden ${isFullscreen ? "max-w-5xl mx-auto w-full" : ""}`}
      style={{
        maxHeight: selectedRowName ? "200px" : "0px",
        opacity: selectedRowName ? 1 : 0,
        marginTop: selectedRowName ? "16px" : "0px",
        padding: selectedRowName ? "16px" : "0px",
        borderWidth: selectedRowName ? "1px" : "0px",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale"
      }}
    >
      {displayedRow && (
        <>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans font-bold text-sm text-pri">{displayedRow.name}</span>
              <span 
                className="font-mono text-[9px] rounded-full px-2 py-0.5 font-bold border"
                style={{
                  background: `var(--color-status-${displayedRow.status}-bg)`,
                  borderColor: `var(--color-status-${displayedRow.status}-border)`,
                  color: displayedRow.status === "completed" ? "var(--color-status-completed-text)" : displayedRow.status === "ready" ? "var(--color-blue-soft)" : "var(--color-status-blocked-text)",
                }}
              >
                {getBarLabel(displayedRow.status)}
              </span>

              {targetSubject && (
                <button
                  type="button"
                  disabled={toggleMutation.isPending}
                  onClick={() => toggleMutation.mutate(targetSubject.id)}
                  className="font-mono text-[9px] rounded-md px-2 py-0.5 font-semibold border border-dim bg-surface/50 text-pri hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {displayedRow.status === "completed" ? "✓ Done (Click to undo)" : "○ Mark Complete"}
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sec font-mono text-[10px]">
              <div>Classroom: <span className="text-pri font-sans font-medium">{displayedRow.classroom || "—"}</span></div>
              <div>Weeks: <span className="text-pri font-sans font-medium">W{displayedRow.startWeek + 1}–W{displayedRow.endWeek}</span></div>
              <div>Duration: <span className="text-pri font-sans font-medium">{displayedRow.duration} Weeks</span></div>
            </div>
          </div>

          <div className="flex-1 md:max-w-[50%] flex flex-col gap-1.5 md:items-end">
            <span className="font-mono text-[9px] text-sec uppercase tracking-widest font-bold">Deadlines</span>
            <div className="flex flex-wrap gap-2 md:justify-end max-h-[90px] overflow-y-auto w-full pr-1 scrollbar-thin">
              {deadlineMarks.filter(d => assignedDeadlinesMap.get(d.id) === displayedRow.name).length === 0 ? (
                <span className="font-mono text-[9px] text-mut">No deadlines for this subject</span>
              ) : (
                deadlineMarks
                  .filter(d => assignedDeadlinesMap.get(d.id) === displayedRow.name)
                  .map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-dim bg-surface/50 text-[10px] font-mono font-semibold cursor-pointer hover:bg-white/5 transition-all select-none"
                      style={{ color: d.color }}
                      onMouseEnter={() => setHoveredCardDeadlineId(d.id)}
                      onMouseLeave={() => setHoveredCardDeadlineId(null)}
                    >
                      <div className="w-1.5 h-1.5 rounded-xs" style={{ background: d.color }} />
                      <span>{d.label} (W{d.week})</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
