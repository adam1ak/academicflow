type AccentColor = "green" | "blue" | "purple" | "orange";


interface StatisticCardProps {
    accentColor: AccentColor,
    title: string,
    value: string,
    description: string
}

const accentVariants = {
    green: {
        statBar:
            "bg-[linear-gradient(90deg,rgba(34,197,94,.27),rgba(34,197,94,.1),transparent)]",
        value: "text-accent-green",
    },

    blue: {
        statBar:
            "bg-[linear-gradient(90deg,rgba(74,126,255,.27),rgba(74,126,255,.1),transparent)]",
        value: "text-accent-blue",
    },

    purple: {
        statBar:
            "bg-[linear-gradient(90deg,rgba(167,139,250,.27),rgba(167,139,250,.1),transparent)]",
        value: "text-accent-purple",
    },

    orange: {
        statBar:
            "bg-[linear-gradient(90deg,rgba(245,158,11,.27),rgba(245,158,11,.1),transparent)]",
        value: "text-accent-amber",
    },
};

function StatisticCard({ accentColor, title, value, description }: StatisticCardProps) {

    const styles = accentVariants[accentColor]

    return (
        <div className={`relative bg-surface border border-border-dim p-3.5 rounded-xl overflow-hidden`}>
            <div className={`stat-bar ${styles.statBar}`} />
            <dt className="font-mono text-[10px] tracking-widest text-text-sec uppercase mb-2">{title}</dt>
            <dd className={`text-2xl font-bold leading-none mb-1 ${styles.value}`}>{value}</dd>
            <p className="font-mono text-[10px] text-text-mut">{description}</p>
        </div>
    )
}

export default StatisticCard