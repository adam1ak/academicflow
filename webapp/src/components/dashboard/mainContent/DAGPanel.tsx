export function DAGPanel() {
  return (
    <section className="flex-1 min-w-0 bg-bg border border-border-dim rounded-xl flex flex-col justify-between overflow-hidden">
      <header className="flex items-center justify-between p-3.5 border-b border-border-dim bg-surface shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-text-pri tracking-tight">Topic Dependency Graph</h2>
          <p className="font-mono text-[10px] text-text-sec mt-0.5">Tap a node to explore</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-green"/>
              <span className="font-mono text-[10px] text-text-sec">Completed</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-blue"/>
              <span className="font-mono text-[10px] text-text-sec">Ready</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#3f3f46]"/>
              <span className="font-mono text-[10px] text-text-sec">Blocked</span>
            </div>
          </div>

          <button
            className="border border-border-dim rounded-md text-text-sec text-sm px-2 py-1 hover:bg-white/5 transition-colors leading-none ">
            ⛶
          </button>
        </div>
      </header>
      <div className="h-50">
        <div className="sm:hidden mx-4 mt-2 px-3 py-2 rounded-lg flex items-center gap-2.5 cursor-pointer bg-hint-bg border border-hint-border">
          <span>↺</span>

          <span className="text-xs flex-1 leading-snug text-hint-description ">Best viewed in fullscreen landscape. Tap ⛶ or rotate your phone.</span>
          
          <span className="text-xs text-text-sec">✕</span>
        </div>

        <div>
          {/* place for dag panel */}
        </div>
      </div>
    </section>
  );
}
