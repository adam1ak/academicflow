import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { verifySession } from "../api/auth";
import { tokenStorage } from "../services/tokenStorage";

export interface AuthUser {
  name: string
  email: string
}

export interface AuthContextType {
    isLogged: boolean
    setIsLogged: (value: boolean) => void
    isChecking: boolean
    user: AuthUser | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
      const [isLogged, setIsLogged] = useState<boolean>(false)
      const [isChecking, setIsChecking] = useState<boolean>(true)
      const [user, setUser] = useState<AuthUser | null>(null)
    
      useEffect(() => {
        const checkAuth = async () => {
          const token = tokenStorage.getAccessToken()
    
          if (!token) {
            setIsChecking(false)
            return
          }
    
          try {
            const data = await verifySession()
            
            setUser({
              name: data.name || "",
              email: data.user
            })
            setIsLogged(true)
          } catch (error) {
            console.error("Token invalid or expired: ", error)
    
            setIsLogged(false)
          } finally {
            setIsChecking(false)
          }
        }
    
        checkAuth()
      }, [isLogged])

      return (
        <AuthContext.Provider
            value={{
                isLogged,
                setIsLogged,
                isChecking,
                user
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