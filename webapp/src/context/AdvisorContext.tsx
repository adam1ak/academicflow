import { createContext, useContext, useState, ReactNode } from "react"
import { streamAdvisorChat } from "../services/advisorService"
import { usePlan } from "./PlanContext"

export type AdvisorMode = "docked" | "floating"

export interface AdvisorMessage {
    id: string
    sender: "user" | "advisor"
    text: string
    timestamp: Date
}

export interface AdvisorContextType {
    isOpen: boolean
    mode: AdvisorMode
    messages: AdvisorMessage[]
    isStreaming: boolean
    openAdvisor: () => void
    closeAdvisor: () => void
    toggleAdvisor: () => void
    setMode: (mode: AdvisorMode) => void
    sendMessage: (text: string) => Promise<void>
    clearChat: () => void
}

const AdvisorContext = createContext<AdvisorContextType | undefined>(undefined)

export const useAdvisor = () => {
    const context = useContext(AdvisorContext)
    if (!context) {
        throw new Error("useADvisor must be used within an AdvisorProvider")
    }
    return context
}

export function AdvisorProvider({ children }: { children: ReactNode }) {
    const { activePlanId } = usePlan()

    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [mode, setMode] = useState<AdvisorMode>("docked")
    const [messages, setMessages] = useState<AdvisorMessage[]>([])
    const [isStreaming, setIsStreaming] = useState<boolean>(false)

    const openAdvisor = () => setIsOpen(true)
    const closeAdvisor = () => setIsOpen(false)
    const toggleAdvisor = () => setIsOpen(prev => !prev)
    const clearChat = () => setMessages([])

    const sendMessage = async (text: string) => {
        if (!text.trim() || isStreaming) return

        const userMessage: AdvisorMessage = {
            id: `user-${Date.now()}`,
            sender: "user",
            text: text.trim(),
            timestamp: new Date()
        }

        const advisorMessageId = `advisor-${Date.now()}`
        const initialAdvisorMessage: AdvisorMessage = {
            id: advisorMessageId,
            sender: "advisor",
            text: "",
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage, initialAdvisorMessage])
        setIsStreaming(true)

        await streamAdvisorChat({
            message: text.trim(),
            planId: activePlanId,
            onChunk: (chunk: string) => {
                setMessages(prev =>
                    prev.map(message =>
                        message.id === advisorMessageId
                        ? { ...message, text: message.text + chunk }
                        : message
                    )
                )
            },
            onError: (err: string) => {
                setMessages(prev =>
                    prev.map(message =>
                        message.id === advisorMessageId
                        ? { ...message, text: `Error: ${err}` }
                        : message
                    )
                )
                setIsStreaming(false)
            },
            onDone: () => {
                setIsStreaming(false)
            }
        })
    }

    return (
        <AdvisorContext.Provider
            value={{
                isOpen,
                mode,
                messages,
                isStreaming,
                openAdvisor,
                closeAdvisor,
                toggleAdvisor,
                setMode,
                sendMessage,
                clearChat
            }}
        >
            {children}
        </AdvisorContext.Provider>
    )
}