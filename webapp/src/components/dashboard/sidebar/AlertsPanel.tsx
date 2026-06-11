import AlertCard from "./AlertCard"

function AlertsPanel() {
    return (
        <section className="bg-surface border border-dim rounded-xl p-3.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-sec mb-3">Alerts</p>

            <div className="space-y-2.5">
                <AlertCard
                    type="danger"
                    title="Week 5–6 Collision"
                    description="Calc II Exam and ML Assignment land in the same 7-day window. Reorder prep blocks."
                />

                <AlertCard
                    type="warning"
                    title="Heavy Credit Load"
                    description="Current semester load is close to the recommended limit of 18 credits."
                />

                <AlertCard
                    type="success"
                    title="Prerequisites Covered"
                    description="All enrolled courses meet prerequisite requirements for the current term."
                />

                <AlertCard
                    type="info"
                    title="Schedule Update"
                    description="Two new office-hour slots were added for CS 401 this week."
                />
            </div>
        </section>
    )
}

export default AlertsPanel