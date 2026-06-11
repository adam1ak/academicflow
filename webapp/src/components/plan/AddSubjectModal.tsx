import { useEffect, useState } from "react";
import DependentsSelect from "./DependentsSelect"
import GanttPreviewBar from "../ui/GanttPreviewBar"
import InputField from "../ui/InputField"
import { usePlan } from "../../context/PlanContext";
import { addSubject } from "../../api/plans";

function AddSubjectModal({ onClose }: { onClose: () => void }) {
    const { activePlanId, subjects, refreshDetails } = usePlan()

    const [name, setName] = useState<string>("")
    const [classroom, setClassroom] = useState<string>("")
    const [field, setField] = useState<string>("")
    const [duration, setDuration] = useState<number>(1)

    const [selectedDepIds, setSelectedDepIds] = useState<number[]>([])

    const [apiError, setApiError] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [showErrors, setShowErrors] = useState<boolean>(false)

    useEffect(() => {
        setName("")
        setClassroom("")
        setField("")
        setDuration(1)
        setSelectedDepIds([])
        setApiError("")
        setShowErrors(false)
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setApiError("")

        if (!name.trim() || duration <= 0 || !activePlanId) {
            setShowErrors(true)
            return
        }

        const selectedSubjectsNames = subjects
            .filter((sub) => selectedDepIds.includes(sub.id))
            .map((sub) => sub.name)

        setIsSubmitting(true)

        try {
            await addSubject(activePlanId, {
                name: name.trim(),
                field: field.trim() || "General",
                duration: duration,
                classroom: classroom.trim() || null,
                dependents: selectedSubjectsNames
            })

            await refreshDetails()
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
                className="modal-container h-full max-h-[650px]">
                <div className="flex items-start justify-between border-b border-dim shrink-0 px-6 p-4">
                    <div>
                        <p className="text-sm tracking-tight text-slate-100 font-semibold">Add Subject</p>
                        <p className="font-mono text-[10px] text-sec">New node · dependency graph
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-7 h-7 flex items-center justify-center text-sec hover:text-pri leading-none transition-colors cursor-pointer"
                    >✕</button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pt-6 space-y-4">
                    <div className="flex gap-3 w-full">
                        <div className="flex-1">
                            <InputField
                                id="subject-name"
                                label="subject name"
                                placeholder="e.g. Algorithms"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                hasError={showErrors && !name.trim()}
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

                    <InputField
                        id="field"
                        label="Field"
                        placeholder="e.g. Algorithms"
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                    />

                    <div className="flex flex-col">
                        <p className="af-label">Semestr timeline</p>
                        <InputField
                            id="duration"
                            label="Duration (weeks)"
                            type="number"
                            placeholder="e.g. 1"
                            value={duration.toString()}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            hasError={showErrors && (duration <= 0 || !duration)}
                            labelClassName="font-mono text-mut text-[9px] mb-1.5 uppercase tracking-widest"
                        />

                        <GanttPreviewBar
                            start={1}
                            duration={duration} />
                    </div>

                    <DependentsSelect
                        subjects={subjects}
                        selectedIds={selectedDepIds}
                        onSelectedIdsChange={setSelectedDepIds}
                    />

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
                            ? "bg-btn-blue/50 text-white/50 cursor-not-allowed border-dim/50"
                            : "bg-btn-blue hover:bg-btn-blue-hover cursor-pointer"
                            }`}
                    >
                        {isSubmitting ? "Adding..." : "Add subject"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddSubjectModal