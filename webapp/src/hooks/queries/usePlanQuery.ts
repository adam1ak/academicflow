import { useQuery } from "@tanstack/react-query"
import { PlanData } from "../../types/plan"
import { getMyPlans } from "../../api/plans"

export const usePlansQuery = () => {
    const {
        data: plans = [],
        isLoading,
        isError,
        refetch,
    } = useQuery<PlanData[]>({
        queryKey: ['plans'],
        queryFn: getMyPlans
    })

    return {
        plans,
        isLoading,
        isError,
        refetch
    }
}