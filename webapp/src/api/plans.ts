import api from "./client";
import { PlanData, GeneratePlanPayLoad, SubjectScheduleItem, CreatePlanPayload, PlanSummary, SubjectCreatePayload, SubjectUpdatePayload, SubjectResponse } from "../types/plan";

export const getMyPlans = async (): Promise<PlanData[]> => {
    const response = await api.get<PlanData[]>('/api/v1/my-plans')

    return response.data
}

export const generatePlan = async (payload: GeneratePlanPayLoad): Promise<SubjectScheduleItem[]> => {
    const response = await api.post<SubjectScheduleItem[]>('/api/v1/generate-plan', payload)

    return response.data
}

export const deletePlan = async (planId: number): Promise<void> => {
    const response = await api.delete(`/api/v1/plans/${planId}`)

    return response.data
}

export const createPlan = async (payload: CreatePlanPayload): Promise<PlanSummary> => {
    const response = await api.post<PlanSummary>('/api/v1/plans', payload)

    return response.data
}

export const addSubject = async (planId: number, payload: SubjectCreatePayload): Promise<SubjectResponse> => {
    const response = await api.post<SubjectResponse> (`/api/v1/plans/${planId}/subjects`, payload)

    return response.data
}
export const updateSubject = async (planId: number, subjectId: number, payload: SubjectUpdatePayload): Promise<SubjectResponse> => {
    const response = await api.put<SubjectResponse> (`/api/v1/plans/${planId}/subjects/${subjectId}`, payload)

    return response.data
}

export const deleteSubject = async (planId: number, subjectId: number): Promise<void> => {
    await api.delete(`/api/v1/plans/${planId}/subjects/${subjectId}`)
}