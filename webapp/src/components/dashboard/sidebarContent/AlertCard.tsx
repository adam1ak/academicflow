type AlertType = "info" | "success" | "warning" | "danger";

const alertVariants = {
  info: {
    text: "text-accent-blue",
    bg: "bg-[rgba(74,126,255,0.07)]",
    border: "border-[rgba(74,126,255,0.2)]",
  },

  success: {
    text: "text-accent-green",
    bg: "bg-[rgba(34,197,94,0.07)]",
    border: "border-[rgba(34,197,94,0.2)]",
  },

  warning: {
    text: "text-accent-amber",
    bg: "bg-[rgba(245,158,11,0.07)]",
    border: "border-[rgba(245,158,11,0.2)]",
  },

  danger: {
    text: "text-accent-red",
    bg: "bg-[rgba(239,68,68,0.07)]",
    border: "border-[rgba(239,68,68,0.2)]",
  },
};

interface AlertCardProps {
  type: AlertType;
  title: string;
  description: string;
}

function AlertCard({ type = "danger", title, description } : AlertCardProps) {

    const styles = alertVariants[type];

    return (
        <div className={`p-2.5 rounded-lg border ${styles.bg} ${styles.border}`}>
            <p className={`text-xs font-semibold ${styles.text}`}>{title}</p>
            <p className="text-[10px] text-text-sec leading-relaxed">{description}</p>
        </div>
    )
}

export default AlertCard