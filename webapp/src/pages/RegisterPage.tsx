import { Link, useNavigate } from "react-router-dom"
import { register as registerUserApi, login } from "../api/auth"

import { useAuth } from "../context/AuthContext"
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
        .regex(/[!@#$%^&*(),.?":{}|<>_+-]/, "Password must contain at least one special character")
})

type RegisterFormData = z.infer<typeof registerSchema>

function RegisterPage() {
    const navigate = useNavigate()
    const { setIsLogged } = useAuth()

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    })

    const handleRegister = async (data: RegisterFormData) => {
        const { email, password } = data

        try {
            await registerUserApi(email, password)
            await login(email, password)
            setIsLogged(true)

            console.log("Account created successfully.")
            navigate('/dashboard')
        } catch (error) {
            console.log("Registration error: ", error)
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
                            Create your account
                        </h1>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            Precision learning systems for modern engineering
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 mb-6">
                        <OAuthButton
                            provider="github"
                            login={false}
                            onClick={() => console.log('github')} />
                        <OAuthButton
                            provider="google"
                            login={false}
                            onClick={() => console.log('google')} />
                    </div>

                    <div className="flex items-center gap-3 mb-6" aria-hidden="true">
                        <div className="flex-1 h-px bg-card-border"></div>
                        <span className="font-mono text-sm tracking-widest text-text-muted uppercase">OR</span>
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
                        {errors.email && <span className="text-red-500 text-xs mb-3 -mt-1 font-mono">{errors.email.message}</span>}

                        <InputField
                            id="register-password"
                            label="Password"
                            type="password"
                            placeholder="* * * * * * *"
                            {...register("password")}
                        />
                        {errors.password && <span className="text-red-500 text-xs mb-3 -mt-1 font-mono">{errors.password.message}</span>}

                        <div className="mt-2">
                            <Button type="submit">
                                Create Account
                            </Button>
                        </div>
                    </form>

                    <div
                        className="
                            mt-8 text-center text-sm text-text-secondary
                        "
                    >
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

export default RegisterPage