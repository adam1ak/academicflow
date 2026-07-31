import { useQuery } from "@tanstack/react-query"
import { SubjectDetailResponse } from "../../types/plan"
import { getSubjects } from "../../api/plans"
import { useAuth } from "../../context/AuthContext"

export const useSubjectQuery = (planId: number | null) => {
    const { isLogged } = useAuth()

    const {
        data: subjects = [],
        isLoading,
        isError,
        error,
        refetch
    } = useQuery<SubjectDetailResponse[]>({
        queryKey: ['subjects', planId],
        queryFn: () => getSubjects(planId!),
        enabled: !!planId && isLogged,
        retry: false
    })

    return {
        subjects,
        isLoading,
        isError,
        error,
        refetch
    }
}