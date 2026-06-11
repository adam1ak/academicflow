interface StatisticCardProps {
    title: string,
    value: string | number,
    description: string,
    statBar: string,
    textColor: string
}



function StatisticCard({ title, value, description, statBar, textColor }: StatisticCardProps) {


    return (
        <div className={`relative bg-surface border border-dim p-3.5 rounded-xl overflow-hidden`}>
            <div className={`stat-bar ${statBar}`} />
            <dt className="font-mono text-[10px] tracking-widest text-sec uppercase mb-2">{title}</dt>
            <dd className={`text-2xl font-bold leading-none mb-1 ${textColor}`}>{value}</dd>
            <p className="font-mono text-[10px] text-mut">{description}</p>
        </div>
    )
}

export default StatisticCard