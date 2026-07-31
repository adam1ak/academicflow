import { useQuery } from "@tanstack/react-query"
import { DeadlineResponse } from "../../types/deadline"
import { getDeadlines } from "../../api/deadlines"
import { useAuth } from "../../context/AuthContext"

export const useDeadlinesQuery = (planId: number | null) => {
    const { isLogged } = useAuth()
    const {
        data: deadlines = [],
        isLoading,
        isError,
        error,
        refetch
    } = useQuery<DeadlineResponse[]>({
        queryKey: ['deadlines', planId],
        queryFn: () => getDeadlines(planId!),
        enabled: !!planId && isLogged,
        retry: false
    })

    return {
        deadlines,
        isLoading,
        isError,
        error,
        refetch
    }
}