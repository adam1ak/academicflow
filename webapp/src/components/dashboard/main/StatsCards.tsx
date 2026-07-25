import StatisticCard from "./StatisticCard"
import { usePlanStats } from "../../../hooks/usePlanStats"
import { usePlan } from "../../../context/PlanContext"
import Skeleton from "../../ui/Skeleton"

export function StatsCards() {
  const { isLoadingDetails } = usePlan()
  const { activeCourses, completion, creditLoad, scheduleHealth } = usePlanStats()

  if (isLoadingDetails) {
    return (
      <section
        aria-label="Dashboard statistics loading"
        className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
      >
        {Array.from({ length: 4}).map((_, index) => (
          <Skeleton key={index} className="h-[92px] w-full" />
        ))}
      </section>
    )
  }

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