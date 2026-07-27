import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePlan } from "../../context/PlanContext";
import { exportPlanICS, exportPlanPDF, downloadBlob } from "../../api/plans";

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {

    const { user } = useAuth()
    const { activePlan } = usePlan()
    const [isExporting, setIsExporting] = useState<boolean>(false)

    useEffect(() => {
        if (!isOpen) return

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKey)

        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    if (!isOpen) return null;

    const handleExportICS = async () => {
        if (!activePlan) return
        try {
            setIsExporting(true)
            const blob = await exportPlanICS(activePlan.id)
            downloadBlob(blob, `plan_${activePlan.id}.ics`)
        } catch (err) {
            console.error("Export ICS failed:", err)
        } finally {
            setIsExporting(false)
        }
    }

    const handleExportPDF = async () => {
        if (!activePlan) return
        try {
            setIsExporting(true)
            const blob = await exportPlanPDF(activePlan.id)
            downloadBlob(blob, `plan_${activePlan.id}.pdf`)
        } catch (err) {
            console.error("Export PDF failed:", err)
        } finally {
            setIsExporting(false)
        }
    }

    const modalInitials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
        : user?.email?.slice(0, 2).toUpperCase() || "??";

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
                        {modalInitials}
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-pri">{user?.name || "John Doe"}</p>
                        <p className="text-xs font-mono text-sec">{user?.email || "email@email.com"}</p>
                    </div>
                </div>

                {activePlan && (
                    <div className="mb-5 pt-4 border-t border-dim space-y-2">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-sec mb-2">Export Data</p>
                        <button
                            type="button"
                            disabled={isExporting}
                            onClick={handleExportICS}
                            className="w-full py-2 px-3 rounded-lg border border-dim text-pri text-xs font-mono hover:bg-white/5 transition-colors flex items-center justify-between disabled:opacity-50">
                            <span>Export to iCal (.ics)</span>
                        </button>
                        <button
                            type="button"
                            disabled={isExporting}
                            onClick={handleExportPDF}
                            className="w-full py-2 px-3 rounded-lg border border-dim text-pri text-xs font-mono hover:bg-white/5 transition-colors flex items-center justify-between disabled:opacity-50">
                            <span>Download PDF Report</span>
                        </button>
                    </div>
                )}

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