import DeadlineCard from "./DeadlineCard"

function Deadlines() {
  return (
    <section className="bg-surface border border-border-dim rounded-xl p-3.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-text-sec mb-3">Deadlines</span>

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