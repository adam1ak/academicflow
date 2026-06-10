import { useStatusStyles, PillVariant } from "../../../hooks/useStatusStyles"

interface DeadlineCardProps {
    type: Exclude<PillVariant, "ready" | "blocked" | "completed">
    title: string
    date: string
    classroom: string
    isFirst?: boolean
}

function DeadlineCard({ type, title, date, classroom, isFirst }: DeadlineCardProps) {
    const { getStyles } = useStatusStyles()
    const styles = getStyles(type)
    const separatorClasses = !isFirst ? "border-t mt-2 pt-2 border-[rgba(255,255,255,0.04)]" : ""

    return (
        <div className={`flex items-center gap-2.5 ${separatorClasses}`}>
            <div className={`flex shrink-0 flex-col justify-center items-center rounded-lg ${styles.bgColor} w-10 h-10 border ${styles.bgBorder}`}>
                <span className={`font-mono uppercase tracking-widest text-[8px] ${styles.text}`}>{date}</span>
                <span className={`font-bold leading-tight text-sm ${styles.text}`}>11</span>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-pri mb-0.5 truncate">{title}</span>

                <div className="flex gap-2 items-center">
                    <span className="font-mono text-mut text-[9px] truncate">{classroom}</span>
                    <span className={`font-mono rounded text-[8px] ${styles.typeBg} ${styles.text} px-1.5 py-0.5 border ${styles.bgBorder}`}>
                        {type}
                    </span>
                </div>

                <span className="font-mono text-mut text-[9px] mt-0.5">x days</span>
            </div>
        </div>
    )
}

export default DeadlineCard