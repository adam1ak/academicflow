import { useState, useEffect, useMemo } from "react"
import { LegendStatus } from "../GanttPanel"
import GanttTooltip, { GanttTooltipItem } from "./GanttTooltip"

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
  isSelected: boolean
  onRowClick: () => void
  isMarkerDimmed: (d: { id: number; week: number; label: string; type: string; color: string }) => boolean
  getBarLabel: (status: string) => string
  currentWeek: number | null
  rowIdx: number
  hoveredLegendStatus: LegendStatus
  hoveredCardDeadlineId: number | null
  isFullscreen: boolean
}

export default function GanttRow({
  row,
  deadlineMarks,
  assignedDeadlinesMap,
  isDimmed,
  isSelected,
  onRowClick,
  isMarkerDimmed,
  getBarLabel,
  currentWeek,
  rowIdx,
  hoveredLegendStatus,
  hoveredCardDeadlineId,
  isFullscreen
}: GanttRowProps) {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null)
  const [barWidth, setBarWidth] = useState("0%")

  const leftPct = ((row.startWeek / TOTAL_WEEKS) * 100).toFixed(2)
  const widthPct = ((row.duration / TOTAL_WEEKS) * 100).toFixed(2)

  const rowDeadlines = deadlineMarks.filter(
    d => assignedDeadlinesMap.get(d.id) === row.name
  )

  const deadlinesByWeek = useMemo(() => {
    const map = new Map<number, typeof rowDeadlines>()
    rowDeadlines.forEach(d => {
      const list = map.get(d.week) || []
      list.push(d)
      map.set(d.week, list)
    })
    return map
  }, [rowDeadlines])

  const weekEntries = useMemo(() => {
    return Array.from(deadlinesByWeek.entries())
  }, [deadlinesByWeek])

  const rowHeight = isFullscreen ? 60 : ROW_HEIGHT
  const barHeight = isFullscreen ? 36 : BAR_HEIGHT
  const markerSize = isFullscreen ? 13 : 11
  const borderSize = isFullscreen ? "2.5px" : "2px"

  useEffect(() => {
    const timer = setTimeout(() => {
      setBarWidth(`${widthPct}%`)
    }, rowIdx * 40)
    return () => clearTimeout(timer)
  }, [widthPct, rowIdx])

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onRowClick()
      }}
      className={`gantt-row flex items-center mb-2 rounded-lg ${isSelected ? "selected" : ""}`}
      style={{
        height: `${rowHeight}px`,
        cursor: "pointer",
        opacity: isDimmed ? 0.15 : 1
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
            width: barWidth,
            top: "50%",
            transform: "translateY(-50%)",
            height: `${barHeight}px`,
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            paddingLeft: "10px",
            overflow: "hidden",
            zIndex: 2,
            background: `var(--color-status-${row.status}-bg)`,
            border: `1px solid var(--color-status-${row.status}-border)`,
            transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          <span
            className="font-mono font-semibold whitespace-nowrap"
            style={{
              fontSize: isFullscreen ? "11px" : "10px",
              color: row.status === "completed" ? "var(--color-status-completed-text)" : row.status === "ready" ? "var(--color-blue-soft)" : "var(--color-status-blocked-text)",
              letterSpacing: "0.04em",
            }}
          >
            {getBarLabel(row.status)}
          </span>
        </div>

        {weekEntries.map(([week, list]) => {
          const d = list[0]
          const isFirstWeek = week === row.startWeek + 1
          const targetWeek = isFirstWeek ? week : week - 0.5
          const markerLeftPct = ((targetWeek / TOTAL_WEEKS) * 100).toFixed(2)

          const hasCardHover = list.some(item => hoveredCardDeadlineId === item.id)
          const hasLegendHover = list.some(item => hoveredLegendStatus === item.type.toLowerCase())
          const isHighlighted = hasLegendHover || hasCardHover
          
          const isHovered = hoveredWeek === week
          const anyDimmed = list.every(item => isMarkerDimmed(item))
          const showTooltip = isHovered

          return (
            <div 
              key={week}
              style={{
                position: "absolute",
                left: `${markerLeftPct}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "24px",
                height: "24px",
                zIndex: showTooltip ? 40 : isHighlighted ? 25 : 3,
                pointerEvents: anyDimmed ? "none" : "auto"
              }}
              onMouseEnter={() => setHoveredWeek(week)}
              onMouseLeave={() => setHoveredWeek(null)}
              onClick={(e) => {
                if (isSelected) {
                  e.stopPropagation()
                }
              }}
            >
              <div
                className="gantt-deadline-marker"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: isHighlighted
                    ? "translate(-50%, -50%) rotate(45deg) scale(1.4)"
                    : isHovered
                      ? "translate(-50%, -50%) rotate(45deg) scale(1.3)"
                      : "translate(-50%, -50%) rotate(45deg)",
                  width: `${markerSize}px`,
                  height: `${markerSize}px`,
                  background: d.color,
                  borderRadius: "1px",
                  border: `${borderSize} dashed #ffffff`.replace("dashed", "solid"),
                  boxShadow: "0 0 5px rgba(0, 0, 0, 0.6)",
                  opacity: anyDimmed ? 0.15 : 1,
                  cursor: "pointer",
                }}
              />
              {showTooltip && (
                <GanttTooltip
                  items={list as GanttTooltipItem[]}
                  leftPct="50"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
