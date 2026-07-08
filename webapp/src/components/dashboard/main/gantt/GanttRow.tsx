import { useState } from "react"
import GanttTooltip from "./GanttTooltip"

const TOTAL_WEEKS = 12
const LABEL_WIDTH = 170
const ROW_HEIGHT = 48
const BAR_HEIGHT = 28

interface GanttRowProps {
  row: {
    name: string
    classroom: string | null
    status: "ready" | "blocked" | "completed"
    startWeek: number
    endWeek: number
    duration: number
  }
  deadlineMarks: Array<{
    id: number
    week: number
    label: string
    type: string
    color: string
  }>
  assignedDeadlinesMap: Map<number, string>
  isDimmed: boolean
  isMarkerDimmed: (d: { id: number; week: number; label: string; type: string; color: string }) => boolean
  getBarLabel: (status: string) => string
  currentWeek: number | null
}

export default function GanttRow({
  row,
  deadlineMarks,
  assignedDeadlinesMap,
  isDimmed,
  isMarkerDimmed,
  getBarLabel,
  currentWeek
}: GanttRowProps) {
  const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null)

  const leftPct = ((row.startWeek / TOTAL_WEEKS) * 100).toFixed(2)
  const widthPct = ((row.duration / TOTAL_WEEKS) * 100).toFixed(2)

  const rowDeadlines = deadlineMarks.filter(
    d => assignedDeadlinesMap.get(d.id) === row.name
  )

  return (
    <div
      className="gantt-row flex items-center mb-2"
      style={{
        height: `${ROW_HEIGHT}px`,
        cursor: "default",
        opacity: isDimmed ? 0.2 : 1
      }}
    >
      <div style={{ width: `${LABEL_WIDTH}px`, flexShrink: 0, paddingRight: "12px" }}>
        <div
          className="gantt-row-name font-sans text-[12px] font-semibold overflow-hidden whitespace-nowrap text-ellipsis transition-colors"
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
          {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
            const isCurrentBoundary = currentWeek !== null && i === currentWeek
            return (
              <div
                key={i}
                className="flex-1"
                style={{
                  borderLeft: i === 0 
                    ? "none" 
                    : `1px solid ${isCurrentBoundary ? "rgba(255, 255, 255, 0.24)" : "rgba(255, 255, 255, 0.04)"}`,
                }}
              />
            )
          })}
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

        {rowDeadlines.map((d, di) => {
          const isFirstWeek = d.week === row.startWeek + 1
          const targetWeek = isFirstWeek ? d.week : d.week - 0.5
          const markerLeftPct = ((targetWeek / TOTAL_WEEKS) * 100).toFixed(2)
          const markerDimmed = isMarkerDimmed(d)
          const isHovered = hoveredMarkerId === d.id

          return (
            <div key={di}>
              <div
                className="gantt-deadline-marker"
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
                  zIndex: isHovered ? 40 : 3,
                  opacity: markerDimmed ? 0.15 : 1,
                  cursor: "pointer"
                }}
                onMouseEnter={() => setHoveredMarkerId(d.id)}
                onMouseLeave={() => setHoveredMarkerId(null)}
              />
              {isHovered && (
                <GanttTooltip
                  label={d.label}
                  type={d.type}
                  week={d.week}
                  color={d.color}
                  leftPct={markerLeftPct}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
