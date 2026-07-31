import { useQuery } from "@tanstack/react-query"
import { PlanData } from "../../types/plan"
import { getMyPlans } from "../../api/plans"
import { useAuth } from "../../context/AuthContext"

export const usePlansQuery = () => {
    const { isLogged } = useAuth()

    const {
        data: plans = [],
        isLoading,
        isError,
        refetch,
    } = useQuery<PlanData[]>({
        queryKey: ['plans'],
        queryFn: getMyPlans,
        enabled: isLogged,
        retry: false
    })

    return {
        plans,
        isLoading,
        isError,
        refetch
    }
}