import api from "./client";
import { DeadlineResponse, DeadlineCreatePayload, DeadlineUpdatePayload } from "../types/deadline";

export const getDeadlines = async (planId?: number): Promise<DeadlineResponse[]> => {
    const response = await api.get<DeadlineResponse[]>('/api/v1/deadlines', { params: planId ? { plan_id: planId } : undefined })

    return response.data
}

export const createDeadline = async (payload: DeadlineCreatePayload): Promise<DeadlineResponse> => {
    const response = await api.post<DeadlineResponse>('/api/v1/deadlines', payload)

    return response.data
}

export const updateDeadline = async (id: number, payload: DeadlineUpdatePayload): Promise<DeadlineResponse> => {
    const response = await api.put<DeadlineResponse>(`/api/v1/deadlines/${id}`, payload)

    return response.data
}

export const deleteDeadline = async (id: number): Promise<void> => {
    await api.delete(`/api/v1/deadlines/${id}`)
}