import api from "./api";

export const login = async (username, password) => {
    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    const response = await api.post('/api/v1/token', formData)

    localStorage.setItem('token', response.data.access_token)
    localStorage.setItem('refreshToken', response.data.refresh_token)

    return response.data
}

export const register = async (email, password) => {
    const response = await api.post('/api/v1/register',
        { email, password }
    )

    return response.data
}

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};

export const verifySession = async () => {
    const response = await api.get('/api/v1/users/me')

    return response.data
}