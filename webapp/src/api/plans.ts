import api from "./client";
import { PlanData, GeneratePlanPayLoad, SubjectScheduleItem, CreatePlanPayload, PlanSummary, SubjectCreatePayload, SubjectUpdatePayload, SubjectResponse, SubjectDetailResponse } from "../types/plan";

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
    const response = await api.post<SubjectResponse>(`/api/v1/plans/${planId}/subjects`, payload)

    return response.data
}
export const updateSubject = async (planId: number, subjectId: number, payload: SubjectUpdatePayload): Promise<SubjectResponse> => {
    const response = await api.put<SubjectResponse>(`/api/v1/plans/${planId}/subjects/${subjectId}`, payload)

    return response.data
}

export const deleteSubject = async (planId: number, subjectId: number): Promise<void> => {
    await api.delete(`/api/v1/plans/${planId}/subjects/${subjectId}`)
}

export const getSubjects = async (planId: number): Promise<SubjectDetailResponse[]> => {
    const response = await api.get<SubjectDetailResponse[]>(`/api/v1/plans/${planId}/subjects`)

    return response.data
}

export const toggleComplete = async (planId: number, subjectId: number): Promise<SubjectDetailResponse> => {
    const response = await api.patch<SubjectDetailResponse>(`/api/v1/plans/${planId}/subjects/${subjectId}/complete`)

    return response.data
}

export const exportPlanICS = async (planId: number): Promise<Blob> => {
    const response = await api.get<Blob>(`/api/v1/plans/${planId}/export/ics`, {
        responseType: 'blob'
    })

    return response.data
}

export const exportPlanPDF = async (planId: number): Promise<Blob> => {
    const response = await api.get<Blob>(`/api/v1/plans/${planId}/export/pdf`, {
        responseType: 'blob'
    })

    return response.data
}

export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = filename
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}