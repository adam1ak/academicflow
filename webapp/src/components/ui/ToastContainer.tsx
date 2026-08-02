import { useState, useCallback } from "react"
import { useError, ToastMessage } from "../../context/ErrorContext"

const toastVariants = {
    info: {
        text: "text-accent-blue font-semibold",
        bg: "bg-[rgba(74,126,255,0.12)]",
        border: "border-[rgba(74,126,255,0.25)]",
        strokeColor: "rgba(74,126,255,0.55)",
        icon: (
            <svg className="w-4 h-4 text-accent-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    success: {
        text: "text-accent-green font-semibold",
        bg: "bg-[rgba(34,197,94,0.12)]",
        border: "border-[rgba(34,197,94,0.25)]",
        strokeColor: "rgba(34,197,94,0.55)",
        icon: (
            <svg className="w-4 h-4 text-accent-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    warning: {
        text: "text-accent-amber font-semibold",
        bg: "bg-[rgba(245,158,11,0.12)]",
        border: "border-[rgba(245,158,11,0.25)]",
        strokeColor: "rgba(245,158,11,0.55)",
        icon: (
            <svg className="w-4 h-4 text-accent-amber shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    error: {
        text: "text-accent-red font-semibold",
        bg: "bg-[rgba(239,68,68,0.12)]",
        border: "border-[rgba(239,68,68,0.25)]",
        strokeColor: "rgba(239,68,68,0.55)",
        icon: (
            <svg className="w-4 h-4 text-accent-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
    const [isExiting, setIsExiting] = useState(false)
    const styles = toastVariants[toast.type] || toastVariants.error

    const handleDismiss = useCallback(() => {
        if (isExiting) return
        setIsExiting(true)
        setTimeout(() => {
            onDismiss()
        }, 280)
    }, [isExiting, onDismiss])

    return (
        <div
            role="status"
            aria-live="polite"
            onClick={handleDismiss}
            title="Click to dismiss"
            className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border ${styles.bg} ${styles.border} backdrop-blur-md shadow-xl transition-all duration-200 hover:brightness-125 cursor-pointer max-w-sm w-full select-none overflow-hidden ${
                isExiting ? "animate-toast-out" : "animate-toast-in"
            }`}
        >
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <rect
                    x="0.5"
                    y="0.5"
                    width="calc(100% - 1px)"
                    height="calc(100% - 1px)"
                    rx="7"
                    fill="none"
                    stroke={styles.strokeColor}
                    strokeWidth="1.5"
                    pathLength="1000"
                    className="toast-progress-rect"
                    style={{ animationDuration: `${Math.max(200, (toast.duration || 4000) - 280)}ms` }}
                    onAnimationEnd={handleDismiss}
                />
            </svg>

            {styles.icon}
            <p className={`text-xs font-sf ${styles.text} flex-1 leading-snug truncate z-10`}>
                {toast.message}
            </p>
            <button
                type="button"
                aria-label="Dismiss notification"
                onClick={(e) => {
                    e.stopPropagation()
                    handleDismiss()
                }}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors leading-none pl-1 z-10 cursor-pointer"
            >
                ✕
            </button>
        </div>
    )
}

function ToastContainer() {
    const { toasts, removeToast } = useError()

    if (toasts.length === 0) return null

    return (
        <div 
            aria-label="Notifications"
            className="fixed top-4 right-4 z-50 flex flex-col gap-1.5 max-w-xs w-full pointer-events-auto"
        >
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onDismiss={() => removeToast(toast.id)}
                />
            ))}
        </div>
    )
}

export default ToastContainer
