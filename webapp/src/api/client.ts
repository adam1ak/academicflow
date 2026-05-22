import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { tokenStorage } from "../services/tokenStorage";
import { TokenResponse } from "../types/auth";

interface CustomRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

const api = axios.create({
    baseURL: 'http://localhost:8000'
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken()
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use((response: AxiosResponse) => {
    return response
}, async (error) => {
    const originalRequest = error.config as CustomRequestConfig

    if (error.response && error.response.status == 401 && !originalRequest._retry) {
        originalRequest._retry = true

        const refreshToken = tokenStorage.getRefreshToken()

        if (refreshToken) {
            try {
                const response = await axios.post<TokenResponse>('http://localhost:8000/api/v1/refresh', {
                    refresh_token: refreshToken
                })

                const newAccessToken = response.data.access_token

                tokenStorage.setAccessToken(newAccessToken)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                return api(originalRequest)

            } catch (refreshError) {
                console.warn("Refresh token expired.", refreshError)

                tokenStorage.clear()

                window.location.href = '/login'
                return Promise.reject(error)
            }
        } else {
            tokenStorage.clear()
            window.location.href = '/login'
        }

    }


    return Promise.reject(error)
})

export default api;