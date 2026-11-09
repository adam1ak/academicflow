import { tokenStorage } from "./tokenStorage"

export interface StreamAdvisorParams {
    message: string
    planId?: number | null
    onChunk: (chunk: string) => void
    onError?: (error: string) => void
    onDone?: () => void
}

const BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "")

async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) return null

    try {
        const response = await fetch(`${BASE_URL}/api/v1/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken })
        })
        if (!response.ok) {
            tokenStorage.clear()
            return null
        }
        const data = await response.json()
        if (data.access_token) {
            tokenStorage.setAccessToken(data.access_token)
            return data.access_token
        }
        return null
    } catch {
        return null
    }
}

export async function streamAdvisorChat({
    message,
    planId,
    onChunk,
    onError,
    onDone
}: StreamAdvisorParams): Promise<void> {
    let token = tokenStorage.getAccessToken()

    try {
        let response = await fetch(`${BASE_URL}/api/v1/ai/advisor/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                message,
                plan_id: planId ?? null
            })
        })

        if (response.status === 401) {
            const newToken = await refreshAccessToken()
            if (newToken) {
                token = newToken
                response = await fetch(`${BASE_URL}/api/v1/ai/advisor/stream`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        message,
                        plan_id: planId ?? null
                    })
                })
            }
        }

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`)
        }
        if (!response.body){
            throw new Error("No response body received from server")
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder("utf-8")
        let buffer = ""

        while (true) {
            const { done, value } = await reader.read()
            if (done) {
                break
            }
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() ?? ""

            for (const line of lines) {
                const trimmed = line.trim()
                if (trimmed.startsWith("data:")) {
                    const rawData = trimmed.replace(/^data:\s*/, "")
                    if (rawData === "[DONE]") {
                        if (onDone) onDone()
                        return
                    }

                    try {
                        const parsed = JSON.parse(rawData)
                        if (parsed.error) {
                            if (onError) onError(parsed.error)
                            return
                        }
                        const chunkText = parsed.token ?? parsed.text
                        if (chunkText) {
                            onChunk(chunkText)
                        }
                    } catch {
                        if (rawData) onChunk(rawData)
                    }
                }
            }
        }

        if (onDone) onDone()
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown streaming error"

        if (onError) {
            onError(errorMessage)
        } else {
            console.error("Advisor stream error: ", errorMessage)
        }
    }
}
