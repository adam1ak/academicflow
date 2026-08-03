import { useState } from "react"
import { usePlanHealth } from "../../hooks/usePlanHealth"
import { PlanData } from "../../types/plan"

interface PlanItemInterface {
    isActive?: boolean
    plan: PlanData
    onSelect: () => void
    onEdit: () => void
    onDelete: () => void
}

function PlanSelectorItem({ isActive, plan, onSelect, onEdit, onDelete }: PlanItemInterface) {
    const { score, color } = usePlanHealth(plan)
    const [hovered, setHovered] = useState(false)

    return (
        <div
            onClick={onSelect}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`relative flex items-center gap-3 px-3 py-3.5 cursor-pointer border-b border-hi/30 transition-all duration-150 select-none ${isActive ? "bg-blue-glow/50" : "hover:bg-dim/55"}`}>

            <div
                className="w-2 h-2 rounded-full shrink-0 transition-colors duration-200"
                style={{
                    backgroundColor: plan.accent_color
                        ? `var(--color-accent-${plan.accent_color})`
                        : 'currentColor'
                }}
            />

            <div className="flex-1 min-w-0">
                <p className="font-sf text-sm font-medium overflow-hidden whitespace-nowrap text-ellipsis text-pri leading-snug">
                    {plan.name}
                </p>
                <p className="font-mono text-[11px] text-sec mt-0.5">
                    {plan.schedule.length} subject{plan.schedule.length !== 1 ? "s" : ""} · {plan.semester ?? "—"}
                </p>
            </div>

            <div className="relative flex items-center justify-end gap-1 shrink-0 h-6">
                <p className={`font-mono text-sm font-semibold absolute transition-all duration-150 ${color.valueColor} ${hovered ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}>
                    {score}
                </p>

                <div className={`flex items-center gap-1 transition-all duration-150 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}`}>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete() }}
                        className="flex items-center justify-center w-7 h-7 rounded-md text-sec hover:text-accent-red hover:bg-white/10 transition-colors cursor-pointer"
                        title="Delete plan"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onEdit() }}
                        className="flex items-center justify-center w-7 h-7 rounded-md text-sec hover:text-accent-blue hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit plan"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div
                className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200"
                style={{
                    backgroundColor: isActive && plan.accent_color && !hovered
                        ? `var(--color-accent-${plan.accent_color})`
                        : 'transparent'
                }}
            />
        </div>
    )
}

export default PlanSelectorItem