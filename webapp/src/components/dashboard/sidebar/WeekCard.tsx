type WeekLoad = "empty" | "light" | "busy" | "overloaded";

interface WeekCardProps {
    week: number;
    load: number;
    type?: WeekLoad;
}

const loadVariants = {
  empty: {
    bg: "bg-transparent border border-dim",
    text: "text-mut",
  },

  light: {
    bg: "bg-accent-blue/15 border border-accent-blue/35",
    text: "text-accent-blue font-bold",
  },

  busy: {
    bg: "bg-accent-amber/15 border border-accent-amber/35",
    text: "text-accent-amber font-bold",
  },

  overloaded: {
    bg: "bg-accent-red/15 border border-accent-red/35",
    text: "text-accent-red font-bold",
  },
};


function WeekCard({ week, load, type = "light" }: WeekCardProps) {

    const styles = loadVariants[type];
    const tooltipText = load === 0 
        ? `Week ${week}: No active subjects` 
        : `Week ${week}: ${load} active subject${load === 1 ? "" : "s"}`;

    return (
        <div className="text-center" title={tooltipText}>
            <div className={`flex items-center justify-center mb-0.5 h-[34px] rounded ${styles.bg}`}>
                <span className={`font-mono text-[10px] ${styles.text}`}>{load}</span>
            </div>

            <p className="font-mono text-mut text-[8px]">W{week}</p>
        </div>
    )
}

export default WeekCard