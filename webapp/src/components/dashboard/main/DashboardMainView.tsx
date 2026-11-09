import { StatsCards, DAGPanel, GanttPanel } from ".."
import { useAdvisor } from "../../../context/AdvisorContext"

function DashboardMainView() {
    const { isOpen } = useAdvisor()

    return (
        <main className="min-w-0 flex-1 flex flex-col gap-3">
            <StatsCards />
            <div className={`flex flex-col gap-3 scroll-smooth ${
                isOpen
                    ? "2xl:flex-1 2xl:min-h-0 2xl:overflow-y-auto"
                    : "lg:flex-1 lg:min-h-0 lg:overflow-y-auto"
            }`}>
                <DAGPanel />
                <GanttPanel />
            </div>
        </main>
    )
}

export default DashboardMainView
