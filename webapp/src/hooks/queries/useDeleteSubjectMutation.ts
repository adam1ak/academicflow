import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteSubject } from "../../api/plans"

export const useDeleteSubjectMutation = (planId: number | null) => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (subjectId: number) => deleteSubject(planId!, subjectId),
        onSuccess: () => {
            if (planId) {
                queryClient.invalidateQueries({ queryKey: ['subjects', planId] })
                queryClient.invalidateQueries({ queryKey: ['plans'] })
            }
        }
    })
}