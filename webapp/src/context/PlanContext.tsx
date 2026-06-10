import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react"

import { PlanData, SubjectDetailResponse } from "../types/plan"
import { getMyPlans, getSubjects } from "../api/plans"
import { useAuth } from "./AuthContext"
import { DeadlineResponse } from "../types/deadline"
import { getDeadlines } from "../api/deadlines"

interface PlanContextType {
    plans: PlanData[]
    activePlanId: number | null
    setActivePlanId: (id: number | null) => void
    activePlan: PlanData | undefined
    refreshPlans: () => Promise<void>
    isLoading: boolean
    error: string | null
    subjects: SubjectDetailResponse[]
    deadlines: DeadlineResponse[]
    isLoadingDetails: boolean
    refreshDetails: () => Promise<void>
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export const PlanProvider = ({ children }: { children: ReactNode }) => {
    const { isLogged } = useAuth()

    const [plans, setPlans] = useState<PlanData[]>([])
    const [activePlanId, setActivePlanId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const [subjects, setSubjects] = useState<SubjectDetailResponse[]>([])
    const [deadlines, setDeadlines] = useState<DeadlineResponse[]>([])
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false)

    const activePlan = useMemo(
        () => plans.find(p => p.id === activePlanId),
        [plans, activePlanId]
    )

    const refreshDetails = async () => {
        if (!activePlanId) {
            setSubjects([])
            setDeadlines([])

            return
        }

        setIsLoadingDetails(true)

        try {
            const [subjectsData, deadlinesData] = await Promise.all([
                getSubjects(activePlanId),
                getDeadlines(activePlanId)
            ])
            setSubjects(subjectsData)
            setDeadlines(deadlinesData)
        } catch (error) {
            console.error("Failed to fetch plan details: ", error)
            setSubjects([])
            setDeadlines([])
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const refreshPlans = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await getMyPlans()
            setPlans(data)

            if (data.length > 0) {
                const stillExists = data.some(p => p.id === activePlanId)

                if (!activePlanId || !stillExists) {
                    setActivePlanId(data[0].id)
                }
            } else {
                setActivePlanId(null)
            }

        } catch (error) {
            console.error("Failed to fetch plans: ", error)
            setError("Failed to load your study plans")
            setPlans([])
            setActivePlanId(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isLogged) {
            refreshPlans()
        } else {
            setPlans([])
            setActivePlanId(null)
            setSubjects([])
            setDeadlines([])
            setIsLoading(false)
        }
    }, [isLogged])

    useEffect(() => {
        if (activePlanId) {
            refreshDetails()
        } else {
            setSubjects([])
            setDeadlines([])
        }
    }, [activePlanId])

    return (
        <PlanContext.Provider
            value={{
                plans,
                activePlanId,
                setActivePlanId,
                activePlan,
                refreshPlans,
                isLoading,
                error,
                subjects,
                deadlines,
                isLoadingDetails,
                refreshDetails
            }}
        >
            {children}
        </PlanContext.Provider>
    )
}

export const usePlan = (): PlanContextType => {
    const context = useContext(PlanContext);
    if (context === undefined) {
        throw new Error('usePlan must be used within a PlanProvider');
    }
    return context;
};