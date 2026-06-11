import React from "react"
import PlanSelectorItem from "./PlanSelectorItem"
import { usePlan } from "../../context/PlanContext"

interface PlanSelectorProps {
    isOpen: boolean
    onClose: () => void
    position: { top: number, right: number }
    innerRef: React.RefObject<HTMLDivElement | null>
}

function PlanSelector({ isOpen, onClose, position, innerRef }: PlanSelectorProps) {

    const { plans, activePlanId, setActivePlanId } = usePlan()

    if (!isOpen) return null;
    return (
        <div 
            ref={innerRef}
            style={{ top: position.top, right: position.right }}
            className="fixed z-999 w-[275px] bg-surface-hi border border-hi overflow-hidden rounded-lg">
            {plans.map((plan) => (
                <PlanSelectorItem
                    key={plan.id}
                    plan={plan}
                    isActive={plan.id === activePlanId}
                    onSelect={() => {
                        setActivePlanId(plan.id)
                        onClose()
                    }}
                />
            ))}

            <button className="flex gap-1 items-center justify-center w-full text-[12px] text-sec font-sf font-medium py-2 hover:bg-[rgba(74,126,255,0.07)] hover:text-hint-text">
                <span className="text-xs leading-0">+</span>
                New Schedule
            </button>
        </div>
    )
}

export default PlanSelector