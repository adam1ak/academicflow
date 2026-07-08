import { useMemo } from "react"
import { usePlan } from "../../../../context/PlanContext"
import { SubjectScheduleItem, SubjectDetailResponse } from "../../../../types/plan"
import { DeadlineResponse } from "../../../../types/deadline"
import { LegendStatus } from "../GanttPanel"
import GanttRow from "./GanttRow"

const TOTAL_WEEKS = 12
const LABEL_WIDTH = 170

interface GanttRowData {
  name: string
  classroom: string | null
  status: "ready" | "blocked" | "completed"
  startWeek: number
  endWeek: number
  duration: number
}

interface GanttDeadlineMark {
  id: number
  week: number
  label: string
  type: string
  color: string
}

interface GanttChartProps {
  hoveredLegendStatus: LegendStatus
}

function buildRows(
  schedule: SubjectScheduleItem[],
  subjects: SubjectDetailResponse[]
): GanttRowData[] {
  const subjectMap = new Map(subjects.map(s => [s.name, s]))

  return schedule
    .map(item => {
      const subject = subjectMap.get(item.name)
      return {
        name: item.name,
        classroom: subject?.classroom ?? null,
        status: (subject?.status ?? "blocked") as GanttRowData["status"],
        startWeek: item.start_time,
        endWeek: Math.min(item.end_time, TOTAL_WEEKS),
        duration: Math.min(item.end_time, TOTAL_WEEKS) - item.start_time,
      }
    })
    .sort((a, b) => a.startWeek - b.startWeek || a.name.localeCompare(b.name))
}

function getBarLabel(status: string) {
  switch (status) {
    case "completed": return "✓ Done"
    case "ready": return "▶ Active"
    default: return "⊘ Locked"
  }
}

function getDeadlineColor(type: string): string {
  switch (type.toLowerCase()) {
    case "exam":
      return "var(--color-accent-red)"
    case "assignment":
      return "var(--color-accent-amber)"
    case "project":
      return "var(--color-accent-purple)"
    case "task":
      return "var(--color-accent-pink)"
    default:
      return "var(--color-accent-teal)"
  }
}

function mapDeadlines(
  deadlines: DeadlineResponse[],
  startDateStr?: string | null
): GanttDeadlineMark[] {
  if (!startDateStr || deadlines.length === 0) return []
  const startDate = new Date(startDateStr)

  return deadlines.map(d => {
    const dueDate = new Date(d.due_date)
    const diffMs = dueDate.getTime() - startDate.getTime()
    const diffDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)))
    const week = Math.max(1, Math.min(TOTAL_WEEKS, Math.floor(diffDays / 7) + 1))

    return {
      id: d.id,
      week,
      label: d.title,
      type: d.type,
      color: getDeadlineColor(d.type)
    }
  })
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export default function GanttChart({ hoveredLegendStatus }: GanttChartProps) {
  const { activePlan, subjects, deadlines } = usePlan()
  const schedule = activePlan?.schedule ?? []

  const rows = useMemo(() => buildRows(schedule, subjects), [schedule, subjects])

  const deadlineMarks = useMemo(
    () => mapDeadlines(deadlines, activePlan?.start_date),
    [deadlines, activePlan?.start_date]
  )

  const assignedDeadlinesMap = useMemo(() => {
    const map = new Map<number, string>()
    
    deadlineMarks.forEach(d => {
      const activeRows = rows.filter(r => d.week > r.startWeek && d.week <= r.endWeek)
      if (activeRows.length > 0) {
        const selectedRow = activeRows[hashCode(d.label) % activeRows.length]
        map.set(d.id, selectedRow.name)
      }
    })
    
    return map
  }, [deadlineMarks, rows])

  const currentWeek = useMemo(() => {
    if (!activePlan?.start_date) return null
    const startDate = new Date(activePlan.start_date)
    const today = new Date()
    const diffMs = today.getTime() - startDate.getTime()
    const diffDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)))
    const week = Math.floor(diffDays / 7) + 1
    if (week >= 1 && week <= 12) {
      return week
    }
    return null
  }, [activePlan?.start_date])

  const isRowDimmed = (row: GanttRowData) => {
    if (!hoveredLegendStatus) return false
    if (hoveredLegendStatus === "active") return row.status !== "ready"
    if (hoveredLegendStatus === "upcoming") return row.status !== "blocked"
    
    const rowDeadlines = deadlineMarks.filter(d => assignedDeadlinesMap.get(d.id) === row.name)
    return !rowDeadlines.some(d => d.type.toLowerCase() === hoveredLegendStatus)
  }

  const isMarkerDimmed = (d: GanttDeadlineMark) => {
    if (!hoveredLegendStatus) return false
    if (["active", "upcoming"].includes(hoveredLegendStatus)) return false
    return d.type.toLowerCase() !== hoveredLegendStatus
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center text-sec font-mono text-xs min-h-[120px]">
        No schedule data available. Add subjects to build the timeline.
      </div>
    )
  }

  return (
    <div style={{ minWidth: "1050px" }} className="min-w-[850px] md:min-w-[1050px] lg:min-w-[1200px] xl:min-w-[1350px]">
      <style>{`
        .gantt-row {
          transition: opacity 0.15s ease, background-color 0.15s ease;
        }
        .gantt-row:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }
        .gantt-row:hover .gantt-row-name {
          color: #ffffff !important;
        }
        .gantt-row:hover .gantt-bar-status-ready {
          border-color: rgba(96, 165, 250, 0.6) !important;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.25);
        }
        .gantt-row:hover .gantt-bar-status-completed {
          border-color: rgba(74, 222, 128, 0.6) !important;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.25);
        }
        .gantt-row:hover .gantt-bar-status-blocked {
          border-color: rgba(161, 161, 170, 0.4) !important;
        }
        .gantt-deadline-marker {
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        }
        .gantt-deadline-marker:hover {
          transform: translate(-50%, -18px) rotate(45deg) scale(1.3) !important;
          box-shadow: 0 0 8px currentColor;
        }
      `}</style>

      <div className="flex mb-3" style={{ marginLeft: `${LABEL_WIDTH}px`, marginRight: "32px" }}>
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
          const weekNum = i + 1
          return (
            <div
              key={i}
              className="flex-1 text-center font-mono font-medium tracking-wider"
              style={{
                fontSize: "10px",
                color: "#475569"
              }}
            >
              W{weekNum}
            </div>
          )
        })}
      </div>

      <div className="relative">
        {rows.map((row, idx) => (
          <GanttRow
            key={idx}
            row={row}
            deadlineMarks={deadlineMarks}
            assignedDeadlinesMap={assignedDeadlinesMap}
            isDimmed={isRowDimmed(row)}
            isMarkerDimmed={isMarkerDimmed}
            getBarLabel={getBarLabel}
            currentWeek={currentWeek}
          />
        ))}
      </div>
    </div>
  )
}
