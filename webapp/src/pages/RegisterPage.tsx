import { Link, useNavigate } from "react-router-dom"
import { register as registerUserApi, login } from "../api/auth"

import { useAuth } from "../context/AuthContext"
import { useError } from "../context/ErrorContext"
import Header from "../components/layout/Header"
import InputField from "../components/ui/InputField"
import Button from "../components/ui/Button"
import OAuthButton from "../components/ui/OAuthButton"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/\d/, "Password must contain at least one digit (0-9)")
        .regex(/[!@#$%^&*(),.?":{}|<>_+-]/, "Password must contain at least one special character"),
    name: z.string()
        .min(1, "Full name is required")
        .max(100, "Name is too long")
})

type RegisterFormData = z.infer<typeof registerSchema>

function RegisterPage() {
    const navigate = useNavigate()
    const { setIsLogged, refreshUser } = useAuth()
    const { showError } = useError()

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    })

    const handleRegister = async (data: RegisterFormData) => {
        const { email, password, name } = data

        try {
            await registerUserApi(email, password, name)
            await login(email, password)
            await refreshUser()
            setIsLogged(true)

            navigate('/dashboard')
        } catch (error: any) {
            const errorMsg = error?.response?.data?.detail

            if (Array.isArray(errorMsg)) {
                showError(errorMsg[0]?.msg || "Registration failed")
            } else {
                showError(errorMsg || "Registration failed")
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-bg transition-colors">
            <div className="shrink-0 px-4 py-2 sm:px-8 sm:py-3 border-b border-card-border/50">
                <Header />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center w-full px-4 py-2 sm:px-6">
                <div className="w-full max-w-sm px-6 py-4 sm:px-8 sm:py-5 bg-card-bg border border-card-border rounded-xl shadow-lg">
                    <div className="mb-3">
                        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-text-primary mb-1">
                            Create your account
                        </h1>
                        <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                            Precision learning systems for modern engineering
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 mb-3">
                        <OAuthButton
                            provider="github"
                            login={false}
                            onClick={() => showError("OAuth sign-up is not configured yet")} />
                        <OAuthButton
                            provider="google"
                            login={false}
                            onClick={() => showError("OAuth sign-up is not configured yet")} />
                    </div>

                    <div className="flex items-center gap-3 mb-3" aria-hidden="true">
                        <div className="flex-1 h-px bg-card-border"></div>
                        <span className="font-mono text-xs tracking-widest text-text-muted uppercase">OR</span>
                        <div className="flex-1 h-px bg-card-border"></div>
                    </div>

                    <form onSubmit={handleSubmit(handleRegister)} className="flex flex-col">
                        <InputField
                            id="register-email"
                            label="Email Address"
                            type="email"
                            placeholder="a.turing@flow.edu"
                            {...register("email")}
                        />
                        {errors.email && <span className="text-red-500 text-xs mb-2 -mt-1 font-mono">{errors.email.message}</span>}

                        <InputField
                            id="register-name"
                            label="Username"
                            type="text"
                            placeholder="Alan turing"
                            {...register("name")}
                        />
                        {errors.name && <span className="text-red-500 text-xs mb-2 -mt-1 font-mono">{errors.name.message}</span>}

                        <InputField
                            id="register-password"
                            label="Password"
                            type="password"
                            placeholder="* * * * * * *"
                            {...register("password")}
                        />
                        {errors.password && <span className="text-red-500 text-xs mb-2 -mt-1 font-mono">{errors.password.message}</span>}

                        <div className="mt-1">
                            <Button type="submit">
                                Create Account
                            </Button>
                        </div>
                    </form>

                    <div className="mt-3.5 text-center text-xs sm:text-sm text-text-secondary">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="ml-1 text-text-primary font-semibold hover:text-link transition-colors"
                            aria-label="Log in to existing account">
                            Log in
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

export default RegisterPage
