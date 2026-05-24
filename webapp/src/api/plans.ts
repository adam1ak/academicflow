import api from "./client";
import { PlanData, GeneratePlanPayLoad, SubjectScheduleItem } from "../types/plan";

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