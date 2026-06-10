export type PillVariant = "assignment" | "exam" | "project" | "task" | "ready" | "blocked" | "completed";

interface PillTabProps {
    label: string;
    variant: PillVariant;
    isActive?: boolean;
    onClick?: () => void;
}

const variantStyles: Record<PillVariant, string> = {
    // deadline
    assignment: "bg-accent-amber/15 border-accent-amber/50 text-accent-amber-light",
    exam: "bg-accent-red/15 border-accent-red/50 text-accent-red",
    project: "bg-accent-purple/15 border-accent-purple/50 text-accent-amber-light",
    task: "bg-[#3b82f6]/15 border-[#3b82f6]/50 text-accent-amber-light",

    ready: "bg-[rgba(15,28,70,0.8)] border-[#2563eb] text-blue-soft",
    blocked: "bg-[rgba(20,20,26,0.8)] border-[#2d2d35] text-[#52525b]",
    completed: "bg-[rgba(5,46,22,0.8)] border-[#16a34a] text-[#4ade80]",
};


function PillTab({ label, variant, isActive = false, onClick }: PillTabProps) {

    const currentStyle = variantStyles[variant]
    const inactiveStyle = `border-dim bg-dim/23 text-sec hover:bg-dim/55`;
    
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1 border rounded-2xl transition-colors text-[10px] ${isActive ? currentStyle : inactiveStyle}`}
        >
            {label}
        </button>
    )
}

export default PillTab