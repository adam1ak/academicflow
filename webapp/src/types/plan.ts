export interface SubjectScheduleItem {
    name: string
    start_time: number
    end_time: number
}

export interface PlanData {
    id: number
    name: string
    schedule: SubjectScheduleItem[]
}

export interface SubjectInput {
    name: string
    field: string
    duration: number
    dependents: string[]
}

export interface GeneratePlanPayLoad {
    max_concurrent: number
    subjects: SubjectInput[]
}
