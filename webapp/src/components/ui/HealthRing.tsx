interface HealthRingProps {
  value: number;
  color?: string;
}

function HealthRing({ value, color = "#a78bfa" }: HealthRingProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width="68" height="68" viewBox="0 0 68 68" className="shrink-0">
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
        stroke={color}
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
        fill={color}
        fontSize="14"
        fontWeight="700"
      >
        {value}
      </text>
    </svg>
  );
}

export default HealthRing