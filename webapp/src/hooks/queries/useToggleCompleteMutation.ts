import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleComplete } from "../../api/plans"

export const useToggleCompleteMutatuin = (planId: number | null) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (subjectId: number) => toggleComplete(planId!, subjectId),
        onSuccess: () => {
            if (planId) {
                queryClient.invalidateQueries({ queryKey: ['subjects', planId] })
            }
        }
    })
}