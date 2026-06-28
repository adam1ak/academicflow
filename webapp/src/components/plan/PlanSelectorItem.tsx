import { usePlanHealth } from "../../hooks/usePlanHealth"
import { PlanData } from "../../types/plan"

interface PlanItemInterface {
    isActive?: boolean
    plan: PlanData
    onSelect: () => void
}

function PlanSelectorItem({ isActive, plan, onSelect }: PlanItemInterface) {

    const { score, color } = usePlanHealth(plan)

    return (
        <div
            onClick={onSelect}
            className={`flex items-center gap-3 px-2 py-3 cursor-pointer border-b border-hi/30 transition-colors ${isActive ? "bg-blue-glow/50" : "hover:bg-dim/55"}`}>
            <div
                className="w-2 h-2 rounded-full transition-colors duration-200"
                style={{
                    backgroundColor: plan.accent_color
                        ? `var(--color-accent-${plan.accent_color})`
                        : 'currentColor'
                }}
            />

            <div className="flex-1 min-w-0">
                <p className="font-sf text-sm font-medium overflow-hidden whitespace-nowrap text-ellipsis text-pri">{plan.name}</p>
                <p className="font-mono text-[12px] text-sec">Subjects: {plan.schedule.length}</p>
            </div>

            <p className={`font-mono text-sm font-semibold shrink-0 ${color.valueColor}`}>{score}</p>
            <div
                className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200"
                style={{
                    backgroundColor: isActive && plan.accent_color
                        ? `var(--color-accent-${plan.accent_color})`
                        : 'transparent'
                }}
            />
        </div>
    )
}

export default PlanSelectorItem