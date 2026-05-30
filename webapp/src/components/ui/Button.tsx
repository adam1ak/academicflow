import { ReactNode } from "react"

interface ButtonProps {
    children: ReactNode
    type?: "button" | "submit" | "reset"
    onClick?: () => void
}

function Button({ children, type = "button", onClick } : ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            className="
                w-full py-3.5 bg-btn-blue hover:bg-btn-blue-hover
                text-white font-mono text-xs font-semibold tracking-widest uppercase
                rounded-md border-none 
                transition-all duration-150 active:scale-95
            "
        >
            {children}
        </button>
    )
}

export default Button