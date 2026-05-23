import GeneratePlanForm from "../components/GeneratePlanForm"
import { logout } from "../api/auth"
import { useAuth } from "../context/AuthContext"
import { usePlans } from "../hooks/usePlan"

function DashboardPage() {
    const { setIsLogged } = useAuth()

    const { plans, isLoading, isError, removePlan, generateTestPlan } = usePlans()

    const handleLogout = () => {
        logout()
        setIsLogged(false)
    }

    if (isLoading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading study plans...</div>
    }

    if (isError) {
        console.error("Dashboard Error: Failed to fetch study plans from backend API. Check your database connection.");
        return <div style={{ color: "red", padding: "20px" }}>Failed to load plans. Connection refused.</div>
    }

    return (
        <div>
            <h1>Login succeed!</h1>
            <button onClick={handleLogout}>Log out</button>

            <h2>Your Study Plans</h2>

            <button onClick={generateTestPlan}>Generate Test plan</button>

            <GeneratePlanForm />

            {plans.length === 0 ? (
                <p>No plans generated yet.</p>
            ) : (
                plans.map((plan) => (
                    <div key={plan.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                        <h3>{plan.name}</h3>
                        <button onClick={() => removePlan(plan.id)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
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
