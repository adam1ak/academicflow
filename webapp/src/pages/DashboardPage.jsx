import GeneratePlanForm from "../components/GeneratePlanForm"

import { getMyPlans, generatePlan, deletePlan } from "../services/plans"
import { logout } from "../services/auth"

import { useState, useEffect } from 'react'
import { useAuth } from "../context/AuthContext"

function DashboardPage() {
    const [myPlans, setMyPlans] = useState([])
    const { setIsLogged } = useAuth()

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

    const handleLogout = () => {
        logout()
        setIsLogged(false)
    }

    const handleGenerateTestPlan = async () => {
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

    const handleDeletePlan = async (planId) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return

        try {
            await deletePlan(planId)
            await fetchPlans()
        } catch (e) {
            console.error("Error while deleting plan: ", e)
        }
    }

    return (
        <div>
            <h1>Login succeed!</h1>
            <button onClick={handleLogout}>Log out</button>

            <h2>Your Study Plans</h2>

            <button onClick={handleGenerateTestPlan}>Generate Test plan</button>

            <GeneratePlanForm onPlanGenerated={fetchPlans} />

            {myPlans.length === 0 ? (
                <p>No plans generated yet.</p>
            ) : (
                myPlans.map((plan) => (
                    <div key={plan.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                        <h3>{plan.name}</h3>
                        <button onClick={() => handleDeletePlan(plan.id)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                            Delete
                        </button>
                        <ul>
                            {plan.schedule.map((subject) => (
                                <li key={subject.name}>
                                    <strong>{subject.name}</strong> (Week: {subject.start_time} - {subject.end_time})
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    )
}

export default DashboardPage
