interface GanttTooltipProps {
  label: string
  type: string
  week: number
  color: string
  leftPct: string
}

export default function GanttTooltip({
  label,
  type,
  week,
  color,
  leftPct
}: GanttTooltipProps) {
  return (
    <div
      className="absolute bg-surface/90 border border-dim rounded-lg p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 pointer-events-none min-w-[160px] backdrop-blur-md"
      style={{
        left: `${leftPct}%`,
        top: "50%",
        transform: "translate(-50%, -54px)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-2 h-2 rounded-xs" style={{ background: color }} />
        <span className="font-mono text-[9px] text-sec uppercase tracking-wider font-semibold">
          {type}
        </span>
      </div>
      <div className="font-sans text-[11px] font-semibold text-pri leading-tight">
        {label}
      </div>
      <div className="font-mono text-[9px] text-sec mt-1">
        Week {week}
      </div>
    </div>
  )
}
