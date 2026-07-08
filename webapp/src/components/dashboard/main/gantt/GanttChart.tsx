import { useMemo } from "react"
import { usePlan } from "../../../../context/PlanContext"
import { SubjectScheduleItem, SubjectDetailResponse } from "../../../../types/plan"
import { DeadlineResponse } from "../../../../types/deadline"

const TOTAL_WEEKS = 12
const LABEL_WIDTH = 170
const ROW_HEIGHT = 48
const BAR_HEIGHT = 28

interface GanttRow {
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

function buildRows(
  schedule: SubjectScheduleItem[],
  subjects: SubjectDetailResponse[]
): GanttRow[] {
  const subjectMap = new Map(subjects.map(s => [s.name, s]))

  return schedule
    .map(item => {
      const subject = subjectMap.get(item.name)
      return {
        name: item.name,
        classroom: subject?.classroom ?? null,
        status: (subject?.status ?? "blocked") as GanttRow["status"],
        startWeek: item.start_time,
        endWeek: Math.min(item.end_time, TOTAL_WEEKS),
        duration: Math.min(item.end_time, TOTAL_WEEKS) - item.start_time,
      }
    })
    .sort((a, b) => a.startWeek - b.startWeek || a.name.localeCompare(b.name))
}

function getBarLabel(status: GanttRow["status"]) {
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

export default function GanttChart() {
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

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center text-sec font-mono text-xs min-h-[120px]">
        No schedule data available. Add subjects to build the timeline.
      </div>
    )
  }

  return (
    <div style={{ minWidth: "1050px" }} className="min-w-[850px] md:min-w-[1050px] lg:min-w-[1200px] xl:min-w-[1350px]">
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

      {rows.map((row, idx) => {
        const leftPct = ((row.startWeek / TOTAL_WEEKS) * 100).toFixed(2)
        const widthPct = ((row.duration / TOTAL_WEEKS) * 100).toFixed(2)

        return (
          <div
            key={idx}
            className="flex items-center mb-2"
            style={{ height: `${ROW_HEIGHT}px`, cursor: "default" }}
          >
            <div style={{ width: `${LABEL_WIDTH}px`, flexShrink: 0, paddingRight: "12px" }}>
              <div
                className="font-sans text-[12px] font-semibold overflow-hidden whitespace-nowrap text-ellipsis"
                style={{ color: "#cbd5e1" }}
                title={row.name}
              >
                {row.name}
              </div>
              <div className="font-mono font-medium" style={{ fontSize: "10px", color: "#475569" }}>
                {row.classroom || "—"} · {row.duration}W
              </div>
            </div>

            <div className="flex-1 relative" style={{ height: "100%", marginRight: "32px" }}>
              <div className="absolute inset-0 flex">
                {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{
                      borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)",
                    }}
                  />
                ))}
              </div>

              <div
                className={`gantt-bar-status-${row.status}`}
                style={{
                  position: "absolute",
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: `${BAR_HEIGHT}px`,
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "10px",
                  overflow: "hidden",
                  zIndex: 2,
                  background: `var(--color-status-${row.status}-bg)`,
                  border: `1px solid var(--color-status-${row.status}-border)`,
                }}
              >
                <span
                  className="font-mono font-semibold whitespace-nowrap"
                  style={{
                    fontSize: "10px",
                    color: row.status === "completed" ? "var(--color-status-completed-text)" : row.status === "ready" ? "var(--color-blue-soft)" : "var(--color-status-blocked-text)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {getBarLabel(row.status)}
                </span>
              </div>

              {deadlineMarks
                .filter(d => assignedDeadlinesMap.get(d.id) === row.name)
                .map((d, di) => {
                  const isFirstWeek = d.week === row.startWeek + 1
                  const targetWeek = isFirstWeek ? d.week : d.week - 0.5
                  const markerLeftPct = ((targetWeek / TOTAL_WEEKS) * 100).toFixed(2)
                  return (
                    <div
                      key={di}
                      className="gantt-deadline-marker"
                      title={d.label}
                      style={{
                        position: "absolute",
                        left: `${markerLeftPct}%`,
                        top: "50%",
                        transform: "translate(-50%, -18px) rotate(45deg)",
                        width: "11px",
                        height: "11px",
                        background: d.color,
                        borderRadius: "1px",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 5px rgba(0, 0, 0, 0.6)",
                        zIndex: 3,
                      }}
                    />
                  )
                })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
