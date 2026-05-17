import { createContext, useContext, useState, useEffect } from "react"
import { verifySession } from "../services/auth"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
      const [isLogged, setIsLogged] = useState(false)
      const [isChecking, setIsChecking] = useState(true)
    
      useEffect(() => {
        const checkAuth = async () => {
          const token = localStorage.getItem('token')
    
          if (!token) {
            setIsChecking(false)
            return
          }
    
          try {
            await verifySession()
            setIsLogged(true)
          } catch (error) {
            console.error("Token invalid or expired: ", error)
    
            setIsLogged(false)
          } finally {
            setIsChecking(false)
          }
        }
    
        checkAuth()
      }, [])

      return (
        <AuthContext.Provider
            value={{
                isLogged,
                setIsLogged,
                isChecking
            }}>
            {children}
        </AuthContext.Provider>
      )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)