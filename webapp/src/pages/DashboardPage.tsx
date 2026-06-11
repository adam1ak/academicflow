import AppNavbar from "../components/layout/AppNavbar"
import { DashboardShell, Sidebar } from "../components/dashboard"
import DashboardMainView from "../components/dashboard/main/DashboardMainView"

function DashboardPage() {

    return (
        <DashboardShell
            navbar={<AppNavbar />}
            mainContent={<DashboardMainView />}
            sidebarContent={<Sidebar />}
        />
    )
}

export default DashboardPage
