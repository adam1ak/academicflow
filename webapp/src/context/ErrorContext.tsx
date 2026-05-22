import { createContext, ReactNode, useContext, useState } from "react"

interface ErrorContextType {
    error: string | null
    showError: (message: string) => void
    cleanError: () => void
}

interface ErrorContextProviderProps {
    children: ReactNode
}

const ErrorContext = createContext<ErrorContextType | null>(null)

export const ErrorContextProvider = ({ children }: ErrorContextProviderProps) => {
    const [error, setError] = useState<string | null>(null)

    const showError = (message: string) => setError(message)
    const cleanError = () => setError(null)

    return (
        <ErrorContext.Provider
            value={{
                error,
                showError,
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