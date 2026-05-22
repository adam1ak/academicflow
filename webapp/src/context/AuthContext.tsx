import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { verifySession } from "../api/auth";
import { tokenStorage } from "../services/tokenStorage";

export interface AuthContextType {
    isLogged: boolean;
    setIsLogged: (value: boolean) => void;
    isChecking: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
      const [isLogged, setIsLogged] = useState<boolean>(false)
      const [isChecking, setIsChecking] = useState<boolean>(true)
    
      useEffect(() => {
        const checkAuth = async () => {
          const token = tokenStorage.getAccessToken()
    
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
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}