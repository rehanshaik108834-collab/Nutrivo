export default function MacroRing({ value, goal, color, label, size = 80 }) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize={size > 70 ? 13 : 11} fontFamily="var(--font-body)" fontWeight="600">
          {Math.round(value)}
        </text>
      </svg>
      <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, textAlign: 'center' }}>{label}</div>
    </div>
  );
}
