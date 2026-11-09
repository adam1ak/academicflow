import StatisticCard from "./StatisticCard"
import { usePlanStats } from "../../../hooks/usePlanStats"
import { usePlan } from "../../../context/PlanContext"
import { useAdvisor } from "../../../context/AdvisorContext"
import Skeleton from "../../ui/Skeleton"

export function StatsCards() {
  const { isLoadingDetails } = usePlan()
  const { activeCourses, completion, creditLoad, scheduleHealth } = usePlanStats()
  const { isOpen } = useAdvisor()

  const gridClass = isOpen
    ? "grid grid-cols-2 2xl:grid-cols-4 gap-3.5"
    : "grid grid-cols-2 md:grid-cols-4 gap-3.5"

  if (isLoadingDetails) {
    return (
      <section
        aria-label="Dashboard statistics loading"
        className={gridClass}
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
      className={gridClass}
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
