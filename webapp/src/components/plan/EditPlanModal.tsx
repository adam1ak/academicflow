import React, { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import api from "../../api/client"
import InputField from "../ui/InputField"
import { PlanData } from "../../types/plan"
import { usePlan } from "../../context/PlanContext"

interface EditPlanModalProps {
    plan: PlanData
    onClose: () => void
}

const ACCENT_COLORS = [
    { id: "purple", color: "var(--color-accent-purple)", glow: "var(--color-accent-purple-glow)" },
    { id: "green", color: "var(--color-accent-green)", glow: "var(--color-accent-green-glow)" },
    { id: "blue", color: "var(--color-accent-blue)", glow: "var(--color-accent-blue-glow)" },
    { id: "amber", color: "var(--color-accent-amber)", glow: "var(--color-accent-amber-glow)" },
    { id: "amber-light", color: "var(--color-accent-amber-light)", glow: "var(--color-accent-amber-light-glow)" },
    { id: "red", color: "var(--color-accent-red)", glow: "var(--color-accent-red-glow)" },
    { id: "pink", color: "var(--color-accent-pink)", glow: "var(--color-accent-pink-glow)" },
    { id: "teal", color: "var(--color-accent-teal)", glow: "var(--color-accent-teal-glow)" }
]

const editPlanSchema = z.object({
    name: z.string().min(1, "Schedule name is required").max(50, "Name is too long"),
    semester: z.string().min(1, "Required"),
    max_concurrent: z.number().min(1, "Min 1 subject").max(10, "Max 10 subjects"),
    start_date: z.string().min(1, "Start date is required"),
    accent_color: z.string().min(1, "Required")
})

type EditPlanFormData = z.infer<typeof editPlanSchema>

function EditPlanModal({ plan, onClose }: EditPlanModalProps) {
    const { refreshPlans } = usePlan()
    const [apiError, setApiError] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [selectedColor, setSelectedColor] = useState<string>(plan.accent_color ?? "purple")

    const semesterOptions = useMemo(() => {
        const options: { value: string; label: string }[] = []
        const now = new Date()
        let targetYear = now.getFullYear()
        let isFall = now.getMonth() >= 8

        for (let i = 0; i < 8; i++) {
            const shortYear = String(targetYear).slice(-2)
            const value = isFall ? `fall${shortYear}` : `spr${shortYear}`
            const label = isFall ? `Fall ${targetYear}` : `Spring ${targetYear}`
            options.push({ value, label })
            if (isFall) isFall = false
            else { isFall = true; targetYear-- }
        }

        if (plan.semester && !options.find(o => o.value === plan.semester)) {
            const s = plan.semester
            const yearNum = 2000 + parseInt(s.slice(-2))
            const label = s.startsWith("fall") ? `Fall ${yearNum}` : `Spring ${yearNum}`
            options.unshift({ value: s, label })
        }

        return options
    }, [plan.semester])

    const { register, handleSubmit, formState: { errors } } = useForm<EditPlanFormData>({
        resolver: zodResolver(editPlanSchema),
        defaultValues: {
            name: plan.name,
            semester: plan.semester ?? semesterOptions[0]?.value ?? "",
            max_concurrent: plan.max_concurrent ?? 6,
            start_date: plan.start_date ?? new Date().toISOString().split("T")[0],
            accent_color: plan.accent_color ?? "purple"
        }
    })

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose])

    const onSubmitForm = async (data: EditPlanFormData) => {
        const payload = { ...data, accent_color: selectedColor }
        setIsSubmitting(true)
        setApiError("")
        try {
            await api.patch(`/api/v1/plans/${plan.id}`, payload)
            await refreshPlans()
            onClose()
        } catch (error: any) {
            const backendError = error.response?.data?.detail
            setApiError(backendError || "Failed to update schedule")
        } finally {
            setIsSubmitting(false)
        }
    }

    const dateBounds = useMemo(() => {
        const currentYear = new Date().getFullYear()
        const oldestOption = semesterOptions[semesterOptions.length - 1]
        const minYear = oldestOption ? 2000 + parseInt(oldestOption.value.slice(-2)) : currentYear - 3
        return { min: `${minYear}-01-01`, max: `${currentYear + 1}-12-31` }
    }, [semesterOptions])

    const handleDateAutofix = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (!value) return
        const parts = value.split("-")
        const typedYear = parseInt(parts[0])
        const minYear = parseInt(dateBounds.min.split("-")[0])
        const maxYear = parseInt(dateBounds.max.split("-")[0])
        if (typedYear < minYear) parts[0] = String(minYear)
        else if (typedYear > maxYear) parts[0] = String(maxYear)
    }

    return (
        <div onClick={onClose} className="modal-overlay">
            <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit(onSubmitForm)}
                className={`modal-container h-full ${apiError ? "max-h-[520px]" : "max-h-[450px]"}`}>

                <div className="flex items-start justify-between border-b border-dim shrink-0 px-6 p-4">
                    <div>
                        <p className="text-sm tracking-tight text-slate-100 font-semibold">Edit Schedule</p>
                        <p className="font-mono text-[10px] text-sec">{plan.name} · update settings</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center text-sec hover:text-pri leading-none transition-colors cursor-pointer"
                    >✕</button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pt-6 space-y-4">
                    <div className="flex gap-3 w-full">
                        <div className="flex-1">
                            <InputField
                                id="ep-name"
                                label="schedule name"
                                placeholder="e.g. Plan B"
                                hasError={!!errors.name}
                                {...register("name")}
                            />
                        </div>

                        <div className="flex flex-col flex-[1.5]">
                            <label htmlFor="ep-semester-select" className="af-label">semestr</label>
                            <select
                                id="ep-semester-select"
                                className="input-af capitalize cursor-pointer"
                                {...register("semester")}
                            >
                                {semesterOptions.map((option) => (
                                    <option key={option.value} value={option.value} className="bg-surface-hi text-pri">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full">
                        <div className="flex-1">
                            <InputField
                                id="ep-concurrent"
                                label="max concurrent"
                                placeholder="6"
                                type="number"
                                min={1}
                                max={10}
                                hasError={!!errors.max_concurrent}
                                {...register("max_concurrent", { valueAsNumber: true })}
                            />
                        </div>

                        <div className="flex-1">
                            <InputField
                                id="ep-start-date"
                                label="start date"
                                type="date"
                                min={dateBounds.min}
                                max={dateBounds.max}
                                hasError={!!errors.start_date}
                                {...register("start_date", { onBlur: handleDateAutofix })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="af-label">Accent Color</label>
                        <div className="mt-1 flex gap-2.5 items-center">
                            {ACCENT_COLORS.map((colorObj) => {
                                const isSelected = colorObj.id === selectedColor
                                return (
                                    <button
                                        key={colorObj.id}
                                        type="button"
                                        onClick={() => setSelectedColor(colorObj.id)}
                                        className={`w-7 h-7 rounded-full border-2 border-transparent transition-all duration-200 cursor-pointer ${isSelected ? "scale-[1.2] border-2" : "hover:scale-[1.1]"}`}
                                        style={{
                                            background: colorObj.color,
                                            boxShadow: isSelected ? `0 0 14px ${colorObj.glow}73` : "none",
                                            borderColor: isSelected ? "rgba(0, 0, 0, 0.50)" : undefined
                                        }}
                                    />
                                )
                            })}
                        </div>
                    </div>

                    {apiError && (
                        <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg font-mono text-[10px] text-red-400 text-center">
                            {apiError}
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
                            ? "bg-btn-blue/50 text-white/50 cursor-not-allowed border-dim/50"
                            : "bg-btn-blue hover:bg-btn-blue-hover cursor-pointer"
                        }`}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditPlanModal
