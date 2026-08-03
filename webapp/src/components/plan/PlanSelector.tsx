import React from "react"
import PlanSelectorItem from "./PlanSelectorItem"
import { usePlan } from "../../context/PlanContext"
import { PlanData } from "../../types/plan"

interface PlanSelectorProps {
    isOpen: boolean
    onClose: () => void
    createPlanModal: () => void
    onEditPlan: (plan: PlanData) => void
    onDeletePlan: (plan: PlanData) => void
    position: { top: number, right: number }
    innerRef: React.RefObject<HTMLDivElement | null>
}

function PlanSelector({ isOpen, onClose, createPlanModal, onEditPlan, onDeletePlan, position, innerRef }: PlanSelectorProps) {

    const { plans, activePlanId, setActivePlanId } = usePlan()

    if (!isOpen) return null;
    return (
        <div
            ref={innerRef}
            style={{ top: position.top, right: position.right }}
            className="fixed z-999 w-[285px] bg-surface-hi border border-hi overflow-hidden rounded-lg shadow-lg">
            {plans.map((plan) => (
                <PlanSelectorItem
                    key={plan.id}
                    plan={plan}
                    isActive={plan.id === activePlanId}
                    onSelect={() => {
                        setActivePlanId(plan.id)
                        onClose()
                    }}
                    onEdit={() => {
                        onEditPlan(plan)
                        onClose()
                    }}
                    onDelete={() => {
                        onDeletePlan(plan)
                        onClose()
                    }}
                />
            ))}

            <button onClick={createPlanModal} className="flex gap-1 items-center justify-center w-full text-[12px] text-sec font-sf font-medium py-2 hover:bg-[rgba(74,126,255,0.07)] hover:text-hint-text">
                <span className="text-xs leading-0">+</span>
                New Schedule
            </button>
        </div>
    )
}

export default PlanSelector