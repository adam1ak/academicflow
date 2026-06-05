export type DeadlineType = "exam" | "task" | "project" | "assignment" | string;

export interface DeadlineResponse {
    id: number
    title: string
    type: DeadlineType
    due_date: string
    classroom: string | null
    plan_id: number | null
}

export interface DeadlineCreatePayload {
    title: string
    type: DeadlineType
    due_date: string
    classroom?: string | null
    plan_id?: string | null
}

export interface DeadlineUpdatePayload {
    title?: string;
    type?: DeadlineType;
    due_date?: string;
    classroom?: string | null;
    plan_id?: number | null;
}