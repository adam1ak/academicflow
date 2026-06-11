import { useState, useMemo, useRef, useEffect } from "react"
import PillTab from "../ui/PillTab"
import { SubjectDetailResponse } from "../../types/plan"
import { useStatusStyles } from "../../hooks/useStatusStyles"

interface DependentsSelectProps {
    subjects: SubjectDetailResponse[]
    selectedIds: number[]
    onSelectedIdsChange: (ids: number[]) => void
}

function DependentsSelect({ subjects, selectedIds, onSelectedIdsChange }: DependentsSelectProps) {

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const { getStyles } = useStatusStyles()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filteredSubject = useMemo(() => {
        const query = searchQuery.toLowerCase().trim()
        if (!query) return subjects

        return subjects.filter((subject) =>
            subject.name.toLowerCase().includes(query)
        )
    }, [searchQuery, subjects])

    const subjectsToRender = filteredSubject

    const selectedSubjects = useMemo(() => {
        return subjects.filter((subject) => selectedIds.includes(subject.id))
    }, [selectedIds, subjects])

    const handleToggleSubject = (id: number) => {
        const updateIds = selectedIds.includes(id)
            ? selectedIds.filter((item) => item !== id)
            : [...selectedIds, id]

        onSelectedIdsChange(updateIds)
    }

    return (
        <div ref={containerRef} className="flex flex-col gap-1.5 relative w-full">
            <label className="flex items-center gap-3">
                <p className="af-label">Dependents</p>
                <p className="font-mono text-mut text-[9px] mb-1.5">click to add dependencies</p>
            </label>

            <div className="input-af flex flex-wrap gap-1.5 items-center">
                {selectedSubjects.map((subject) => (
                    <PillTab
                        key={subject.id}
                        label={`${subject.name} ✕`}
                        variant={subject.status}
                        isActive={true}
                        onClick={() => handleToggleSubject(subject.id)}
                    />
                ))}

                <input
                    className={`w-full outline-none ${selectedSubjects.length > 0 && "mt-2"}`}
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)}
                />
            </div>

            {isDropdownOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-surface-hi border border-hi rounded-lg max-h-[155px] overflow-y-auto z-50 shadow-2xl p-1 space-y-0.5">
                    {subjectsToRender.length === 0 ? (
                        <div className="py-4 text-center select-none">
                            <p className="font-mono text-[10px] text-mut">No subjects found</p>
                        </div>
                    ) : (
                        subjectsToRender.map((subject) => {
                            const isChecked = selectedIds.includes(subject.id)
                            const currentStyles = getStyles(subject.status)

                            return (
                                <div
                                    key={subject.id}
                                    onClick={() => handleToggleSubject(subject.id)}
                                    className={`flex items-center gap-2 px-2.5 py-2.5 border-b border-b-dim rounded-md cursor-pointer transition-colors ${isChecked ? "bg-[rgba(74,126,255,0.09)]" : "hover:bg-dim/55"
                                        }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${currentStyles.dot}`} />

                                    <div className="flex-1 min-w-0">
                                        <p className="font-sf text-[11px] font-medium overflow-hidden whitespace-nowrap text-ellipsis text-[#94a3b8]">{subject.name}</p>
                                        <p className={`text-[9px] font-mono transition-colors ${currentStyles.text}`}>
                                            <span className="capitalize">{subject.status}</span>
                                            {" · "}
                                            {subject.classroom?.toUpperCase() || "No room"}
                                        </p>
                                    </div>

                                    {isChecked && (
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            stroke="#4ade80"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="shrink-0"
                                        >
                                            <polyline points="2,8 6,12 14,3" />
                                        </svg>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}

export default DependentsSelect