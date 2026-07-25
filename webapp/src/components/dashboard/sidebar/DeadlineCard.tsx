import { useStatusStyles, PillVariant } from "../../../hooks/useStatusStyles"
import { DeadlineType } from "../../../types/deadline"

interface DeadlineCardProps {
    type: DeadlineType
    title: string
    due_date: string
    classroom: string | null
    isFirst?: boolean
}

function DeadlineCard({ type, title, due_date, classroom, isFirst }: DeadlineCardProps) {
    const { getStyles } = useStatusStyles()
    const styles = getStyles(type as PillVariant)
    const separatorClasses = !isFirst ? "border-t mt-2 pt-2 border-[rgba(255,255,255,0.04)]" : ""

    const dateObj = new Date(due_date)
    const monthShort = isNaN(dateObj.getTime()) ? "DUE" : dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    const dayNum = isNaN(dateObj.getTime()) ?  new Date().getDate() + 5  : dateObj.getDate()

    const today = new Date()

    const targetDate = new Date(dateObj)

    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let daysLeftText = `${diffDays} days left`
    if (isNaN(diffDays)) daysLeftText = "5 days left"
    if (diffDays === 0) daysLeftText = "Today"
    if (diffDays === 1) daysLeftText = "Tomorrow"
    if (diffTime < 0) daysLeftText = "Overdue"

    if (diffTime > 0 && diffTime <= 48 * 60 * 60 * 1000) {
        const totalMinutes = Math.ceil(diffTime / (60 * 1000))
        
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60

        daysLeftText = `${hours}h and ${minutes}min left`
    }

    return (
        <div className={`flex items-center gap-2.5 ${separatorClasses}`}>
            <div className={`flex shrink-0 flex-col justify-center items-center rounded-lg ${styles.bgColor} w-10 h-10 border ${styles.bgBorder}`}>
                <span className={`font-mono uppercase tracking-widest text-[8px] ${styles.text}`}>{monthShort}</span>
                <span className={`font-bold leading-tight text-sm ${styles.text}`}>{dayNum}</span>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-pri mb-0.5 truncate">{title || "ML assignment"}</span>

                <div className="flex gap-2 items-center">
                    <span className="font-mono text-mut text-[9px] truncate">{classroom || "C402"}</span>
                    <span className={`font-mono rounded text-[8px] ${styles.typeBg} ${styles.text} px-1.5 py-0.5 border ${styles.bgBorder}`}>
                        {type}
                    </span>
                </div>

                <span className="font-mono text-mut text-[9px] mt-0.5">{daysLeftText}</span>
            </div>
        </div>
    )
}

export default DeadlineCard