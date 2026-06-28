import { useEffect, useMemo, useState } from "react"
import { usePlan } from "../../context/PlanContext"
import { PillVariant } from "../../hooks/useStatusStyles"
import PillTab from "../ui/PillTab"
import InputField from "../ui/InputField"
import DeadlineCard from "../dashboard/sidebar/DeadlineCard"
import { createDeadline } from "../../api/deadlines"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface AddDeadlineModalProps {
    onClose: () => void
    onSuccess: () => void
}

const ENGLISH_MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const currentYear = new Date().getFullYear()
const deadlineSchema = z.object({
    title: z.string().min(1, "Event title is required").max(100),
    classroom: z.string(),
    type: z.enum(["assignment", "exam", "project", "task"]),
    monthIndex: z.number(),
    day: z.number().gte(1, "Day must be at least 1")
}).refine((data) => {
    const maxDays = new Date(currentYear, data.monthIndex + 1, 0).getDate()
    return data.day <= maxDays
}, {
    message: "Invalid day for the selected month",
    path: ["day"]
})

type DeadlineFormData = z.infer<typeof deadlineSchema>

function AddDeadlineModal({ onClose, onSuccess }: AddDeadlineModalProps) {
    const { activePlanId } = usePlan()
    const [apiError, setApiError] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DeadlineFormData>({
        resolver: zodResolver(deadlineSchema),
        defaultValues: {
            title: "",
            classroom: "",
            type: "assignment",
            monthIndex: new Date().getMonth(),
            day: new Date().getDate()
        }
    })

    const watchedType = watch("type")
    const watchedMonth = watch("monthIndex")
    const watchedDay = watch("day")
    const watchedTitle = watch("title")
    const watchedClassroom = watch("classroom")

    useEffect(() => {
        reset()
        setApiError("")
    }, [reset])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose])

    const assembledIsoDate = useMemo(() => {
        const today = new Date()
        let targetDate = new Date(currentYear, watchedMonth, watchedDay || 1)

        if (targetDate < today && targetDate.toDateString() !== today.toDateString()) {
            targetDate = new Date(currentYear + 1, watchedMonth, watchedDay || 1)
        }

        const year = targetDate.getFullYear()
        const monthStr = String(targetDate.getMonth() + 1).padStart(2, "0")
        const dayStr = String(targetDate.getDate()).padStart(2, "0")

        return `${year}-${monthStr}-${dayStr}`
    }, [watchedMonth, watchedDay])

    const onSubmitForm = async (data: DeadlineFormData) => {
        if (!activePlanId) {
            setApiError("Active plan context missing")
            return
        }

        setIsSubmitting(true)
        setApiError("")

        try {
            await createDeadline({
                title: data.title.trim(),
                type: data.type,
                due_date: assembledIsoDate,
                classroom: data.classroom.trim() || null,
                plan_id: activePlanId
            })

            onSuccess()
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
                onSubmit={handleSubmit(onSubmitForm)}
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
                                hasError={!!errors.title}
                                {...register("title")}
                            />
                        </div>

                        <div className="flex-1">
                            <InputField
                                id="classroom"
                                label="classroom"
                                placeholder="e.g. Room 452"
                                {...register("classroom")}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="af-label">Event type</label>
                        <div className="flex gap-3">
                            {(["assignment", "exam", "project", "task"] as const).map((item) => (
                                <PillTab
                                    key={item}
                                    label={item}
                                    variant={item as PillVariant}
                                    isActive={watchedType === item}
                                    onClick={() => setValue("type", item)}
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
                                {...register("monthIndex", { valueAsNumber: true })}
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
                                hasError={!!errors.day}
                                {...register("day", { valueAsNumber: true })}
                            />
                        </div>
                    </div>

                    <div className="bg-[#0a0a0c] px-2.5 py-3 border border-dim rounded-lg">
                        <p className="font-mono text-[9px] uppercase tracking-wider text-mut mb-2 select-none">Preview {new Date().getFullYear()}</p>
                        <DeadlineCard
                            type={watchedType}
                            due_date={assembledIsoDate}
                            title={watchedTitle || "Untitled Event"}
                            classroom={watchedClassroom || "General"}
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