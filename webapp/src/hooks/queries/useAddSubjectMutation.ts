import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SubjectCreatePayload } from "../../types/plan"
import { addSubject } from "../../api/plans"

export const useAddSubjectMutation = (planId: number | null) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: SubjectCreatePayload) => addSubject(planId!, payload),
        onSuccess: () => {
            if (planId) {
                queryClient.invalidateQueries({ queryKey: ['subjects', planId] })
                queryClient.invalidateQueries({ queryKey: ['plans'] })
            }
        }
    })
}