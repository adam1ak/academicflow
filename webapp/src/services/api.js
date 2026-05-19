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

api.interceptors.response.use((response) => {
    return response
}, async (error) => {
    const originalRequest = error.config

    if (error.response && error.response.status == 401 && !originalRequest._retry) {
        originalRequest._retry = true

        const refreshToken = localStorage.getItem('refreshToken')

        if (refreshToken) {
            try {
                const response = await axios.post('http://localhost:8000/api/v1/refresh', {
                    refresh_token: refreshToken
                })

                const newAccessToken = response.data.access_token

                localStorage.setItem('token', newAccessToken)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                return axios(originalRequest)

            } catch (refreshError) {
                console.warn("Refresh token expired.", refreshError)

                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                window.location.href = '/login'
                return Promise.reject(error)
            }
        } else {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }

    }


    return Promise.reject(error)
})

export default api;