import type { Vehicle } from "@/lib/api/types";

/** Retained value at the oldest tracked year, as a % of the zero-km price. */
export function calculateRetention4y(vehicle: Vehicle): number {
  const sorted = [...vehicle.prices].sort((a, b) => a.modelYear - b.modelYear);
  if (sorted.length === 0 || vehicle.zeroKmPriceBRL === 0) return 100;
  return (sorted[0].priceBRL / vehicle.zeroKmPriceBRL) * 100;
}

/** Average % depreciation per year, derived from the cross-sectional curve. */
export function calculateAnnualLoss(vehicle: Vehicle): number {
  const retention = calculateRetention4y(vehicle);
  const years = vehicle.prices.length > 0 ? vehicle.prices.length : 1;
  return Math.max(0, (100 - retention) / years);
}

/** Most recent (newest) model year price — what someone would pay today on FIPE. */
export function getCurrentPrice(vehicle: Vehicle): number {
  if (vehicle.prices.length === 0) return vehicle.zeroKmPriceBRL;
  return [...vehicle.prices].sort((a, b) => b.modelYear - a.modelYear)[0]
    .priceBRL;
}

export type BestYear = {
  modelYear: number;
  priceBRL: number;
  /** Annual depreciation going forward from this year, in %. Lower = more stable. */
  forwardAnnualDropPct: number;
  /** How much cheaper than zero-km, in %. */
  savingsVsZeroKmPct: number;
  /** Absolute savings vs zero-km, in BRL. */
  savingsVsZeroKmBRL: number;
};

/**
 * Depreciation "sweet spot": among the model years (excluding the newest one),
 * the year whose value is most stable going forward — i.e. you let the previous
 * owner eat the steep early depreciation, then your money holds better.
 *
 * We rank by the smallest forward annual drop, breaking ties toward bigger
 * savings vs zero-km. Returns null when the curve is too short to judge.
 */
export function bestYearToBuy(vehicle: Vehicle): BestYear | null {
  const sorted = [...vehicle.prices].sort((a, b) => a.modelYear - b.modelYear);
  if (sorted.length < 3 || vehicle.zeroKmPriceBRL <= 0) return null;

  const zero = vehicle.zeroKmPriceBRL;
  const candidates: BestYear[] = [];

  // For each year except the newest, the "forward" drop is how much value it
  // loses to reach the next-newer year's price (one year of aging from there).
  for (let i = 0; i < sorted.length - 1; i++) {
    const here = sorted[i];
    const newer = sorted[i + 1];
    if (newer.priceBRL <= 0) continue;
    const forwardAnnualDropPct =
      ((newer.priceBRL - here.priceBRL) / newer.priceBRL) * 100;
    candidates.push({
      modelYear: here.modelYear,
      priceBRL: here.priceBRL,
      forwardAnnualDropPct: Math.max(0, forwardAnnualDropPct),
      savingsVsZeroKmPct: ((zero - here.priceBRL) / zero) * 100,
      savingsVsZeroKmBRL: zero - here.priceBRL,
    });
  }

  if (candidates.length === 0) return null;

  // The "sweet spot" is the knee of the curve: we want a car that already
  // captured big savings vs zero-km (the previous owner ate the early cliff)
  // AND is stable going forward. Score rewards savings, penalizes future drop.
  // A 3-year-old with 45% savings & 6%/yr beats a 1-year-old with 17% & 4%/yr.
  const value = (c: BestYear) =>
    c.savingsVsZeroKmPct - c.forwardAnnualDropPct * 1.5;

  candidates.sort((a, b) => value(b) - value(a));
  return candidates[0];
}
