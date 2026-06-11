type WeekLoad = "light" | "busy" | "overloaded";

interface WeekCardProps {
    week: number;
    load: number;
    type?: WeekLoad;
}

const loadVariants = {
  light: {
    bg: "bg-accent-blue",
  },

  busy: {
    bg: "bg-accent-amber",
  },

  overloaded: {
    bg: "bg-accent-red",
  },
};


function WeekCard({ week, load, type = "light" }: WeekCardProps) {

    const styles = loadVariants[type];

    return (
        <div className="text-center">
            <div className={`flex items-center justify-center mb-0.5 h-[34px] opacity-45 rounded ${styles.bg}`}>
                <span className="font-mono text-[8px] text-[rgba(255,255,255,.6)] font-medium">{load}</span>
            </div>

            <p className="font-mono text-mut text-[8px]">W{week}</p>
        </div>
    )
}

export default WeekCard