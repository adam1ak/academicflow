import React, { useState } from "react"

interface InputFieldProps {
    id: string
    label: string
    type?: "text" | "password" | "email" | "number"
    placeholder?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
}
function InputField({ id, label, type = "text", placeholder, value, onChange, required } : InputFieldProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const isPasswordType = type === "password"
    const inputType = isPasswordType && isPasswordVisible ? "text" : type

    return (
        <div
            className="
                flex flex-col text-left mb-5
            "
        >
            <label
                htmlFor={id}
                className="
                    font-mono text-xs text-text-secondary uppercase tracking-widest mb-1.5
                "
            >
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`
                    w-full bg-input-bg border border-input-border
                    text-text-primary px-3.5 py-2.5 rounded-sm
                    font-mono text-sm
                    focus:outline-none focus:border-input-focus
                    transition-colors duration-150
                    ${isPasswordType ? "pr-10" : ""}
                `}
                />

                {isPasswordType && (
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="
                            cursor-pointer
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

export default InputField