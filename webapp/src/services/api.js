import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8000'
})

export const login = async (username, password) => {
    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    const response = await api.post('/api/v1/token', formData)
    return response.data
}

export default api;