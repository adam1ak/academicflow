interface HealthRingProps {
  value: number;
  className?: string;
  color?: string;
}

function HealthRing({ value, className = "", color }: HealthRingProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (value / 100) * circumference;
  const activeColor = color || "currentColor";

  return (
    <svg width="68" height="68" viewBox="0 0 68 68" className={`shrink-0 ${className}`}>
      <circle
        cx="34"
        cy="34"
        r={radius}
        fill="none"
        stroke="#1a1a22"
        strokeWidth="8"
      />

      <circle
        cx="34"
        cy="34"
        r={radius}
        fill="none"
        stroke={activeColor}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
      />

      <text
        x="34"
        y="34"
        textAnchor="middle"
        dominantBaseline="central"
        fill={activeColor}
        fontSize="14"
        fontWeight="700"
      >
        {value}
      </text>
    </svg>
  );
}

export default HealthRing