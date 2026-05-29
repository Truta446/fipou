import type { Fuel, Segment, VehicleEnrichment } from "@/lib/api/types";
import { getRecalls } from "@/lib/enrichment/recalls";
import { getFuelEconomy } from "@/lib/enrichment/fuel-economy";
import { getTheftRank } from "@/lib/enrichment/theft";

/**
 * Enrichment data not provided by FIPE, assembled entirely from real open-data
 * sources + heuristics — no hand-fabricated per-vehicle values:
 *
 *  - activeRecalls → Senacon/MJ recalls   (lib/enrichment/recalls.ts)
 *  - fuelEconomyKmL → INMETRO PBE Veicular (lib/enrichment/fuel-economy.ts)
 *  - theftRank → Susep/SSP ranking         (lib/enrichment/theft.ts)
 *  - segment → inferred from the model name
 *  - segmentRetention4yPct → per-segment baseline constant
 */

/**
 * Per-segment average 4-year retention (%). These are segment-level analytical
 * baselines (not per-car), used only as the comparison reference in the verdict.
 */
const SEGMENT_DEFAULT_RETENTION: Record<Segment, number> = {
  Hatch: 53.8,
  Sedan: 60.0,
  SUV: 58.2,
  Pickup: 68.4,
  Coupe: 66.8,
};

/**
 * A few explicit segment overrides where the name-based heuristic is ambiguous.
 * Keyed by FIPE code. This is classification only — no fabricated metrics.
 */
const SEGMENT_OVERRIDE: Record<string, Segment> = {
  "002201-2": "SUV", // Corolla Cross (heuristic might read "corolla" → Sedan)
};

/** Best-effort segment inference from the FIPE model name. */
export function inferSegment(modelName: string): Segment {
  const m = modelName.toLowerCase();
  if (/\b(pick[- ]?up|hilux|toro|amarok|ranger|s10|saveiro|montana|strada|frontier|maverick|f-?1\d{2})\b/.test(m))
    return "Pickup";
  if (/\b(cross|compass|kicks|hr-?v|tracker|t-?cross|creta|nivus|tiggo|territory|trailblazer|outlander|3008|sw4|pajero|range rover|commander|pulse|renegade|sportage|tucson|q\d|gla|glc|gle)\b/.test(m))
    return "SUV";
  if (/\b(coupe|coupé|mustang|camaro|amg gt|f-?type|911|gt-?r|gtr)\b/.test(m))
    return "Coupe";
  if (/\b(sedan|sed\.?|civic|corolla(?!\s+cross)|jetta|cruze|altima|fusion|accord|elantra|virtus|cobalt|prisma|voyage|grand siena|hb20s|logan|c4 lounge)\b/.test(m))
    return "Sedan";
  return "Hatch";
}

/** Map FIPE fuel acronym/string to our Fuel union. */
export function normalizeFuel(input: string): Fuel {
  const f = (input || "").toLowerCase();
  if (f.includes("hib") || f.includes("híb") || f === "h") return "Híbrido";
  if (f.includes("elét") || f.includes("elet") || f === "e") return "Elétrico";
  if (f.includes("flex")) return "Flex";
  if (f.includes("diesel") || f === "d") return "Diesel";
  return "Gasolina";
}

/**
 * Assemble a complete enrichment record from the real datasets. Never throws.
 *
 * @param fuel  Normalized fuel type, so electric cars correctly skip km/l.
 */
export function getEnrichment(
  fipeCode: string,
  brand: string,
  modelName: string,
  fuel?: Fuel,
): VehicleEnrichment {
  const segment = SEGMENT_OVERRIDE[fipeCode] ?? inferSegment(modelName);

  return {
    segment,
    activeRecalls: getRecalls(brand, modelName),
    fuelEconomyKmL:
      fuel === "Elétrico" ? undefined : getFuelEconomy(brand, modelName),
    theftRank: getTheftRank(brand, modelName),
    segmentRetention4yPct: SEGMENT_DEFAULT_RETENTION[segment],
  };
}
