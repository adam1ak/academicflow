import { useState, useEffect } from "react";
import { getMyPlans, generatePlan, deletePlan } from "../services/plans"


export const usePlans = () => {
    const [myPlans, setMyPlans] = useState([])

    const fetchPlans = async () => {
        try {
            const plans = await getMyPlans()
            console.log(plans)

            if (Array.isArray(plans)) {
                setMyPlans(plans)
            }
        } catch (e) {
            console.log("Error while fetching plans: ", e);
        }
    }

    useEffect(() => {
        fetchPlans()
    }, [])

    const removePlan = async (planId) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return

        try {
            await deletePlan(planId)
            await fetchPlans()
        } catch (e) {
            console.error("Error while deleting plan: ", e)
        }
    }

    const generateTestPlan = async () => {
        const testPayload = {
            max_concurrent: 2,
            subjects: [
                {
                    name: "Calculus1",
                    field: "Math",
                    duration: 5,
                    dependents: ["Calculus2"]
                },
                {
                    name: "Calculus2",
                    field: "Math",
                    duration: 2,
                    dependents: []
                }
            ]
        }

        try {
            await generatePlan(testPayload)
            await fetchPlans()

            console.log("Plan generated successfully")
        } catch (e) {
            console.log("Error while generating plan: ", e)
        }
    }

    return {
        plans: myPlans,
        fetchPlans,
        removePlan,
        generateTestPlan
    }
}