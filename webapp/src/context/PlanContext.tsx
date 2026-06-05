import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react"

import { PlanData } from "../types/plan"
import { getMyPlans } from "../api/plans"
import { useAuth } from "./AuthContext"

interface PlanContextType {
    plans: PlanData[]
    activePlanId: number | null
    setActivePlanId: (id: number | null) => void
    activePlan: PlanData | undefined
    refreshPlans: () => Promise<void>
    isLoading: boolean
    error: string | null
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export const PlanProvider = ({ children }: { children: ReactNode }) => {
    const { isLogged } = useAuth()

    const [plans, setPlans] = useState<PlanData[]>([])
    const [activePlanId, setActivePlanId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const activePlan = useMemo(
        () => plans.find(p => p.id === activePlanId),
        [plans, activePlanId]
    )

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
            setIsLoading(false)
        }
    }, [isLogged])

    return (
        <PlanContext.Provider
            value={{
                plans,
                activePlanId,
                setActivePlanId,
                activePlan,
                refreshPlans,
                isLoading,
                error
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