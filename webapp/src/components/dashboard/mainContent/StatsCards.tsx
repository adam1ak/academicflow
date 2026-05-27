import StatisticCard from "./StatisticCard";

export function StatsCards() {
  return (
    <section
      aria-label="Dashboard statiscitcs"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
    >
      <StatisticCard
        accentColor="blue"
        title="Active Courses"
        value="5"
        description="2 unlocked · 3 locked"
      />

      <StatisticCard
        accentColor="green"
        title="Completion"
        value="38%"
        description="3 of 9 topics done"
      />

      <StatisticCard
        accentColor="orange"
        title="Credit Load"
        value="17"
        description="Recommended ≤ 18 cr"
      />

      <StatisticCard
        accentColor="purple"
        title="Schedule Health"
        value="82"
        description="Good · 1 conflict"
      />
    </section >
  );
}
