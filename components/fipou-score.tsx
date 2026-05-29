import { fipouScore, scoreColor } from "@/lib/score";
import type { Vehicle } from "@/lib/api/types";

/** Compact circular score badge — server-safe (no client JS). */
export function FipouScoreBadge({
  vehicle,
  size = 64,
}: {
  vehicle: Vehicle;
  size?: number;
}) {
  const { score, grade } = fipouScore(vehicle);
  const color = scoreColor(score);
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-label={`Fipou Score ${score} de 100, nota ${grade}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-semibold leading-none"
          style={{ color, fontSize: size * 0.3 }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}

/** Full score panel with per-dimension breakdown bars. */
export function FipouScorePanel({ vehicle }: { vehicle: Vehicle }) {
  const { score, grade, breakdown } = fipouScore(vehicle);
  const color = scoreColor(score);

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      <div className="flex items-center gap-4">
        <FipouScoreBadge vehicle={vehicle} size={84} />
        <div>
          <p className="font-mono text-xs text-[#52525B] uppercase tracking-wider">
            Fipou Score
          </p>
          <p className="text-3xl font-semibold" style={{ color }}>
            {score}
            <span className="text-[#52525B] text-lg">/100</span>
          </p>
          <p className="font-mono text-sm" style={{ color }}>
            nota {grade}
          </p>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3">
        {breakdown.map((b) => {
          const pct = (b.points / b.max) * 100;
          return (
            <div key={b.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#A1A1AA]">{b.label}</span>
                <span className="font-mono text-[#52525B]">
                  {b.points}/{b.max}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: scoreColor(score) }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
