import { useQuery } from "@tanstack/react-query"
import { SubjectDetailResponse } from "../../types/plan"
import { getSubjects } from "../../api/plans"

export const useSubjectQuery = (planId: number | null) => {
    const {
        data: subjects = [],
        isLoading,
        isError,
        error,
        refetch
    } = useQuery<SubjectDetailResponse[]>({
        queryKey: ['subjects', planId],
        queryFn: () => getSubjects(planId!),
        enabled: !!planId
    })

    return {
        subjects,
        isLoading,
        isError,
        error,
        refetch
    }
}