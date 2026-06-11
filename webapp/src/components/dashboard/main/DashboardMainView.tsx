import { StatsCards, DAGPanel, GanttPanel } from ".."

function DashboardMainView() {
    return (
        <main className="min-w-0 lg:min-h-0 flex-1 flex flex-col gap-3">
            <StatsCards />
            <DAGPanel />
            <GanttPanel />
        </main>
    )
}

export default DashboardMainView