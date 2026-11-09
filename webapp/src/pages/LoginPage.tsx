import { login } from '../api/auth'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useError } from '../context/ErrorContext'
import Header from "../components/layout/Header"
import InputField from "../components/ui/InputField"
import Button from "../components/ui/Button"
import OAuthButton from "../components/ui/OAuthButton"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long")
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginPage() {
    const navigate = useNavigate()

    const { setIsLogged, refreshUser } = useAuth()
    const { showError } = useError()

    const { register, handleSubmit, formState: {errors} } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    })

    const handleLogin = async (data: LoginFormData) => {
        const { email, password } = data

        try {
            await login(email, password)
            await refreshUser()
            setIsLogged(true)

            navigate('/dashboard')
        } catch (e: any) {
            const errorMsg = e.response?.data?.detail
            showError(Array.isArray(errorMsg) ? errorMsg[0]?.msg : errorMsg || "Invalid credentials")
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-bg transition-colors">
            <div className="shrink-0 px-4 py-2 sm:px-8 sm:py-3 border-b border-card-border/50">
                <Header />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center w-full px-4 py-2 sm:px-6">
                <div className="w-full max-w-sm px-6 py-5 sm:px-8 sm:py-6 bg-card-bg border border-card-border rounded-xl shadow-lg">
                    <div className="mb-4">
                        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-text-primary mb-1">
                            Sign in To your account
                        </h1>
                        <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                            Precision learning systems for modern engineering
                        </p>
                    </div>

                    <div className="flex flex-col gap-2.5 mb-4">
                        <OAuthButton
                            provider="github"
                            login={true}
                            onClick={() => showError("OAuth login is not configured yet")} />
                        <OAuthButton
                            provider="google"
                            login={true}
                            onClick={() => showError("OAuth login is not configured yet")} />
                    </div>

                    <div className="flex items-center gap-3 mb-4" aria-hidden="true">
                        <div className="flex-1 h-px bg-card-border"></div>
                        <span className="font-mono text-xs tracking-widest text-text-muted uppercase">OR</span>
                        <div className="flex-1 h-px bg-card-border"></div>
                    </div>

                    <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col">
                        <InputField
                            id="login-email"
                            label="Email Address"
                            type="email"
                            placeholder="a.turing@flow.edu"
                            {...register("email")}
                        />
                        {errors.email && <span className="text-red-500 text-xs mb-2 -mt-1 font-mono">{errors.email.message}</span>}

                        <InputField
                            id="login-password"
                            label="Password"
                            type="password"
                            placeholder="* * * * * * *"
                            {...register("password")}
                        />
                        {errors.password && <span className="text-red-500 text-xs mb-2 -mt-1 font-mono">{errors.password.message}</span>}

                        <div className="flex justify-end mb-4 -mt-1">
                            <a
                                href="#"
                                className="font-mono text-xs text-link hover:text-white transition-colors tracking-wide"
                                aria-label="Recover forgotten password"
                            >
                                Forgot password?
                            </a>
                        </div>

                        <Button type="submit">
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-xs sm:text-sm text-text-secondary">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="ml-1 text-text-primary font-semibold hover:text-link transition-colors"
                            aria-label="Sign up for a new account">
                            Sign up
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="shrink-0 w-full px-4 py-2.5 text-xs text-text-muted text-center border-t border-card-border/50 font-mono">
                <p>© 2026 AcademicFlow. Precision learning System.</p>
            </footer>
        </div>
    )
}

export default LoginPage
