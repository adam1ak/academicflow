import React, { useEffect } from "react"

interface ModalOverlayProps {
    onClose: () => void
    children: React.ReactNode
    className?: string
}

export default function ModalOverlay({ onClose, children, className = "" }: ModalOverlayProps) {
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
