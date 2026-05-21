import api from "./api.js";

export interface AuthResponse {
access_token: string;
    refresh_token: string;
    token_type: string;
}

export const login = async (username : string, password : string) : Promise<AuthResponse> => {
    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    const response = await api.post('/api/v1/token', formData)

    localStorage.setItem('token', response.data.access_token)
    localStorage.setItem('refreshToken', response.data.refresh_token)

    return response.data
}

export const register = async (email : string, password : string) : Promise<{ id: number, email: string }> => {
    const response = await api.post('/api/v1/register',
        { email, password }
    )

    return response.data
}

export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};

export const verifySession = async (): Promise<any> => {
    const response = await api.get('/api/v1/users/me')

    return response.data
}