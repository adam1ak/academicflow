import HealthRing from "../../ui/HealthRing"

function ScheduleHealth() {
    return (
        <section className="lg:order-first bg-surface border border-dim rounded-xl p-3.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-sec mb-3">Schedule health</p>

            <div className="flex items-center gap-3.5 mb-4">
                <HealthRing value={82}/>

                <div className="flex flex-col">
                    <span className="font-bold text-[#d8b4fe] tracking-tight">Good Standing</span>
                    <span className="text-xs text-sec mt-0.5">1 conflict detected</span>
                </div>
            </div>

            <div className="space-y-2.5">
                <div>
                    <div className="flex justify-between mb-1 font-mono">
                        <span className="text-[10px] text-slate-400 uppercase">Load Balance</span>
                        <span className="text-[10px] font-medium text-accent-green">90</span>
                    </div>
                    <div className="h-0.5 bg-surface-progress rounded-full overflow-hidden">
                        <div className="h-full rounded-full w-[90%] bg-accent-green"></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1 font-mono">
                        <span className="text-[10px] text-slate-400 uppercase">Deadline Spacing</span>
                        <span className="text-[10px] font-medium text-accent-amber">74</span>
                    </div>
                    <div className="h-0.5 bg-surface-progress rounded-full overflow-hidden">
                        <div className="h-full rounded-full w-[90%] bg-accent-amber"></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1 font-mono">
                        <span className="text-[10px] text-slate-400 uppercase">Prereq Coverage</span>
                        <span className="text-[10px] font-medium text-accent-purple">82</span>
                    </div>
                    <div className="h-0.5 bg-surface-progress rounded-full overflow-hidden">
                        <div className="h-full rounded-full w-[90%] bg-accent-purple"></div>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default ScheduleHealth