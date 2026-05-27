import { StatsCards, DAGPanel, GanttPanel } from ".."

function DashboardMainView() {
    return (
        <main className="min-w-0 lg:min-h-0 flex-1 flex flex-col">
            {/* <button onClick={generateTestPlan} className="hidden">
            generate test plan 
        </button> */}
            <StatsCards />
            <DAGPanel />
            <GanttPanel />

            {/* <section className="hidden">
            <h2>Plan Generation</h2>
            <GeneratePlanForm />
        </section>

        <section>
            <h2>Stored Schedules ({plans.length})</h2>
            {plans.length === 0 ? (
                <p>No plans found in database.</p>
            ) : (
                <ul>
                    {plans.map((plan) => (
                        <li key={plan.id}>
                            <span>{plan.name}</span>
                            <button onClick={() => removePlan(plan.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </section> */}
        </main>
    )
}

export default DashboardMainView