import React, { useEffect } from "react"

interface ModalOverlayProps {
    onClose: () => void
    children: React.ReactNode
    className?: string
    ariaLabel?: string
}

export default function ModalOverlay({ onClose, children, className = "", ariaLabel }: ModalOverlayProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose])

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            onClick={onClose}
            className="modal-overlay"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`modal-container ${className}`}
            >
                {children}
            </div>
        </div>
    )
}
