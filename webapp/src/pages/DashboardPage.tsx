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
        return <div className="h-screen bg-bg flex items-center justify-center font-mono text-3xl text-text-secondary font-extrabold">Lodaing workspace..</div>
    }

    if (isError) {
        console.error("Dashboard Error: Failed to fetch study plans from backend API. Check your database connection.");
        return <div className="h-screen bg-bg flex items-center justify-center font-mono text-3xl text-accent-red font-extrabold">                Failed to load plans. Connection refused.
        </div>
    }

    return (
        <div className="h-screen w-full flex flex-col bg-bg text-text-primary antialiased font-sans overflow-hidden">
            <div className="h-14 bg-card-bg/95 border-b border-card-bg flex items-center justify-between px-4 shirnk-0 backdropblur-xl">
                <button onClick={handleLogout}>
                    Temp navbar click to logout
                </button>
            </div>

            <main className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-3">
                <button
                    onClick={generateTestPlan}
                    className="w-full py-2.5 bg-surface-hi border border-card-border rounded-xl font-mono text-xs text-link transition-colors cursor-pointer">
                    generate test plan
                </button>

                <section className="p-4 bg-card-bg border border-card-border rounded-xl font-mono text-xs text-text-muted text-center">
                    statistics
                </section>

                <section className="h-72 min-h-72 bg-bg border border-card-border rounded-xl flex items-center justify-center font-mono text-xs text-text-muted">
                    topic dependency graph
                </section>

                <section className="font-mono text-xs text-text-muted text-center py-4 border border-dashed border-card-border rounded-lg">
                    semestr timeline
                </section>

                <section className="p-4 bg-card-bg border border-card-border rounded-xl font-mono text-xs text-text-muted text-center">
                    schedule health
                </section>

                <section className="p-4 bg-card-bg border border-card-border rounded-xl font-mono text-xs text-text-muted text-center">
                    alerts
                </section>

                <section className="p-4 bg-card-bg border border-card-border rounded-xl font-mono text-xs text-text-muted text-center">
                    schedule chart
                </section>

                <section className="p-4 bg-card-bg border border-card-border rounded-xl font-mono text-xs text-text-muted text-center">
                    deadline
                </section>

                <section>
                    <GeneratePlanForm />
                </section>

                <section className="bg-card-bg border border-card-border rounded-xl p-3">
                    <h3 className="font-mono text-xs text-text-secondary uppercase tracking-wider mb-2">Stored Schedules ({plans.length})</h3>
                    {plans.length === 0 ? (
                        <p className="font-mono text-xs text-text-muted">No plans found in database.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {plans.map((plan) => (
                                <div key={plan.id} className="border border-card-border p-2.5 rounded-lg bg-bg/40 flex items-center justify-between text-xs">
                                    <span className="font-sans font-medium truncate max-w-50">{plan.name}</span>
                                    <button
                                        onClick={() => removePlan(plan.id)}
                                        className="text-accent-red hover:bg-accent-red/10 px-2.5 py-1 rounded transition-colors cursor-pointer text-xs font-semibold"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    )
}

export default DashboardPage
