export interface TokenResponse {
    access_token: string
    refresh_token: string
    token_type: string
}

export interface UserMeResponse {
    message: string
    user: string
    github_id: string | null
}

export interface RegisterResponse {
    id: number
    email: string
    is_active: boolean
}