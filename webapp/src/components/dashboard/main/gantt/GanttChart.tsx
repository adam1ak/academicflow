import { useEffect, useMemo, useRef, useState } from "react"
import { usePlan } from "../../../../context/PlanContext"
import { LegendStatus } from "../GanttPanel"
import GanttRow from "./GanttRow"
import GanttDetailsCard from "./GanttDetailsCard"
import { 
  TOTAL_WEEKS, 
  LABEL_WIDTH, 
  GanttRowData, 
  GanttDeadlineMark, 
  buildRows, 
  mapDeadlines, 
  hashCode 
} from "./ganttUtils"

interface GanttChartProps {
  hoveredLegendStatus: LegendStatus
  isFullscreen: boolean
}

export default function GanttChart({ hoveredLegendStatus, isFullscreen }: GanttChartProps) {
  const { activePlan, subjects, deadlines } = usePlan()
  const schedule = activePlan?.schedule ?? []
  const [selectedRowName, setSelectedRowName] = useState<string | null>(null)
  const [hoveredCardDeadlineId, setHoveredCardDeadlineId] = useState<number | null>(null)

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
    if (selectedRowName !== null) return selectedRowName !== row.name
    if (!hoveredLegendStatus) return false
    if (hoveredLegendStatus === "active") return row.status !== "ready"
    if (hoveredLegendStatus === "upcoming") return row.status !== "blocked"
    
    const rowDeadlines = deadlineMarks.filter(d => assignedDeadlinesMap.get(d.id) === row.name)
    return !rowDeadlines.some(d => d.type.toLowerCase() === hoveredLegendStatus)
  }

  const isMarkerDimmed = (d: GanttDeadlineMark) => {
    if (hoveredCardDeadlineId !== null) return d.id !== hoveredCardDeadlineId
    if (!hoveredLegendStatus) return false
    if (["active", "upcoming"].includes(hoveredLegendStatus)) return false
    return d.type !== hoveredLegendStatus
  }

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [displayedRow, setDisplayedRow] = useState<GanttRowData | null>(null)

  useEffect(() => {
    let startedInside = false
    const handleMouseDown = (e: MouseEvent) => {
      startedInside = containerRef.current?.contains(e.target as Node) || false
    }
    const handleMouseUp = (e: MouseEvent) => {
      const endedInside = containerRef.current?.contains(e.target as Node) || false
      if (!startedInside && !endedInside) {
        setSelectedRowName(null)
      }
    }
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  const selectedRow = useMemo(() => {
    return rows.find(r => r.name === selectedRowName) || null
  }, [selectedRowName, rows])

  useEffect(() => {
    if (selectedRow) {
      setDisplayedRow(selectedRow)
    }
  }, [selectedRow])

  useEffect(() => {
    if (selectedRowName && cardRef.current) {
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [selectedRowName])

  const getBarLabel = (status: string): string => {
    switch (status) {
      case "completed":
        return "✓ Completed"
      case "blocked":
        return "✕ Blocked"
      case "ready":
        return "▶ Active"
      default:
        return ""
    }
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center text-sec font-mono text-xs min-h-[120px]">
        No schedule data available. Add subjects to build the timeline.
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      style={{ minWidth: "1050px" }} 
      className={`gantt-container min-w-[850px] md:min-w-[1050px] lg:min-w-[1200px] xl:min-w-[1350px] ${selectedRowName !== null ? "gantt-has-selection" : ""}`}
    >
      <div className="flex mb-3" style={{ marginLeft: `${LABEL_WIDTH + 8}px`, marginRight: "40px" }}>
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
          const weekNum = i + 1
          return (
            <div
              key={i}
              className="flex-1 text-center font-mono font-bold"
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
            isSelected={selectedRowName === row.name}
            onRowClick={() => {
              setSelectedRowName(selectedRowName === row.name ? null : row.name)
            }}
            isMarkerDimmed={isMarkerDimmed}
            getBarLabel={getBarLabel}
            currentWeek={currentWeek}
            rowIdx={idx}
            hoveredLegendStatus={hoveredLegendStatus}
            hoveredCardDeadlineId={hoveredCardDeadlineId}
            isFullscreen={isFullscreen}
          />
        ))}
      </div>

      <GanttDetailsCard
        cardRef={cardRef}
        selectedRowName={selectedRowName}
        displayedRow={displayedRow}
        getBarLabel={getBarLabel}
        deadlineMarks={deadlineMarks}
        assignedDeadlinesMap={assignedDeadlinesMap}
        setHoveredCardDeadlineId={setHoveredCardDeadlineId}
        isFullscreen={isFullscreen}
      />
    </div>
  )
}
