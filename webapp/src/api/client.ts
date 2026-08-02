import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { tokenStorage } from "../services/tokenStorage";
import { TokenResponse } from "../types/auth";

interface CustomRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
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
    const isLoginRequest = originalRequest?.url?.includes('/token')

    if (error.response && error.response.status == 401 && !originalRequest?._retry && !isLoginRequest) {
        originalRequest._retry = true

        const refreshToken = tokenStorage.getRefreshToken()

        if (refreshToken) {
            try {
                const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
                const response = await axios.post<TokenResponse>(`${baseURL}/api/v1/refresh`, {
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

    if (error.response) {
        const status = error.response.status
        const detail = error.response.data?.detail

        if (status != 401) {
            let errorMessage= "An unexpected error occured"

            if (detail) {
                if (Array.isArray(detail)) {
                    errorMessage = detail[0]?.msg || errorMessage
                } else if (typeof detail === "string") {
                    errorMessage = detail
                }
            }

            if (status === 422) {
                console.error(`Validation Field Error: ${errorMessage}`);
            } else if (status === 400) {
                console.error(`Operation Rejected: ${errorMessage}`);
            } else if (status >= 500) {
                console.error("Critical Server Error: Please try again later.");
            }
        }
    } else if (error.request) {
        console.error("Network Error: Connection to the server could not be established.");
    }


    return Promise.reject(error)
})

export default api;