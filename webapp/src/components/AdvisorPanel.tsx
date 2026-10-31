import { useState, useRef } from "react"
import { useAdvisor } from "../context/AdvisorContext"
import { AdvisorChat } from "./AdvisorChat"

export function AdvisorPanel() {
    const { isOpen, closeAdvisor } = useAdvisor()
    const [desktopWidth, setDesktopWidth] = useState<number>(340)
    const isDraggingRef = useRef<boolean>(false)

    const [mobileHeight, setMobileHeight] = useState<number>(75)
    const touchStartYRef = useRef<number>(0)
    const touchStartHeightRef = useRef<number>(75)

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        isDraggingRef.current = true

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (!isDraggingRef.current) return

            const newWidth = window.innerWidth - moveEvent.clientX

            if (newWidth >= 280 && newWidth <= 600) {
                setDesktopWidth(newWidth)
            }
        }

        const onMouseUp = () => {
            isDraggingRef.current = false
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
        }

        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartYRef.current = e.touches[0].clientY
        touchStartHeightRef.current = mobileHeight

        const onTouchMove = (moveEvent: TouchEvent) => {
            const deltaY = touchStartYRef.current - moveEvent.touches[0].clientY
            const deltaVh = (deltaY / window.innerHeight) * 100
            const newHeight = touchStartHeightRef.current + deltaVh

            if (newHeight >= 35 && newHeight <= 92) {
                setMobileHeight(newHeight)
            }
        }

        const onTouchEnd = (endEvent: TouchEvent) => {
            const finalDeltaY = endEvent.changedTouches[0].clientY - touchStartYRef.current
            if (finalDeltaY > 150) {
                closeAdvisor()
                setMobileHeight(75)
            }
            window.removeEventListener("touchmove", onTouchMove)
            window.removeEventListener("touchend", onTouchEnd)
        }

        window.addEventListener("touchmove", onTouchMove)
        window.addEventListener("touchend", onTouchEnd)
    }

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                onClick={closeAdvisor}
                aria-hidden="true"
            />

            <aside 
                style={{ height: `${mobileHeight}vh` }}
                className="fixed inset-x-0 bottom-0 z-50 bg-surface-hi border-t border-dim rounded-t-2xl flex flex-col p-4 shadow-2xl lg:hidden"
            >
                <div
                    onTouchStart={handleTouchStart}
                    className="w-full py-2 -mt-2 mb-2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
                >
                    <div className="w-8 h-[3px] bg-white/20 rounded-full" />
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-dim">
                    <h2 className="text-xs font-mono font-medium text-pri">Academic Advisor</h2>
                    <button
                        type="button"
                        onClick={closeAdvisor}
                        className="text-sec hover:text-pri w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 cursor-pointer transition-colors"
                        aria-label="Close advisor"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 min-h-0">
                    <AdvisorChat />
                </div>
            </aside>

            <aside 
                style={{ width: `${desktopWidth}px` }}
                className="hidden lg:flex relative bg-surface-hi border border-dim rounded-md flex-col p-3 shrink-0 h-full"
            >
                <div
                    onMouseDown={handleMouseDown}
                    className="group absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center hover:bg-white/5 transition-colors"
                    title="Drag to resize"
                >
                    <div className="w-3.5 h-7 bg-surface-hi border border-dim rounded-full flex items-center justify-center shadow-sm group-hover:border-sec transition-colors pointer-events-none">
                        <svg className="w-2 h-3 text-sec group-hover:text-pri transition-colors" viewBox="0 0 6 10" fill="currentColor">
                            <circle cx="1.5" cy="2" r="1" />
                            <circle cx="4.5" cy="2" r="1" />
                            <circle cx="1.5" cy="5" r="1" />
                            <circle cx="4.5" cy="5" r="1" />
                            <circle cx="1.5" cy="8" r="1" />
                            <circle cx="4.5" cy="8" r="1" />
                        </svg>
                    </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-dim">
                    <h2 className="text-xs font-mono font-medium text-pri">Academic Advisor</h2>
                    <button
                        type="button"
                        onClick={closeAdvisor}
                        className="text-sec hover:text-pri w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 cursor-pointer transition-colors"
                        aria-label="Close advisor"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 min-h-0">
                    <AdvisorChat />
                </div>
            </aside>
        </>
    )
}
