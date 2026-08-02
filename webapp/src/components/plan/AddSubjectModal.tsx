import { useEffect, useMemo, useState } from "react";
import DependentsSelect from "./DependentsSelect"
import GanttPreviewBar from "../ui/GanttPreviewBar"
import InputField from "../ui/InputField"
import ModalOverlay from "../ui/ModalOverlay"
import { usePlan } from "../../context/PlanContext";
import { useAddSubjectMutation } from "../../hooks/queries/useAddSubjectMutation";
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const subjectSchema = z.object({
    name: z.string().min(1, "Subject name is required").max(100),
    classroom: z.string(),
    field: z.string(),
    duration: z.number().gt(0, "Duration must be greater than 0"),
    dependents: z.array(z.object({
        id: z.number(),
        name: z.string()
    }))
})

type SubjectFormData = z.infer<typeof subjectSchema>

function AddSubjectModal({ onClose }: { onClose: () => void }) {
    const { activePlanId, subjects } = usePlan()
    const [apiError, setApiError] = useState<string>("")

    const addSubjectMutation = useAddSubjectMutation(activePlanId)

    const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<SubjectFormData>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            name: "",
            classroom: "",
            field: "General",
            duration: 1,
            dependents: []
        }
    })

    const { replace }= useFieldArray({
        control,
        name: "dependents"
    })

    const watchedDuration = watch("duration")
    const watchedDependents = watch("dependents")

    const selectedDepIds = useMemo(() => {
        return (watchedDependents || []).map(f => f.id)
    }, [watchedDependents])

    useEffect(() => {
        reset()
        setApiError("")
    }, [reset])

    const handleDepsChange = (nextIds: number[]) => {
        const nextFields = nextIds.map(id => {
            const sub = subjects.find(s => s.id === id)
            return { id, name: sub ? sub.name : "" }
        })
        replace(nextFields)
    }

    const onSubmitForm = async (data: SubjectFormData) => {
        if (!activePlanId) {
            setApiError("Active plan context missing")
            return
        }

        setApiError("")
        const selectedSubjectsNames = data.dependents.map(d => d.name)

        addSubjectMutation.mutate({
            name: data.name.trim(),
            field: data.field.trim() || "General",
            duration: data.duration,
            classroom: data.classroom.trim() || null,
            dependents: selectedSubjectsNames
        }, {
            onSuccess: () => {
                onClose()
            },
            onError: (error: any) => {
                const backendError = error.response?.data?.detail
                setApiError(backendError || "Api error")
            }
        })
    }

    return (
        <ModalOverlay onClose={onClose} className="h-full max-h-[650px]" ariaLabel="Add subject">
            <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full overflow-hidden">
                <div className="flex items-start justify-between border-b border-dim shrink-0 px-6 p-4">
                    <div>
                        <p className="text-sm tracking-tight text-slate-100 font-semibold">Add Subject</p>
                        <p className="font-mono text-[10px] text-sec">New node · dependency graph
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close modal"
                        onClick={onClose}
                        disabled={addSubjectMutation.isPending}
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
                                hasError={!!errors.name}
                                {...register("name")}
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

                    <InputField
                        id="field"
                        label="Field"
                        placeholder="e.g. Algorithms"
                        {...register("field")}
                    />

                    <div className="flex flex-col">
                        <p className="af-label">Semestr timeline</p>
                        <InputField
                            id="duration"
                            label="Duration (weeks)"
                            type="number"
                            placeholder="e.g. 1"
                            hasError={!!errors.duration}
                            labelClassName="font-mono text-mut text-[9px] mb-1.5 uppercase tracking-widest"
                            {...register("duration", { valueAsNumber: true })}
                        />

                        <GanttPreviewBar
                            start={1}
                            duration={watchedDuration || 1} />
                    </div>

                    <DependentsSelect
                        subjects={subjects}
                        selectedIds={selectedDepIds}
                        onSelectedIdsChange={handleDepsChange}
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
                        disabled={addSubjectMutation.isPending}
                        className="flex-1 py-2.5 rounded-lg border border-dim text-sec text-sm outline-none hover:border-white/20 hover:text-pri transition-colors cursor-pointer">
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={addSubjectMutation.isPending}
                        className={`flex-1 py-2.5 rounded-lg border border-dim text-white text-sm font-semibold transition-colors outline-none ${addSubjectMutation.isPending
                            ? "bg-btn-blue/50 text-white/50 cursor-not-allowed border-dim/50"
                            : "bg-btn-blue hover:bg-btn-blue-hover cursor-pointer"
                            }`}
                    >
                        {addSubjectMutation.isPending ? "Adding..." : "Add subject"}
                    </button>
                </div>
            </form>
        </ModalOverlay>
    )
}

export default AddSubjectModal