import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleComplete } from "../../api/plans"
import { SubjectDetailResponse } from "../../types/plan"

export const useToggleCompleteMutation = (planId: number | null) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (subjectId: number) => toggleComplete(planId!, subjectId),
        onMutate: async (subjectId: number) => {
          if (!planId) return  

          await queryClient.cancelQueries({ queryKey: ['subjects', planId] })

          const previousSubjects = queryClient.getQueryData<SubjectDetailResponse[]>(['subjects', planId])

          queryClient.setQueryData<SubjectDetailResponse[]>(['subjects', planId], (old = []) => old.map(subject => (
            subject.id == subjectId
            ? { ...subject, is_completed: !subject.is_completed}
            : subject
          )))

          return { previousSubjects }
        },
        onError: (_err, _subjectId, context) => {
            if (planId && context?.previousSubjects) {
                queryClient.setQueryData(['subjects', planId], context.previousSubjects)
            }
        },
        onSettled: () => {
            if (planId) {
                queryClient.invalidateQueries({ queryKey: ['subjects', planId] })
                queryClient.invalidateQueries({ queryKey: ['plans'] })
            }
        }
    })
}