import WeekCard from "./WeekCard"

function WeeklyLoad() {
  return (
    <section className="md:col-span-3 lg:col-span-1 bg-surface border border-dim rounded-xl p-3.5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-sec mb-3">Weekly load</p>

      <div className="grid grid-cols-6 gap-1">
        {[
          3, 5, 8, 6, 10, 7,
          4, 9, 5, 11, 6, 8
        ].map((load, index) => (
          <WeekCard
            key={index}
            week={index + 1}
            load={load}
            type={load % 2 == 0 ? "light" : "busy"}
          />
        ))}
      </div>

      <div className="flex justify-between mt-2">
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