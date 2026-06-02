import { useEffect } from "react";

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {

    useEffect(() => {
        if (!isOpen) return

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKey)
        
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    if (!isOpen) return null;
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={onClose}
            className="fixed flex bg-black/65 backdrop-blur-xs items-center justify-center inset-0 z-999">
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-hi border border-hi rounded-2xl p-8 w-80">

                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-avatar cursor-pointer">
                        AT
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-pri">Dr. Alan Turing</p>
                        <p className="text-xs font-mono text-sec">a.turing@flow.edu</p>
                    </div>
                </div>

                <p className="text-sm font-semibold text-pri mb-1.5">
                    Sign out of AcademicFlow?
                </p>
                <p className="text-xs text-sec leading-relaxed mb-5">
                    Your session will end. Any unsaved changes will be lost.
                </p>

                <div className="flex gap-2">
                    <button 
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-lg border border-dim text-sec text-sm hover:border-white/20 transition-colors">Cancel</button>

                    <button 
                    onClick={onConfirm}
                    className="flex-1 py-2.5 rounded-lg border border-accent-red/35 bg-accent-red/5 text-pri text-sm font-medium hover:bg-accent-red/10 transition-colors">Sign out</button>
                </div>
            </div>
        </div>
    )
}

export default LogoutModal