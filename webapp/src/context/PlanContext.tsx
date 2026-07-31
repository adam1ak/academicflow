import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react"

import { PlanData, SubjectDetailResponse } from "../types/plan"
import { DeadlineResponse } from "../types/deadline"
import { usePlansQuery } from "../hooks/queries/usePlanQuery"
import { useSubjectQuery } from "../hooks/queries/useSubjectQuery"
import { useDeadlinesQuery } from "../hooks/queries/useDeadlinesQuery"

interface PlanContextType {
    plans: PlanData[]
    activePlanId: number | null
    setActivePlanId: (id: number | null) => void
    activePlan: PlanData | undefined
    refreshPlans: () => Promise<void>
    isLoading: boolean
    subjects: SubjectDetailResponse[]
    deadlines: DeadlineResponse[]
    isLoadingDetails: boolean
    refreshDetails: () => Promise<void>
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export const PlanProvider = ({ children }: { children: ReactNode }) => {
    const [activePlanId, setActivePlanId] = useState<number | null>(null)

    const { plans, isLoading, refetch: refetchPlans } = usePlansQuery()
    const { subjects, isLoading: isLoadingSubjects, refetch: refetchSubjects } = useSubjectQuery(activePlanId)
    const { deadlines, refetch: refetchDeadlines } = useDeadlinesQuery(activePlanId)

    useEffect(() => {
        if (plans.length > 0) {
            setActivePlanId(prev => {
                const stillExists = plans.some(p => p.id === prev)
                return (prev && stillExists) ? prev : plans[0].id
            })
        } else {
            setActivePlanId(null)
        }
    }, [plans])

    const activePlan = useMemo(() => plans.find(p => p.id === activePlanId), [plans, activePlanId])

    const refreshPlans = async () => {
        await refetchPlans()
    }

    const refreshDetails = async () => {
        await refetchSubjects()
        await refetchDeadlines()
    }

    return (
        <PlanContext.Provider
            value={{
                plans,
                activePlanId,
                setActivePlanId,
                activePlan,
                refreshPlans,
                isLoading,
                subjects,
                deadlines,
                isLoadingDetails: isLoadingSubjects,
                refreshDetails
            }}
        >
            {children}
        </PlanContext.Provider>
    )
}

export const usePlan = (): PlanContextType => {
    const context = useContext(PlanContext)
    if (context === undefined) {
        throw new Error('usePlan must be used within a PlanProvider')
    }
    return context
}