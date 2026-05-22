import React, { useState } from "react"
import { generatePlan } from "../api/plans"

interface SubjectPayload {
    name: string,
    field: string,
    duration: number,
    dependents: string
}

interface GeneratePlanFormProps {
    onPlanGenerated: () => void
}

function GeneratePlanForm({ onPlanGenerated } : GeneratePlanFormProps) {
    const [maxConcurrent, setMaxConcurrent] = useState<number>(2)
    const [subjects, setSubjects] = useState<SubjectPayload[]>([
        { name: "", field: "", duration: 1, dependents: "" }
    ])

    const handleAddSubject = () => {
        setSubjects([...subjects, {
            name: "",
            field: "",
            duration: 1,
            dependents: ""
        }])
    }

    const handleRemoveIndex = (removeIndex: number) => {
        const filteredSubjects = subjects.filter((_, index) => index !== removeIndex)

        setSubjects(filteredSubjects)
    }

    const handleSubjectChange = (index: number, fieldName: keyof SubjectPayload, newValue: string | number) => {
        const updatedSubjects = [...subjects]

        updatedSubjects[index] = {
            ...updatedSubjects[index],
            [fieldName]: newValue
        } as any

        setSubjects(updatedSubjects)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const allSubjectsNames = subjects.map(s => s.name.trim())

        const formattedSubjects = subjects.map(subject => ({
            ...subject,
            dependents: subject.dependents.split(',')
                .map(s => s.trim())
                .filter(s => s !== "")
        }))

        for (let sbj of formattedSubjects){
            for (let dep of sbj.dependents) {
                if(!allSubjectsNames.includes(dep)) {
                    console.error(`Validation error: subject "${dep}" is missing`)

                    return;
                }
            }
        }

        const payload = {
            max_concurrent: maxConcurrent,
            subjects: formattedSubjects
        }

        try {
            await generatePlan(payload)
            onPlanGenerated()

            setSubjects([{ name: "", field: "", duration: 1, dependents: "" }])
        } catch (error) {
            console.log("Erorr while generating schedule: ", error)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ border: '2px dashed gray', padding: '20px', marginTop: '20px' }}>
            <h3>Plan generator</h3>

            <div>
                <label>Max concurrent at once: </label>
                <input
                    type="number"
                    value={maxConcurrent}
                    onChange={(e) => setMaxConcurrent(Number(e.target.value))}
                    min={1}
                />
            </div>

            {subjects.map((subject, index) => (
                <div key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                            placeholder="Subject name"
                            value={subject.name}
                            onChange={(e) => handleSubjectChange(index, "name", e.target.value)}
                            required
                        />

                        <input
                            placeholder="Field"
                            value={subject.field}
                            onChange={(e) => handleSubjectChange(index, "field", e.target.value)}
                        />

                        <input
                            placeholder="Duration"
                            value={subject.duration}
                            onChange={(e) => handleSubjectChange(index, "duration", Number(e.target.value))}
                            required
                            min="1"
                            style={{ width: '80px' }}
                        />

                        <input
                            placeholder="Dependents (C1, C2)"
                            value={subject.dependents}
                            onChange={(e) => handleSubjectChange(index, "dependents", e.target.value)}
                        />
                        {subjects.length > 1 && (
                            <button type="button" onClick={() => handleRemoveIndex(index)} style={{ color: 'red' }}>
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            ))}

            <button type="button" onClick={handleAddSubject}>Add next subject</button>

            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                Generate and save schedule
            </button>
        </form>
    )
}

export default GeneratePlanForm