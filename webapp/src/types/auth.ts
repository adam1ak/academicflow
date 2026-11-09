export interface TokenResponse {
    access_token: string
    refresh_token: string
    token_type: string
}

export interface UserMeResponse {
    id: number
    email: string
    is_active: boolean
    name: string | null
}

export interface RegisterResponse {
    id: number
    email: string
    is_active: boolean
    name: string | null
}