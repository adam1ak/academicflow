import ModalOverlay from "./ModalOverlay"

interface ConfirmDeleteModalProps {
    isOpen: boolean
    title: string
    description: string
    itemName?: string
    isDeleting?: boolean
    onClose: () => void
    onConfirm: () => void
}

export default function ConfirmDeleteModal({
    isOpen,
    title,
    description,
    itemName,
    isDeleting = false,
    onClose,
    onConfirm
}: ConfirmDeleteModalProps) {
    if (!isOpen) return null

    return (
        <ModalOverlay onClose={onClose} ariaLabel={title} className="max-w-[400px]">
            <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-red/15 border border-accent-red/30 flex items-center justify-center text-accent-red shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
                        <p className="font-mono text-[10px] text-sec">Permanent action - cannot be undone</p>
                    </div>
                </div>

                <div className="bg-dim/30 border border-dim/60 rounded-xl p-3.5 space-y-1">
                    <p className="text-xs text-sec leading-relaxed">
                        {description}
                    </p>
                    {itemName && (
                        <p className="text-xs font-semibold text-slate-200 font-mono pt-1 truncate">
                            "{itemName}"
                        </p>
                    )}
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 py-2.5 rounded-lg border border-dim text-sec text-sm hover:border-white/20 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 py-2.5 rounded-lg border border-accent-red/40 bg-accent-red/15 text-accent-red hover:bg-accent-red/25 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isDeleting ? "Deleting..." : "Delete Plan"}
                    </button>
                </div>
            </div>
        </ModalOverlay>
    )
}
