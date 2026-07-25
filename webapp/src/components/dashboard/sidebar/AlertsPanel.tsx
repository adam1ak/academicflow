import AlertCard from "./AlertCard"
import { useAlerts } from "./useAlerts"
import { usePlan } from "../../../context/PlanContext"
import Skeleton from "../../ui/Skeleton"

function AlertsPanel() {
    const { isLoadingDetails } = usePlan()
    const activeAlerts = useAlerts()

    return (
        <section className="bg-surface border border-dim rounded-xl p-3.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-sec mb-3">Alerts</p>

            {isLoadingDetails ? (
                <div className="space-y-2.5">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-[52px] w-full" />
                    ))}
                </div>
            ) : (
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 pb-0.5">
                    {activeAlerts.map((alert, index) => (
                        <AlertCard
                            key={index}
                            type={alert.type}
                            title={alert.title}
                            description={alert.description}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export default AlertsPanel