import AppNavbar from "../components/ui/AppNavbar"
import { DashboardShell, Sidebar } from "../components/dashboard"
import DashboardMainView from "../components/dashboard/mainContent/DashboardMainView"
import { usePlans } from "../hooks/usePlan"



function DashboardPage() {
    const { plans, isLoading, isError, removePlan, generateTestPlan } = usePlans()

    if (isLoading) {
        return <div className="h-screen bg-bg flex items-center justify-center font-mono text-3xl text-text-secondary font-extrabold">Lodaing workspace..</div>
    }

    if (isError) {
        console.error("Dashboard Error: Failed to fetch study plans from backend API. Check your database connection.");
        return <div className="h-screen bg-bg flex items-center justify-center font-mono text-3xl text-accent-red font-extrabold">                Failed to load plans. Connection refused.
        </div>
    }

    return (
        <DashboardShell
            navbar={<AppNavbar />}
            mainContent={<DashboardMainView />}
            sidebarContent={<Sidebar />}
        />
    )
}

export default DashboardPage
