import { useRef, useState } from "react";
import { useFullscreen } from "../../../hooks/useFullscreen";
import { FullscreenIcon, ExitFullscreenIcon } from "../../ui/FullscreenIcons";
import AddSubjectModal from "../../plan/AddSubjectModal";
import { useStatusStyles } from "../../../hooks/useStatusStyles";
import DAGRender, { DAGRendererRef } from "./DAGRenderer";

export function DAGPanel() {
  const dagRef = useRef<HTMLElement>(null)
  const rendererRef = useRef<DAGRendererRef>(null)
  const { isFullscreen, toggle } = useFullscreen(dagRef)

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [hoveredLegendStatus, setHoveredLegendStatus] = useState<"completed" | "ready" | "blocked" | null>(null)

  const { getStyles } = useStatusStyles()

  return (
    <>
      {isModalOpen && <AddSubjectModal onClose={() => setIsModalOpen(false)} />}

      <section ref={dagRef} className={`min-w-0 bg-bg border border-dim rounded-xl flex flex-col justify-between overflow-hidden ${isFullscreen ? "panel-full-screen" : "h-[450px] shrink-0"}`}>
        <header className="flex items-center justify-between p-3.5 border-b border-dim bg-surface shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-pri tracking-tight">Topic Dependency Graph</h2>
            <p className="font-mono text-[10px] text-sec mt-0.5">Tap a node to explore</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="hidden md:flex items-center gap-4">
              <div 
                onMouseEnter={() => setHoveredLegendStatus("completed")}
                onMouseLeave={() => setHoveredLegendStatus(null)}
                className="flex items-center gap-1.5 cursor-pointer transition-all hover:brightness-125 select-none"
              >
                <div className={`w-2 h-2 rounded-full ${getStyles("completed").dot}`} />
                <span className="font-mono text-[10px] text-sec">Completed</span>
              </div>

              <div 
                onMouseEnter={() => setHoveredLegendStatus("ready")}
                onMouseLeave={() => setHoveredLegendStatus(null)}
                className="flex items-center gap-1.5 cursor-pointer transition-all hover:brightness-125 select-none"
              >
                <div className={`w-2 h-2 rounded-full ${getStyles("ready").dot}`} />
                <span className="font-mono text-[10px] text-sec">Ready</span>
              </div>

              <div 
                onMouseEnter={() => setHoveredLegendStatus("blocked")}
                onMouseLeave={() => setHoveredLegendStatus(null)}
                className="flex items-center gap-1.5 cursor-pointer transition-all hover:brightness-125 select-none"
              >
                <div className={`w-2 h-2 rounded-full ${getStyles("blocked").dot}`}/>
                <span className="font-mono text-[10px] text-sec">Blocked</span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 border border-accent-blue/45 bg-accent-blue/12 text-blue-soft hover:bg-accent-blue/22 transition-all font-mono rounded-md px-2.5 py-1 text-[11px] font-medium leading-none">
              <span className="text-sm leading-1">
                +
              </span>
              Add subject
            </button>

            <button
              onClick={() => rendererRef.current?.exportPNG()}
              className="border border-dim rounded-md text-sec text-sm px-2 py-1 hover:bg-white/5 transition-colors leading-none"
              title="Export as PNG"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>

            <button
              onClick={toggle}
              className="border border-dim rounded-md text-sec text-sm px-2 py-1 hover:bg-white/5 transition-colors leading-none ">
              {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </button>
          </div>
        </header>
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="sm:hidden mx-4 mt-2 px-3 py-2 rounded-lg flex items-center gap-2.5 cursor-pointer bg-hint-bg border border-hint-border">
            <span>↺</span>

            <span className="text-xs flex-1 leading-snug text-hint-text ">Best viewed in fullscreen landscape. Tap ⛶ or rotate your phone.</span>

            <span className="text-xs text-sec">✕</span>
          </div>

          <DAGRender 
            ref={rendererRef}
            isFullscreen={isFullscreen} 
            hoveredLegendStatus={hoveredLegendStatus} 
          />
        </div>
      </section>
    </>
  );
}
