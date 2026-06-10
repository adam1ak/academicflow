export type PillVariant = "assignment" | "exam" | "project" | "task" | "ready" | "blocked" | "completed";

export interface StatusStyle {
    pill: string
    dot: string
    bgColor: string
    bgBorder: string
    text: string
    typeBg: string
}

const styles: Record<PillVariant, StatusStyle> = {
    assignment: {
        bgColor: "bg-[#f59e0b12]",
        bgBorder: "border-[#f59e0b33]",
        text: "text-[#f59e0b]",
        typeBg: "bg-[#f59e0b15]",
        pill: "bg-[#f59e0b12] border-[#f59e0b33] text-[#f59e0b]",
        dot: "bg-[#f59e0b]"
    },
    exam: {
        bgColor: "bg-[#ef444412]",
        bgBorder: "border-[#ef444433]",
        text: "text-[#ef4444]",
        typeBg: "bg-[#ef444415]",
        pill: "bg-[#ef444412] border-[#ef444433] text-[#ef4444]",
        dot: "bg-[#ef4444]"
    },
    task: {
        bgColor: "bg-[#3b82f612]",
        bgBorder: "border-[#3b82f633]",
        text: "text-[#3b82f6]",
        typeBg: "bg-[#3b82f615]",
        pill: "bg-[#3b82f612] border-[#3b82f633] text-[#3b82f6]",
        dot: "bg-[#3b82f6]"
    },
    project: {
        bgColor: "bg-[#a855f712]",
        bgBorder: "border-[#a855f733]",
        text: "text-[#a855f7]",
        typeBg: "bg-[#a855f715]",
        pill: "bg-[#a855f712] border-[#a855f733] text-[#a855f7]",
        dot: "bg-[#a855f7]"
    },

    ready: {
        bgColor: "bg-[rgba(15,28,70,0.8)]",
        bgBorder: "border-[#2563eb]",
        text: "text-blue-soft",
        typeBg: "bg-[rgba(15,28,70,0.8)]",
        pill: "bg-[rgba(15,28,70,0.8)] border-[#2563eb] text-blue-soft",
        dot: "bg-accent-blue"
    },
    blocked: {
        bgColor: "bg-[rgba(20,20,26,0.8)]",
        bgBorder: "border-[#2d2d35]",
        text: "text-[#52525b]",
        typeBg: "bg-[rgba(20,20,26,0.8)]",
        pill: "bg-[rgba(20,20,26,0.8)] border-[#2d2d35] text-[#52525b]",
        dot: "bg-[#3f3f46]"
    },
    completed: {
        bgColor: "bg-[rgba(5,46,22,0.8)]",
        bgBorder: "border-[#16a34a]",
        text: "text-[#4ade80]",
        typeBg: "bg-[rgba(5,46,22,0.8)]",
        pill: "bg-[rgba(5,46,22,0.8)] border-[#16a34a] text-[#4ade80]",
        dot: "bg-accent-green"
    }
};

export function useStatusStyles() {
    return {
        getStyles: (variant: PillVariant): StatusStyle => styles[variant] || styles.ready
    };
}