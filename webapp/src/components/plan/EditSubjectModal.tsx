import { useEffect, useMemo, useState } from "react";
import DependentsSelect from "./DependentsSelect"
import GanttPreviewBar from "../ui/GanttPreviewBar"
import InputField from "../ui/InputField"
import { usePlan } from "../../context/PlanContext";
import { useUpdateSubjectMutation } from "../../hooks/queries/useUpdateSubjectMutation";
import { SubjectDetailResponse } from "../../types/plan";

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

interface EditSubjectModalProps {
    subject: SubjectDetailResponse;
    onClose: () => void;
}

function EditSubjectModal({ subject, onClose }: EditSubjectModalProps) {
    const { activePlanId, subjects } = usePlan()
    const [apiError, setApiError] = useState<string>("")

    const updateMutation = useUpdateSubjectMutation(activePlanId, subject.id)

    // Map dependent names from subject.dependents to their ID and Name objects
    const initialDependents = useMemo(() => {
        return (subject.dependents || []).map(depName => {
            const sub = subjects.find(s => s.name === depName)
            return {
                id: sub ? sub.id : 0,
                name: depName
            }
        }).filter(d => d.id !== 0)
    }, [subject.dependents, subjects])

    const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<SubjectFormData>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            name: subject.name,
            classroom: subject.classroom || "",
            field: subject.field || "General",
            duration: subject.duration,
            dependents: initialDependents
        }
    })

    const { replace } = useFieldArray({
        control,
        name: "dependents"
    })

    const watchedDuration = watch("duration")
    const watchedDependents = watch("dependents")

    const selectedDepIds = useMemo(() => {
        return (watchedDependents || []).map(f => f.id)
    }, [watchedDependents])

    // Filter out the current subject being edited and any subjects that would introduce a cycle
    const selectableSubjects = useMemo(() => {
        const hasPath = (fromName: string, toName: string): boolean => {
            const visited = new Set<string>();
            const queue: string[] = [fromName];
            const adjMap = new Map<string, string[]>();

            subjects.forEach(s => {
                adjMap.set(s.name, s.dependents || []);
            });

            while (queue.length > 0) {
                const current = queue.shift()!;
                if (current === toName) return true;
                if (visited.has(current)) continue;
                visited.add(current);

                const neighbors = adjMap.get(current) || [];
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        queue.push(neighbor);
                    }
                }
            }
            return false;
        };

        return subjects.filter(s => {
            if (s.id === subject.id) return false;
            if (hasPath(s.name, subject.name)) return false;
            return true;
        });
    }, [subjects, subject.id, subject.name])

    useEffect(() => {
        reset({
            name: subject.name,
            classroom: subject.classroom || "",
            field: subject.field || "General",
            duration: subject.duration,
            dependents: initialDependents
        })
        setApiError("")
    }, [subject, initialDependents, reset])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

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

        updateMutation.mutate({
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
        <div
            onClick={onClose}
            className="modal-overlay">
            <form
                onSubmit={handleSubmit(onSubmitForm)}
                onClick={(e) => e.stopPropagation()}
                className="modal-container h-full max-h-[650px]">
                <div className="flex items-start justify-between border-b border-dim shrink-0 px-6 p-4">
                    <div>
                        <p className="text-sm tracking-tight text-slate-100 font-semibold">Edit Subject</p>
                        <p className="font-mono text-[10px] text-sec">Update subject node · dependency graph</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={updateMutation.isPending}
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
                        subjects={selectableSubjects}
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
                        disabled={updateMutation.isPending}
                        className="flex-1 py-2.5 rounded-lg border border-dim text-sec text-sm outline-none hover:border-white/20 hover:text-pri transition-colors cursor-pointer">
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className={`flex-1 py-2.5 rounded-lg border border-dim text-white text-sm font-semibold transition-colors outline-none ${updateMutation.isPending
                            ? "bg-btn-blue/50 text-white/50 cursor-not-allowed border-dim/50"
                            : "bg-btn-blue hover:bg-btn-blue-hover cursor-pointer"
                            }`}
                    >
                        {updateMutation.isPending ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditSubjectModal