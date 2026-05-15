import api from "./api";

export const getMyPlans = async () => {
    const response = await api.get('/api/v1/my_plans')

    return response.data
}

export const generatePlan = async (payload) => {
    const response = await api.post('/api/v1/generate-plan', payload)

    return response.data
}