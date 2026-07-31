import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SubjectUpdatePayload } from "../../types/plan"
import { updateSubject } from "../../api/plans"

export const useUpdateSubjectMutation = (planId: number | null, subjectId: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: SubjectUpdatePayload) => updateSubject(planId!, subjectId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subject', planId] })
        }
    })
}