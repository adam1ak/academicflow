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
        bgColor: "bg-accent-amber/7",
        bgBorder: "border-accent-amber/20",
        text: "text-accent-amber",
        typeBg: "bg-accent-amber/8",
        pill: "bg-accent-amber/7 border-accent-amber/20 text-accent-amber",
        dot: "bg-accent-amber"
    },
    exam: {
        bgColor: "bg-accent-red/7",
        bgBorder: "border-accent-red/20",
        text: "text-accent-red",
        typeBg: "bg-accent-red/8",
        pill: "bg-accent-red/7 border-accent-red/20 text-accent-red",
        dot: "bg-accent-red"
    },
    task: {
        bgColor: "bg-accent-pink/7",
        bgBorder: "border-accent-pink/20",
        text: "text-accent-pink",
        typeBg: "bg-accent-pink/8",
        pill: "bg-accent-pink/7 border-accent-pink/20 text-accent-pink",
        dot: "bg-accent-pink"
    },
    project: {
        bgColor: "bg-accent-purple/7",
        bgBorder: "border-accent-purple/20",
        text: "text-accent-purple",
        typeBg: "bg-accent-purple/8",
        pill: "bg-accent-purple/7 border-accent-purple/20 text-accent-purple",
        dot: "bg-accent-purple"
    },

    ready: {
        bgColor: "bg-status-ready-bg",
        bgBorder: "border-status-ready-border",
        text: "text-blue-soft",
        typeBg: "bg-status-ready-bg",
        pill: "bg-status-ready-bg border-status-ready-border text-blue-soft",
        dot: "bg-accent-blue"
    },
    blocked: {
        bgColor: "bg-status-blocked-bg",
        bgBorder: "border-status-blocked-border",
        text: "text-status-blocked-text",
        typeBg: "bg-status-blocked-bg",
        pill: "bg-status-blocked-bg border-status-blocked-border text-status-blocked-text",
        dot: "bg-status-blocked-text"
    },
    completed: {
        bgColor: "bg-status-completed-bg",
        bgBorder: "border-status-completed-border",
        text: "text-status-completed-text",
        typeBg: "bg-status-completed-bg",
        pill: "bg-status-completed-bg border-status-completed-border text-status-completed-text",
        dot: "bg-accent-green"
    }
};

export function useStatusStyles() {
    return {
        getStyles: (variant: PillVariant): StatusStyle => styles[variant] || styles.ready
    };
}