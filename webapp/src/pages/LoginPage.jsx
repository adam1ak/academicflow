import { useState } from 'react'
import { login } from '../services/auth'
import { useNavigate } from 'react-router-dom'

function LoginPage({ setIsLogged }) {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e) => {
        e.preventDefault()

        try {
            await login(email, password)
            setIsLogged(true)

            navigate('/dashboard')
        } catch (e) {
            console.log("Login error: ", e)
        }

    }


    return (
        <div>
            <h1>Logic tests</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default LoginPage
