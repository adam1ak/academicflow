import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { register, login } from "../services/auth"

import { useAuth } from "../context/AuthContext"

function RegisterPage() {
    const navigate = useNavigate()
    const { setIsLogged } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleRegister = async (e) => {
        e.preventDefault()

        try {
            await register(email, password)
            await login(email, password)

            setIsLogged(true)

            console.log("Account created successfully.")
            navigate('/dashboard')

        } catch (error) {
            console.log("Registration error: ", error)
        }
    }

    return (
        <div>
            <h1>Create Account</h1>
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Sign Up</button>
            </form>
            <div style={{ marginTop: '20px' }}>
                <Link to="/login">Already have an account? Login here.</Link>
            </div>
        </div>
    )
}

export default RegisterPage