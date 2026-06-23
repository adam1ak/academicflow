import React, { useState, forwardRef } from "react"

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string
    label: string
    type?: "text" | "password" | "email" | "number"
    placeholder?: string
    hasError?: boolean
    labelClassName?: string
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ id, label, type = "text", placeholder, hasError, labelClassName, ...props }, ref) => {
        const [isPasswordVisible, setIsPasswordVisible] = useState(false)
        const isPasswordType = type === "password"
        const inputType = isPasswordType && isPasswordVisible ? "text" : type

        return (
            <div className="flex flex-col text-left mb-5">
                <label
                    htmlFor={id}
                    className={`${labelClassName || "af-label"} flex items-center justify-between`}
                >
                    <span>{label}</span>
                    {hasError && (
                        <span className="text-accent-red font-mono text-[8px] tracking-wide uppercase opacity-90">* required</span>
                    )}
                </label>

                <div className="relative">
                    <input
                        id={id}
                        type={inputType}
                        placeholder={placeholder}
                        ref={ref}
                        {...props}
                        className={`
                            ${hasError ? "input-af-error" : "input-af"}
                            ${isPasswordType ? "pr-10" : ""}
                        `}
                    />

                    {isPasswordType && (
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            className="
                                absolute right-4 top-1/2 -translate-y-1/2
                                text-text-muted hover:text-text-secondary
                                transition-colors
                            "
                            aria-label="Toggle password visibility"
                        >
                            {isPasswordVisible ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
        )
    }
)

InputField.displayName = "InputField"

export default InputField