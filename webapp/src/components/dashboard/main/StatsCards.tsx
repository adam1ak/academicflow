import StatisticCard from "./StatisticCard"
import { usePlanStats } from "../../../hooks/usePlanStats"

export function StatsCards() {
  const { activeCourses, completion, creditLoad, scheduleHealth } = usePlanStats()

  return (
    <section
      aria-label="Dashboard statistics"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
    >
      <StatisticCard
        title="Active Courses"
        value={activeCourses.value.toString()}
        description={activeCourses.description}
        statBar={activeCourses.theme.statBar}
        textColor={activeCourses.theme.valueColor}
      />

      <StatisticCard
        title="Completion"
        value={completion.value}
        description={completion.description}
        statBar={completion.theme.statBar}
        textColor={completion.theme.valueColor}
      />

      <StatisticCard
        title="Credit Load"
        value={creditLoad.value}
        description={creditLoad.description}
        statBar={creditLoad.theme.statBar}
        textColor={creditLoad.theme.valueColor}
      />

      <StatisticCard
        title="Schedule Health"
        value={scheduleHealth.score.toString()}
        description={scheduleHealth.label}
        statBar={scheduleHealth.theme.statBar}
        textColor={scheduleHealth.theme.valueColor}
      />
    </section>
  )
}