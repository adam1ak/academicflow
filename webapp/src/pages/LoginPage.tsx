import { useState } from 'react'
import { login } from '../services/auth'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import Header from "../components/ui/Header"
import InputField from "../components/ui/InputField"
import Button from "../components/ui/Button"
import OAuthButton from "../components/ui/OAuthButton"

function LoginPage() {
    const navigate = useNavigate()

    const { setIsLogged } = useAuth()

    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const handleLogin = async (e: React.FormEvent) => {
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
        <div
            className="
                min-h-screen flex flex-col justify-between
                bg-card-bg md:bg-bg transition-colors
            "
        >

            <div className="p-4 md:px-8 md:py-6 border-b border-card-border md:border-none">
                <Header />
            </div>

            <main
                className="
                    flex-1 flex flex-col justify-center items-center
                    w-full py-8 md:py-12  
                "
            >
                <div
                    className="
                        w-full max-w-sm md:px-8 md:py-8
                        md:bg-card-bg md:border md:border-card-border md:rounded-xl md:shadow-lg
                    "
                >
                    <div className="mb-8">
                        <h1
                            className="
                                text-xl md:text-2xl font-semibold tracking-tight text-text-primary mb-1
                            "
                        >
                            Sign in To your account
                        </h1>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            Precision learning systems for modern engineering
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 mb-6">
                        <OAuthButton
                            provider="github"
                            login={true}
                            onClick={() => console.log('github')} />
                        <OAuthButton
                            provider="google"
                            login={true}
                            onClick={() => console.log('google')} />
                    </div>

                    <div className="flex items-center gap-3 mb-6" aria-hidden="true">
                        <div className="flex-1 h-px bg-card-border"></div>
                        <span className="font-mono text-sm tracking-widest text-text-muted uppercase">OR</span>
                        <div className="flex-1 h-px bg-card-border"></div>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col">
                        <InputField
                            id="register-email"
                            label="Email Address"
                            type="email"
                            placeholder="a.turing@flow.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <InputField
                            id="register-password"
                            label="Password"
                            type="password"
                            placeholder="* * * * * * *"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div className="flex justify-end mb-6 -mt-2">
                            <a
                                href="#"
                                className="
                                    font-mono text-xs text-link 
                                    hover:text-white transition-colors tracking-wide
                                "
                                aria-label="Recover forgotten password"
                            >
                                Forgot password?
                            </a>
                        </div>

                        <Button type="submit">
                            Sign In
                        </Button>
                    </form>

                    <div
                        className="
                            mt-8 text-center text-sm text-text-secondary
                        "
                    >
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="ml-1 text-text-primary font-semibold hover:text-link transition-colors"
                            aria-label="Sign up to existing account">
                            Sign up
                        </Link>
                    </div>
                </div>
            </main>

            <footer
                className="
                    w-full px-4 py-6 md:px-8 md:py-6 
                    text-xs text-text-muted text-center
                    border-t border-card-border font-mono
                "
            >
                <p>© 2026 AcademicFlow. Precision learning System.</p>
            </footer>
        </div>
    )
}

export default LoginPage
