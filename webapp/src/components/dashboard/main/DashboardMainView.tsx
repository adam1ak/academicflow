import { StatsCards, DAGPanel, GanttPanel } from ".."

function DashboardMainView() {
    return (
        <main className="min-w-0 lg:min-h-0 flex-1 flex flex-col gap-3">
            <StatsCards />
            <div className="flex-1 min-h-0 flex flex-col gap-3 lg:overflow-y-auto scroll-smooth">
                <DAGPanel />
                <GanttPanel />
            </div>
        </main>
    )
}

export default DashboardMainView