import { usePlan } from "../../../context/PlanContext"
import WeekCard from "./WeekCard"

function WeeklyLoad() {

  const { activePlan, subjects } = usePlan()
  const schedule = activePlan?.schedule ?? []
  const load = Array(12).fill(0)

  const subjectStatusMap = new Map(subjects.map(s => [s.name, s.is_completed]))

  schedule.forEach(item => {
    const isCompleted = subjectStatusMap.get(item.name) ?? false
    if (!isCompleted) {
      for (let w = item.start_time; w < item.end_time; w++) {
        if (w >= 0 && w < 12) {
          load[w]++
        }
      }
    }
  })

  const maxConcurrent = activePlan?.max_concurrent ?? 3

  const getLoadType = (val: number): "empty" | "light" | "busy" | "overloaded" => {
    if (val === 0) return "empty"
    if (val <= Math.floor(maxConcurrent / 2)) return "light"
    if (val <= maxConcurrent) return "busy"
    return "overloaded"
  }

  return (
    <section className="md:col-span-3 lg:col-span-1 bg-surface border border-dim rounded-xl p-3.5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-sec mb-3">Weekly load</p>

      <div className="grid grid-cols-6 gap-1">
        {load.map((val, index) => (
          <WeekCard
            key={index}
            week={index + 1}
            load={val}
            type={getLoadType(val)}
          />
        ))}
      </div>

      <div className="flex justify-between mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-xs border border-dim bg-transparent" />
          <span className="font-mono text-[9px] text-mut">Empty</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-xs bg-accent-blue" />
          <span className="font-mono text-[9px] text-mut">Low</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-xs bg-accent-amber" />
          <span className="font-mono text-[9px] text-mut">Med</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-xs bg-accent-red" />
          <span className="font-mono text-[9px] text-mut ">High</span>
        </div>
      </div>

    </section>
  )
}

export default WeeklyLoad