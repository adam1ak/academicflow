import { useEffect, useState } from "react"
import { usePlan } from "../../../context/PlanContext"
import DeadlineCard from "./DeadlineCard"
import { DeadlineResponse } from "../../../types/deadline"
import { getDeadlines } from "../../../api/deadlines"
import AddDeadlineModal from "../../ui/AddDeadlineModal"


function Deadlines() {
  const { activePlanId } = usePlan()
  const [deadlines, setDeadlines] = useState<DeadlineResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const fetchDeadlinesData = async () => {
    if (!activePlanId) return
    setIsLoading(true)

    try {
      const data = await getDeadlines(activePlanId)
      setDeadlines(data)
    } catch (error) {
      console.error("Failed to fetch deadlines for plan: ", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!activePlanId) {
      setDeadlines([])
      return
    }

    fetchDeadlinesData()
  }, [activePlanId])

  return (
    <section className="bg-surface border border-dim rounded-xl p-3.5">
      <div className="flex justify-between items-center mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-sec">Deadlines</p>

        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 border border-accent-amber/45 bg-accent-amber/10 text-accent-amber-light hover:bg-accent-amber/15 font-mono rounded-md px-2.5 py-1 text-[11px] font-medium leading-none">
          <span className="text-sm leading-1">
            +
          </span>
          Add Deadline
        </button>
      </div>

      {isLoading ? (
        <div className="py-6 text-center">
          <p className="font-mono text-[10px] text-mut animate-pulse">Loading operational metrics...</p>
        </div>
      ) : deadlines.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-dim/60 rounded-xl bg-dim/5">
          <p className="font-mono text-[10px] text-mut">No deadlines yet</p>
        </div>
      ) : (
        <div className="space-y-0">
          {deadlines.map((deadline, index) => (
            <DeadlineCard
              key={deadline.id}
              type={deadline.type}
              title={deadline.title}
              due_date={deadline.due_date}
              classroom={deadline.classroom}
              isFirst={index === 0}
            />
          ))}
        </div>
      )}

{isModalOpen && (
        <AddDeadlineModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchDeadlinesData} 
        />
      )}
    </section>
  )
}

export default Deadlines