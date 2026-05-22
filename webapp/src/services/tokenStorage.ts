const ACCESS_TOKEN_KEY = "token"
const REFRESH_TOKEN_KEY = "refreshToken"

export const tokenStorage = {
    getAccessToken: () : string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
    setAccessToken: (token: string) : void => localStorage. setItem(ACCESS_TOKEN_KEY, token),
    removeAccessToken: (): void => localStorage.removeItem(ACCESS_TOKEN_KEY),

    getRefreshToken: () : string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
    setRefreshToken: (token: string) : void => localStorage. setItem(REFRESH_TOKEN_KEY, token),
    removeRefreshToken: (): void => localStorage.removeItem(REFRESH_TOKEN_KEY),

    clear: (): void => {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
}