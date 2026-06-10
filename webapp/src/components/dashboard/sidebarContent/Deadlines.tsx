import DeadlineCard from "./DeadlineCard"

function Deadlines() {
  return (
    <section className="bg-surface border border-dim rounded-xl p-3.5">
      <div className="flex justify-between items-center mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-sec">Deadlines</p>

        <button className="flex items-center gap-1.5 border border-accent-amber/45 bg-accent-amber/10 text-accent-amber-light hover:bg-accent-amber/15 font-mono rounded-md px-2.5 py-1 text-[11px] font-medium leading-none">
          <span className="text-sm leading-1">
            +
          </span>
          Add Deadline
        </button>
      </div>

      <div>
        <DeadlineCard
          type="exam"
          title="ML Assign."
          date="Tmr"
          classroom="MATH 102"
          isFirst={true}
        />

        <DeadlineCard
          type="project"
          title="ML Assign."
          date="Tmr"
          classroom="MATH 102"
          isFirst={false}
        />

        <DeadlineCard
          type="task"
          title="ML Assign."
          date="Tmr"
          classroom="MATH 102"
          isFirst={false}
        />

        <DeadlineCard
          type="assignment"
          title="ML Assign."
          date="Tmr"
          classroom="MATH 102"
          isFirst={false}
        />
      </div>
    </section>
  )
}

export default Deadlines