export default function MacroRing({ value, goal, colorClass, label, size = 90 }) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100);
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
        <circle cx={size/2} cy={size/2} r={r} fill="none" className="stroke-slate-100" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" className={colorClass} strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease-out' }} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          className="fill-slate-800 font-bold font-sans transform rotate-90" fontSize={size > 70 ? 15 : 12}>
          {Math.round(value)}g
        </text>
      </svg>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}
