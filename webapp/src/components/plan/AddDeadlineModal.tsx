import { useEffect, useMemo, useState } from "react"
import { usePlan } from "../../context/PlanContext"
import { PillVariant } from "../../hooks/useStatusStyles"
import PillTab from "../ui/PillTab"
import InputField from "../ui/InputField"
import DeadlineCard from "../dashboard/sidebar/DeadlineCard"
import { createDeadline } from "../../api/deadlines"

interface AddDeadlineModalProps {
    onClose: () => void
    onSuccess: () => void
}

const ENGLISH_MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

function AddDeadlineModal({ onClose, onSuccess }: AddDeadlineModalProps) {
    const { activePlanId } = usePlan()

    const [title, setTitle] = useState<string>("")
    const [classroom, setClassroom] = useState<string>("")
    const [type, setType] = useState<string>("assignment")

    const currentMonthIndex = new Date().getMonth()
    const [monthIndex, setMonthIndex] = useState<number>(currentMonthIndex)
    const [day, setDay] = useState<number>(new Date().getDate())

    const [apiError, setApiError] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [showErrors, setShowErrors] = useState<boolean>(false)

    const maxDaysInMonth = useMemo(() => {
        const currentYear = new Date().getFullYear()
        return new Date(currentYear, monthIndex + 1, 0).getDate()
    }, [monthIndex])

    useEffect(() => {
        setTitle("")
        setClassroom("")
        setType("assignment")
        setMonthIndex(new Date().getMonth())
        setDay(new Date().getDate())
        setApiError("")
        setShowErrors(false)
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose])

    const assembledIsoDate = useMemo(() => {
        const today = new Date()
        const currentYear = today.getFullYear()

        let targetDate = new Date(currentYear, monthIndex, day)

        if (targetDate < today && targetDate.toDateString() !== today.toDateString()) {
            targetDate = new Date(currentYear + 1, monthIndex, day)
        }

        const year = targetDate.getFullYear()
        const monthStr = String(targetDate.getMonth() + 1).padStart(2, "0")
        const dayStr = String(targetDate.getDate()).padStart(2, "0")

        return `${year}-${monthStr}-${dayStr}`
    }, [monthIndex, day])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setApiError("")

        if (!title.trim() || day < 1 || day > maxDaysInMonth || !activePlanId) {
            setShowErrors(true)
            return
        }

        setIsSubmitting(true)

        try {
            await createDeadline({
                title: title.trim(),
                type: type,
                due_date: assembledIsoDate,
                classroom: classroom.trim() || null,
                plan_id: activePlanId ? activePlanId : null
            })

            await onSuccess()
            onClose()
        } catch (error: any) {
            const backendError = error.response?.data?.detail
            setApiError(backendError || "Api error")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            onClick={onClose}
            className="modal-overlay">
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="modal-container">
                <div className="flex items-start justify-between border-b border-dim shrink-0 px-6 p-4">
                    <div>
                        <p className="text-sm tracking-tight text-slate-100 font-semibold">Add Deadline</p>
                        <p className="font-mono text-[10px] text-sec">New event · semester timeline
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-7 h-7 flex items-center justify-center text-sec hover:text-pri leading-none transition-colors cursor-pointer"
                    >✕</button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                    <div className="flex gap-3 w-full">
                        <div className="flex-1">
                            <InputField
                                id="deadline-title"
                                label="event title"
                                placeholder="e.g. ML Assignment"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                hasError={showErrors && !title.trim()}
                            />
                        </div>

                        <div className="flex-1">
                            <InputField
                                id="classroom"
                                label="classroom"
                                placeholder="e.g. Room 452"
                                value={classroom}
                                onChange={(e) => setClassroom(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="af-label">Event type</label>
                        <div className="flex gap-3">
                            {["assignment", "exam", "project", "task"].map((item) => (
                                <PillTab
                                    key={item}
                                    label={item}
                                    variant={item as PillVariant}
                                    isActive={type === item}
                                    onClick={() => setType(item)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex flex-col flex-[1.5]">
                            <label htmlFor="month-select" className="af-label">month</label>
                            <select
                                id="month-select"
                                className="input-af capitalize cursor-pointer"
                                value={monthIndex}
                                onChange={(e) => setMonthIndex(Number(e.target.value))}
                            >
                                {ENGLISH_MONTHS.map((m, idx) => (
                                    <option key={m} value={idx} className="bg-surface-hi text-pri">
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <InputField
                                id="deadline-day"
                                label="day"
                                type="number"
                                placeholder="e.g. 15"
                                value={day ? day.toString() : ""}
                                onChange={(e) => setDay(Number(e.target.value))}
                                hasError={showErrors && (day < 1 || day > maxDaysInMonth)}
                            />
                        </div>
                    </div>

                    <div className="bg-[#0a0a0c] px-2.5 py-3 border border-dim rounded-lg">
                        <p className="font-mono text-[9px] uppercase tracking-wider text-mut mb-2 select-none">Preview {new Date().getFullYear()}</p>
                        <DeadlineCard
                            type={type}
                            due_date={assembledIsoDate}
                            title={title || "Untitled Event"}
                            classroom={classroom || "General"}
                            isFirst={true}
                        />
                    </div>


                    {apiError && (
                        <div className="p-2.5 bg-accent-red/10 border border-accent-red/30 rounded-lg">
                            <p className="text-accent-red font-mono text-[10px] text-center leading-normal">{apiError}</p>
                        </div>
                    )}
                </div>

                <div className="flex font-sf border-t border-dim shrink-0 gap-2 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-lg border border-dim text-sec text-sm outline-none hover:border-white/20 hover:text-pri transition-colors cursor-pointer">
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 py-2.5 rounded-lg border border-dim text-white text-sm font-semibold transition-colors outline-none ${isSubmitting
                            ? "bg-btn-amber/50 text-white/50 cursor-not-allowed border-dim/50"
                            : "bg-btn-amber/80 hover:bg-btn-amber/95 cursor-pointer"
                            }`}
                    >
                        {isSubmitting ? "Adding..." : "Add Deadline"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddDeadlineModal