import api from "./client"
import { tokenStorage } from "../services/tokenStorage";
import { TokenResponse, UserMeResponse, RegisterResponse } from "../types/auth";

export const login = async (username : string, password : string) : Promise<TokenResponse> => {
    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    const response = await api.post<TokenResponse>('/api/v1/token', formData)

    tokenStorage.setAccessToken(response.data.access_token)
    tokenStorage.setRefreshToken(response.data.refresh_token)

    return response.data
}

export const register = async (email : string, password : string) : Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/api/v1/register',
        { email, password }
    )

    return response.data
}

export const logout = (): void => {
    tokenStorage.clear()
};

export const verifySession = async (): Promise<UserMeResponse> => {
    const response = await api.get<UserMeResponse>('/api/v1/users/me')

    return response.data
}