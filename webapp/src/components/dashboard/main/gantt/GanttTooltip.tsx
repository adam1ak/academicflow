import { useState } from "react"

export interface GanttTooltipItem {
  id: number
  week: number
  label: string
  type: string
  color: string
}

interface GanttTooltipProps {
  items: GanttTooltipItem[]
  leftPct: string
}

export default function GanttTooltip({
  items,
  leftPct
}: GanttTooltipProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (items.length === 0) return null
  const d = items[activeIndex]

  return (
    <div
      className="absolute bg-surface/95 border border-dim rounded-lg p-2.5 shadow-md z-50 min-w-[170px] backdrop-blur-md"
      style={{
        left: `${leftPct}%`,
        top: "50%",
        transform: "translate(-50%, -76px)",
        pointerEvents: items.length > 1 ? "auto" : "none"
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-2 h-2 rounded-xs" style={{ background: d.color }} />
        <span className="font-mono text-[9px] text-sec uppercase tracking-wider font-semibold">
          {d.type}
        </span>
      </div>
      <div className="font-sans text-[11px] font-semibold text-pri leading-tight">
        {d.label}
      </div>
      <div className="font-mono text-[9px] text-sec mt-1">
        Week {d.week}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-between border-t border-dim mt-2 pt-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex(prev => (prev - 1 + items.length) % items.length)
            }}
            className="text-sec hover:text-pri px-1.5 py-0.5 rounded hover:bg-white/5 font-mono text-[9px] font-bold transition-colors"
          >
            ◀
          </button>
          <span className="font-mono text-[9px] text-sec">
            {activeIndex + 1} / {items.length}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex(prev => (prev + 1) % items.length)
            }}
            className="text-sec hover:text-pri px-1.5 py-0.5 rounded hover:bg-white/5 font-mono text-[9px] font-bold transition-colors"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  )
}
