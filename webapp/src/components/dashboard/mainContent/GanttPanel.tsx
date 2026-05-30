export function GanttPanel() {
  return (
    <section className="bg-surface border border-border-dim rounded-xl overflow-hidden flex flex-col shrink-0 min-w-0">
      <header className="w-full flex flex-col items-start flex-wrap sm:flex-nowrap sm:flex-row sm:items-center sm:justify-between p-3.5 border-b border-border-dim bg-surface shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-text-pri tracking-tight">Semester Timeline</h2>
          <p className="font-mono text-[10px] text-text-sec mt-0.5">Weeks 1–12 · Fall 2024 · 17 credits</p>
        </div>

        <div className=" flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-xs bg-accent-blue" />
              <span className="font-mono text-[10px] text-text-sec">Active</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-xs bg-[#3f3f46]" />
              <span className="font-mono text-[10px] text-text-sec">Upcoming</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-xs bg-accent-amber" />
              <span className="font-mono text-[10px] text-text-sec">Assignment</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-xs bg-accent-red" />
              <span className="font-mono text-[10px] text-text-sec">Exam</span>
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

          <span className="text-xs flex-1 leading-snug text-hint-description ">Scroll horizontally to see all 12 weeks.</span>

          <span className="text-xs text-text-sec">✕</span>
        </div>

        <div>
          {/* place for gantt panel */}
        </div>
      </div>
    </section>
  );
}
