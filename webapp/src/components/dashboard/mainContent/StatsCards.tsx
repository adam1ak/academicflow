import StatisticCard from "./StatisticCard"

import { usePlan } from "../../../context/PlanContext"
import { usePlanHealth } from "../../../hooks/usePlanHealth"

export function StatsCards() {

  const { activePlan } = usePlan()
  const { score, label, color } = usePlanHealth(activePlan)

  const creditLoad = activePlan ? activePlan.schedule.length * 3 : 0
  const activeCourseCount = activePlan ? activePlan.schedule.length : 0

  return (
    <section
      aria-label="Dashboard statistics"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
    >
      <StatisticCard
        title="Active Courses"
        value={activeCourseCount.toString()}
        description="2 unlocked · 3 locked"
        statBar={color.statBar}
        textColor={color.valueColor}
      />

      <StatisticCard
        title="Completion"
        value="0%"
        description="3 of 9 topics done"
        statBar={color.statBar}
        textColor={color.valueColor}
      />

      <StatisticCard
        title="Credit Load"
        value={`${creditLoad} ECTS`}
        description="Estimated Workload"
        statBar={color.statBar}
        textColor={color.valueColor}
      />

      <StatisticCard
        title="Schedule Health"
        value={score.toString()}
        description={label}
        statBar={color.statBar}
        textColor={color.valueColor}
      />
    </section >
  );
}
