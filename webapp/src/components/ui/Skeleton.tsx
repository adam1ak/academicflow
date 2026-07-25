interface SkeletonProps {
    className?: string
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`bg-surface-hi/80 border border-dim rounded-xl skeleton-pulse ${className}`}
        />
    )
}

export default Skeleton