import type { Vehicle } from "@/lib/api/types";
import { calculateRetention4y } from "@/lib/analytics";

/**
 * Fipou Score — a single 0-100 index summarizing how sound a car is as a
 * purchase, blending the four dimensions we have real data for.
 *
 * Weights (max points):
 *   Retenção de valor ....... 40   (FIPE cross-sectional curve)
 *   Recalls ................. 20   (Senacon)
 *   Risco de roubo .......... 20   (Susep)
 *   Consumo ................. 20   (INMETRO PBE)  — elétrico pontua cheio
 */

export type ScoreBreakdown = {
  label: string;
  points: number;
  max: number;
};

export type FipouScore = {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D";
  breakdown: ScoreBreakdown[];
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function scoreRetention(vehicle: Vehicle): number {
  const r = calculateRetention4y(vehicle);
  // 40% retido → 0 pts, 75% retido → 40 pts
  return clamp(((r - 40) / (75 - 40)) * 40, 0, 40);
}

function scoreRecalls(vehicle: Vehicle): number {
  let pts = 20;
  for (const rec of vehicle.activeRecalls) {
    pts -= rec.severity === "alta" ? 8 : rec.severity === "média" ? 4 : 2;
  }
  return clamp(pts, 0, 20);
}

function scoreTheft(vehicle: Vehicle): number {
  if (!vehicle.theftRank) return 20; // fora do ranking = baixo risco
  const { rank } = vehicle.theftRank;
  if (rank <= 5) return 3;
  if (rank <= 10) return 7;
  if (rank <= 20) return 12;
  if (rank <= 30) return 16;
  return 18;
}

function scoreFuel(vehicle: Vehicle): number {
  if (vehicle.fuel === "Elétrico") return 20; // baixo custo por km
  const eco = vehicle.fuelEconomyKmL;
  if (!eco) return 12; // sem dado: neutro
  // 6 km/l → 0 pts, 14 km/l → 20 pts
  return clamp(((eco.city - 6) / (14 - 6)) * 20, 0, 20);
}

export function fipouScore(vehicle: Vehicle): FipouScore {
  const breakdown: ScoreBreakdown[] = [
    { label: "Retenção de valor", points: scoreRetention(vehicle), max: 40 },
    { label: "Recalls", points: scoreRecalls(vehicle), max: 20 },
    { label: "Risco de roubo", points: scoreTheft(vehicle), max: 20 },
    { label: "Consumo", points: scoreFuel(vehicle), max: 20 },
  ].map((b) => ({ ...b, points: Math.round(b.points) }));

  const score = clamp(
    Math.round(breakdown.reduce((sum, b) => sum + b.points, 0)),
    0,
    100,
  );

  const grade: FipouScore["grade"] =
    score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";

  return { score, grade, breakdown };
}

/** Tailwind color for a given score, in the Fipou palette. */
export function scoreColor(score: number): string {
  if (score >= 80) return "#10B981"; // good
  if (score >= 65) return "#22D3EE"; // cyan
  if (score >= 50) return "#F59E0B"; // caution
  return "#EF4444"; // bad
}
