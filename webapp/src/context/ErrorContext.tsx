import { createContext, ReactNode, useCallback, useContext, useState } from "react"

export type ToastType = 'error' | 'success' | 'warning' | 'info'

export interface ToastMessage {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ErrorContextType {
    toasts: ToastMessage[]
    error: string | null
    showError: (message: string) => void
    showSuccess: (message: string) => void
    showToast: (
        message: string, 
        type?: ToastType, 
        duration?: number
    ) => void
    removeToast: (id: string) => void
    cleanError: () => void
}

interface ErrorContextProviderProps {
    children: ReactNode
}

const ErrorContext = createContext<ErrorContextType | null>(null)

export const ErrorContextProvider = ({ children }: ErrorContextProviderProps) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((message: string, type: ToastType = 'error', duration = 4000) => {
        const id = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        
        const newToast: ToastMessage = {
            id,
            message,
            type,
            duration
        }

        setToasts((prev) => [...prev, newToast])

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }, [removeToast])

    const showError = useCallback((message: string) => {
        showToast(message, 'error')
    }, [showToast])

    const showSuccess = useCallback((message: string) => {
        showToast(message, 'success')
    }, [showToast])

    const cleanError = useCallback(() => {
        setToasts([])
    }, [])

    const error = toasts.length > 0
        ? (toasts[toasts.length - 1]?.message)
        : null

    return (
        <ErrorContext.Provider
            value={{
                toasts,
                error,
                showError,
                showSuccess,
                showToast,
                removeToast,
                cleanError
            }}>

            {children}
        </ErrorContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useError = (): ErrorContextType => {
    const context = useContext(ErrorContext)
    if (!context) {
        throw new Error("useError must be used within an ErrorContextProvider")
    }
    return context
}