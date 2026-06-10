import { useRef, useState } from "react";
import { useFullscreen } from "../../../hooks/useFullscreen";
import { FullscreenIcon, ExitFullscreenIcon } from "../../ui/FullscreenIcons";
import AddSubjectModal from "../../ui/AddSubjectModal";
import { useStatusStyles } from "../../../hooks/useStatusStyles";

export function DAGPanel() {
  const dagRef = useRef<HTMLElement>(null)
  const { isFullscreen, toggle } = useFullscreen(dagRef)

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const { getStyles } = useStatusStyles()

  return (
    <>
      {isModalOpen && <AddSubjectModal onClose={() => setIsModalOpen(false)} />}

      <section ref={dagRef} className={`flex-1 min-w-0 bg-bg border border-dim rounded-xl flex flex-col justify-between overflow-hidden ${isFullscreen ? "panel-full-screen" : ""}`}>
        <header className="flex items-center justify-between p-3.5 border-b border-dim bg-surface shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-pri tracking-tight">Topic Dependency Graph</h2>
            <p className="font-mono text-[10px] text-sec mt-0.5">Tap a node to explore</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${getStyles("completed").dot}`} />
                <span className="font-mono text-[10px] text-sec">Completed</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${getStyles("ready").dot}`} />
                <span className="font-mono text-[10px] text-sec">Ready</span>
              </div>

              <div className="flex items-center gap-1.5">
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
              onClick={toggle}
              className="border border-dim rounded-md text-sec text-sm px-2 py-1 hover:bg-white/5 transition-colors leading-none ">
              {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </button>
          </div>
        </header>
        <div className="h-50">
          <div className="sm:hidden mx-4 mt-2 px-3 py-2 rounded-lg flex items-center gap-2.5 cursor-pointer bg-hint-bg border border-hint-border">
            <span>↺</span>

            <span className="text-xs flex-1 leading-snug text-hint-text ">Best viewed in fullscreen landscape. Tap ⛶ or rotate your phone.</span>

            <span className="text-xs text-sec">✕</span>
          </div>

          <div>
            {/* place for dag panel */}
          </div>
        </div>
      </section>
    </>
  );
}
