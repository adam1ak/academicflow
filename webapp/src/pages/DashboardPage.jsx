import { logout } from '../services/api'

function DashboardPage({ setIsLogged }) {
    const handleLogout = () => {
        logout()
        setIsLogged(false)
    }


    return (
        <div>
            <h1>Login succeed!</h1>
            <button onClick={handleLogout}>Log out</button>
        </div>
    )
}

export default DashboardPage
