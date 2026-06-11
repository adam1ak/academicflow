import { usePlanStats } from "../../../hooks/usePlanStats"
import HealthRing from "../../ui/HealthRing"

function ScheduleHealth() {
    const { scheduleHealth } = usePlanStats()

    return (
        <section className="lg:order-first bg-surface border border-dim rounded-xl p-3.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-sec mb-3">Schedule health</p>

            <div className="flex items-center gap-3.5 mb-4">
                <HealthRing value={scheduleHealth.score} className={scheduleHealth.textColorClass} />

                <div className="flex flex-col">
                    <span className={`font-bold ${scheduleHealth.textColorClass} tracking-tight`}>{scheduleHealth.label}</span>
                    <span className="text-xs text-sec mt-0.5">{scheduleHealth.description}</span>
                </div>
            </div>

            <div className="space-y-2.5">
                <div>
                    <div className="flex justify-between mb-1 font-mono">
                        <span className="text-[10px] text-slate-400 uppercase">Load Balance</span>
                        <span className={`text-[10px] font-medium ${scheduleHealth.loadColor.text}`}>{scheduleHealth.loadBalance}%</span>
                    </div>
                    <div className="h-0.5 bg-surface-progress rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${scheduleHealth.loadColor.bg}`}
                            style={{ width: `${scheduleHealth.loadBalance}%` }}
                        ></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1 font-mono">
                        <span className="text-[10px] text-slate-400 uppercase">Deadline Spacing</span>
                        <span className={`text-[10px] font-medium ${scheduleHealth.spacingColor.text}`}>{scheduleHealth.deadlineSpacing}%</span>
                    </div>
                    <div className="h-0.5 bg-surface-progress rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${scheduleHealth.spacingColor.bg}`}
                            style={{ width: `${scheduleHealth.deadlineSpacing}%` }}
                        ></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1 font-mono">
                        <span className="text-[10px] text-slate-400 uppercase">Prereq Coverage</span>
                        <span className={`text-[10px] font-medium ${scheduleHealth.prereqColor.text}`}>{scheduleHealth.prereqCoverage}%</span>  
                    </div>
                    <div className="h-0.5 bg-surface-progress rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${scheduleHealth.prereqColor.bg}`}
                            style={{ width: `${scheduleHealth.prereqCoverage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default ScheduleHealth