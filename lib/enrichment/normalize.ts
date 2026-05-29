/**
 * Shared text-normalization helpers for matching FIPE model names against
 * external open-data sources (Senacon, INMETRO, Susep) that use free text.
 */

/** Canonical brand name from any FIPE/source spelling. */
export function canonicalBrand(raw: string): string {
  const b = raw.toLowerCase();
  if (b.includes("vw") || b.includes("volks")) return "Volkswagen";
  if (b.includes("gm") || b.includes("chevrolet")) return "Chevrolet";
  if (b.includes("fiat")) return "Fiat";
  if (b.includes("toyota")) return "Toyota";
  if (b.includes("honda")) return "Honda";
  if (b.includes("hyundai")) return "Hyundai";
  if (b.includes("jeep")) return "Jeep";
  if (b.includes("ford")) return "Ford";
  if (b.includes("renault")) return "Renault";
  if (b.includes("nissan")) return "Nissan";
  if (b.includes("byd")) return "BYD";
  if (b.includes("peugeot")) return "Peugeot";
  if (b.includes("citro")) return "Citroën";
  if (b.includes("mercedes")) return "Mercedes-Benz";
  if (b.includes("bmw")) return "BMW";
  if (b.includes("audi")) return "Audi";
  if (b.includes("volvo")) return "Volvo";
  if (b.includes("mitsubishi")) return "Mitsubishi";
  if (b.includes("kia")) return "Kia";
  if (b.includes("caoa") || b.includes("chery")) return "Caoa Chery";
  if (b.includes("land")) return "Land Rover";
  return raw.trim();
}

/** Stopwords that appear in trims but never identify a model. */
const STOP = new Set([
  "16v", "12v", "8v", "v8", "v6", "aut", "mec", "flex", "turbo", "tb", "tsi",
  "diesel", "gasolina", "híbrido", "hibrido", "elétrico", "eletrico", "4x4",
  "4x2", "cd", "5p", "4p", "2p", "200", "270", "380", "ev", "the", "1million",
  "premium", "plus", "comfort", "comfor", "highline", "limited", "longitude",
  "impetus", "touring", "ranch", "drive", "ltz", "lt", "ls", "se", "se.",
]);

/**
 * Extract the "core" model tokens from a FIPE model name.
 * e.g. "Corolla Cross XR 2.0 16V Flex Aut." → ["corolla", "cross", "xr"]
 */
export function modelTokens(modelName: string): string[] {
  return modelName
    .toLowerCase()
    .replace(/[^a-zà-ú0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP.has(w) && !/^\d+\.\d+$/.test(w))
    .slice(0, 4);
}

/** Primary model word — the first non-numeric token. */
export function primaryModelWord(modelName: string): string {
  return modelTokens(modelName)[0] ?? "";
}
