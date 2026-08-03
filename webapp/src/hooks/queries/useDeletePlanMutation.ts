import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deletePlan } from "../../api/plans"

export const useDeletePlanMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (planId: number) => deletePlan(planId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] })
        }
    })
}