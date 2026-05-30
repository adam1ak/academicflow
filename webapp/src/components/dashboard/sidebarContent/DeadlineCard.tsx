type DeadlineType = "assignment" | "exam" | "task" | "project"

interface DeadlineCardProps {
    type: DeadlineType,
    title: string;
    date: string;
    classroom: string;
    isFirst?: boolean;
}

const accentVariants = {
    assignment: {
        bgColor: "bg-[#f59e0b12]",
        bgBorder: "border-[#f59e0b33]",
        text: "text-[#f59e0b]",
        typeBg: "bg-[#f59e0b15]",
    },

    exam: {
        bgColor: "bg-[#ef444412]",
        bgBorder: "border-[#ef444433]",
        text: "text-[#ef4444]",
        typeBg: "bg-[#ef444415]",
    },

    task: {
        bgColor: "bg-[#3b82f612]",
        bgBorder: "border-[#3b82f633]",
        text: "text-[#3b82f6]",
        typeBg: "bg-[#3b82f615]",
    },

    project: {
        bgColor: "bg-[#a855f712]",
        bgBorder: "border-[#a855f733]",
        text: "text-[#a855f7]",
        typeBg: "bg-[#a855f715]",
    },
};

function DeadlineCard({ type, title, date, classroom, isFirst }: DeadlineCardProps) {

    const styles = accentVariants[type];
    const separatorClasses = !isFirst ? "border-t mt-2 pt-2 border-[rgba(255,255,255,0.04)]" : "" 

    return (
        <div className={`flex items-center gap-2.5 ${separatorClasses}`}>
            <div className={`flex shrink-0 flex-col justify-center items-center rounded-lg ${styles.bgColor} w-10 h-10 border ${styles.bgBorder}`}>
                <span className={`font-mono uppercase tracking-widest text-[8px] ${styles.text}`}>{date}</span>
                <span className={`font-bold leading-tight text-sm ${styles.text}`}>11</span>
            </div>

            <div className="flex flex-col">
                <span className="text-xs font-medium text-text-pri mb-0.5 whitespace-nowrap text-ellipsis">{title}</span>

                <div className="flex gap-2 items-center">
                    <span className="font-mono text-text-mut text-[9px]">{classroom}</span>
                    <span className={`font-mono rounded text-[8px] ${styles.typeBg} ${styles.text} px-1.5 py-0.5`}>{type}</span>
                </div>

                <span className="font-mono text-text-mut text-[9px] mt-0.5">x days</span>
            </div>
        </div>
    )
}

export default DeadlineCard