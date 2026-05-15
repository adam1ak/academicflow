import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8000'
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export const login = async (username, password) => {
    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    const response = await api.post('/api/v1/token', formData)
    
    localStorage.setItem('token', response.data.access_token)
    
    return response.data
}

export const logout = () => {
    localStorage.removeItem('token');
};

export const getMyPlans = async () => {
    const response = await api.get('/api/v1/my_plans')

    return response.data
}

export const generatePlan = async (payload) => {
    const response = await api.post('/api/v1/generate-plan', payload)

    return response.data
}

export default api;