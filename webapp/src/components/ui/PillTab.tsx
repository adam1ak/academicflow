import { useStatusStyles, PillVariant } from "../../hooks/useStatusStyles";

interface PillTabProps {
    label: string;
    variant: PillVariant;
    isActive?: boolean;
    onClick?: () => void;
}

function PillTab({ label, variant, isActive = false, onClick }: PillTabProps) {
    const { getStyles } = useStatusStyles()


    const currentStyle = getStyles(variant).pill
    const inactiveStyle = `border-dim bg-dim/23 text-sec hover:bg-dim/55`;
    
    return (
        <button
            type="button"
            onClick={onClick}
            className={`capitalize px-3 py-1 border rounded-2xl transition-colors text-[10px] ${isActive ? currentStyle : inactiveStyle}`}
        >
            {label}
        </button>
    )
}

export default PillTab