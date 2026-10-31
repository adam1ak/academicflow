import { tokenStorage } from "./tokenStorage"

export interface StreamAdvisorParams {
    message: string
    planId?: number | null
    onChunk: (chunk: string) => void
    onError?: (error: string) => void
    onDone?: () => void
}

const BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "")

export async function streamAdvisorChat({
    message,
    planId,
    onChunk,
    onError,
    onDone
}: StreamAdvisorParams): Promise<void> {
    const token = tokenStorage.getAccessToken()

    try {
        const response = await fetch(`${BASE_URL}/api/v1/ai/advisor/stream`, {
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
                        break
                    }

                    try {
                        const parsed = JSON.parse(rawData)
                        if (parsed.error) {
                            if (onError) onError(parsed.error)
                            break
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
