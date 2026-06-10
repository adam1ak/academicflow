interface PreviewProps {
    start: number
    duration: number
}

function GanttPreviewBar({ start, duration }: PreviewProps) {

    const leftPercent = ((start - 1) / 12) * 100;
    const widthPercent = (duration / 12) * 100;

    return (
        <div className="bg-[#0a0a0c] mt-2.5 rounded-md overflow-hidden border border-dim px-2 py-2.5">
            <p className="font-mono text-[9px] text-mut mb-1.5">Gantt Preview</p>

            <div className="relative h-4 rounded-sm bg-surface-progress overflow-hidden">
                <div className="absolute h-full top-0 bg-[#27272a] transition-all duration-300"
                    style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`
                    }} />
            </div>

            <div className="flex justify-between mt-1 font-mono text-[8px] text-mut">
                <p>W1</p>
                <p>W12</p>
            </div>
        </div>
    )
}

export default GanttPreviewBar