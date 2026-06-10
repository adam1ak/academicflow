import { useEffect } from "react";
import DependentsSelect from "./DependentsSelect"
import GanttPreviewBar from "./GanttPreviewBar"

function AddSubjectModal({ onClose }: { onClose: () => void }) {

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            className="flex items-center justify-center p-4 fixed inset-0 z-99 bg-black/65 backdrop-blur-xs">
            <div 
            onClick={(e) => e.stopPropagation()}
            className="h-full max-h-[650px] flex flex-col bg-surface-hi border border-hi rounded-2xl max-w-full w-[420px]">
                <div className="flex items-start justify-between border-b border-dim shrink-0 px-6 p-4">
                    <div>
                        <p className="text-sm tracking-tight text-slate-100 font-semibold">Add Subject</p>
                        <p className="font-mono text-[10px] text-sec">New node · dependency graph
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center text-sec hover:text-pri leading-none transition-colors cursor-pointer"
                    >✕</button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pt-6 space-y-4">
                    <div className="flex gap-3">
                        <div className="flex flex-col flex-1">
                            <label className="af-label">subject name</label>
                            <input
                                className="input-af"
                                placeholder="e.g. Algorithms"
                            />
                        </div>

                        <div className="flex flex-col flex-1">
                            <label className="af-label">classroom</label>
                            <input
                                className="input-af"
                                placeholder="e.g. Room 452"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="af-label">Field </label>
                        <input
                            className="input-af"
                            placeholder="e.g. Algorithms"
                        />
                    </div>

                    <div className="flex flex-col">
                        <p className="af-label">Semestr timeline</p>

                        <div className="flex gap-3">
                            <div className="flex flex-col flex-1">
                                <label className="font-mono text-mut text-[9px] mb-1.5">Start Week (1–12)</label>
                                <input
                                    className="input-af"
                                    placeholder="1"
                                    type="number"
                                    min={1}
                                    max={12}
                                />
                            </div>

                            <div className="flex flex-col flex-1">
                                <label className="font-mono text-mut text-[9px] mb-1.5">Duration (weeks)</label>
                                <input
                                    className="input-af"
                                    placeholder="1"
                                    type="number"
                                    min={1}
                                    max={12}
                                />
                            </div>
                        </div>

                        <GanttPreviewBar
                            start={1}
                            duration={3} />
                    </div>

                    <DependentsSelect />
                </div>

                <div className="flex font-sf border-t border-dim shrink-0 gap-2 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg border border-dim text-sec text-sm outline-none hover:border-white/20 hover:text-pri transition-colors cursor-pointer">
                        Cancel
                    </button>

                    <button
                        className="flex-1 py-2.5 rounded-lg border border-dim text-white text-sm font-semibold 
                        bg-btn-blue outline-none hover:bg-btn-blue-hover transition-colors cursor-pointer">
                        Add subject
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddSubjectModal