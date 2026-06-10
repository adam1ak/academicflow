export interface SubjectScheduleItem {
    name: string
    start_time: number
    end_time: number
}

export interface SubjectDetailResponse {
    id: number
    name: string
    field: string
    duration: number
    classroom: string | null
    is_completed: boolean
    status: "ready" | "blocked" | "completed"
    dependents: string[]
}

export interface PlanData {
    id: number
    name: string
    schedule: SubjectScheduleItem[]
    subjects?: SubjectDetailResponse[]
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

export interface CreatePlanPayload {
    name: string
    max_concurrent: number
}

export interface PlanSummary {
    id: number,
    name: string
    max_concurrent: number
}

export interface SubjectCreatePayload {
    name: string
    field: string
    duration: number
    classroom?: string | null
    dependents?: string[]
}

export interface SubjectUpdatePayload {
    name?: string
    field?: string
    duration?: number
    classroom?: string | null
    dependents?: string[]
}

export interface SubjectResponse {
    id: number
    name: string
    field: string
    duration: number
    classroom: string | null
    dependents: string[]
}