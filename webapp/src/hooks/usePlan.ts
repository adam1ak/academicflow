import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyPlans, generatePlan, deletePlan } from "../api/plans"
import { PlanData, GeneratePlanPayLoad } from "../types/plan";


export const usePlans = () => {
    const queryClient = useQueryClient();

    const {
        data: plans = [],
        isLoading,
        isError
    } = useQuery<PlanData[]>({
        queryKey: ["plans"],
        queryFn: getMyPlans
    })

    const deletePlanMutation = useMutation({
        mutationFn: (planId: number) => deletePlan(planId),
        onMutate: async (deletedPlanId: number) => {
            await queryClient.cancelQueries({ queryKey: ["plans"] });
            const previousPlans = queryClient.getQueryData<PlanData[]>(["plans"]);

            if (previousPlans) {
                queryClient.setQueryData<PlanData[]>(
                    ["plans"],
                    previousPlans.filter(plan => plan.id !== deletedPlanId)
                );
            }

            return { previousPlans };
        },
        onError: (error, deletedPlanId, context) => {
            if (context?.previousPlans) {
                queryClient.setQueryData(["plans"], context.previousPlans);
            }

            console.error("Error while deleting plan (Rollback executed): ", error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] });
            console.log("Plan deletion settled");
        }
    })

    const generatePlanMutation = useMutation({
        mutationFn: (payload: GeneratePlanPayLoad) => generatePlan(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] })
            console.log("Plan generated successfully")
        },
        onError: (error) => {
            console.error("Error while generating plan: ", error)
        }
    })

    const removePlan = async (planId: number) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        deletePlanMutation.mutate(planId);
    }

    const generateTestPlan = async () => {
        const testPayload: GeneratePlanPayLoad = {
            max_concurrent: 2,
            subjects: [
                { name: "Calculus1", field: "Math", duration: 5, dependents: ["Calculus2"] },
                { name: "Calculus2", field: "Math", duration: 2, dependents: [] }
            ]
        };
        generatePlanMutation.mutate(testPayload);
    };

    return {
        plans,
        isLoading,
        isError,
        removePlan,
        generateTestPlan
    }
}