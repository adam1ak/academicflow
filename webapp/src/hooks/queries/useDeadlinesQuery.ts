import { useQuery } from "@tanstack/react-query"
import { DeadlineResponse } from "../../types/deadline"
import { getDeadlines } from "../../api/deadlines"

export const useDeadlinesQuery = (planId: number | null) => {
    const {
        data: deadlines = [],
        isLoading,
        isError,
        error,
        refetch
    } = useQuery<DeadlineResponse[]>({
        queryKey: ['deadlines', planId],
        queryFn: () => getDeadlines(planId!),
        enabled: !!planId
    })

    return {
        deadlines,
        isLoading,
        isError,
        error,
        refetch
    }
}