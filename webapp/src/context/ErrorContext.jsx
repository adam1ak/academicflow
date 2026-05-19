import { createContext, useContext, useState } from "react"

const ErrorContext = createContext()

export const ErrorContextProvider = ({ children }) => {
    const [error, setError] = useState(null)

    const showError = (message) => setError(message)
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
export const useError = () => useContext(ErrorContext)