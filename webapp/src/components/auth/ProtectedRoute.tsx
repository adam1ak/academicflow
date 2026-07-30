import { Navigate, Outlet } from 'react-router-dom' 
import { useAuth } from "../../context/AuthContext"

function ProtectedRoute() {
    const { isLogged } = useAuth()

    if  (!isLogged) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default ProtectedRoute