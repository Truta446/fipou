import type { FuelEconomy } from "@/lib/api/types";
import { canonicalBrand, modelTokens } from "./normalize";
import fuelData from "./data/fuel-economy.json";

type FuelFile = {
  source: string;
  models: Record<string, Record<string, { city: number; road: number }>>;
};

const DATA = fuelData as FuelFile;

/**
 * INMETRO PBE Veicular fuel economy (km/l) matched by brand + model word.
 * Electric vehicles intentionally return undefined (km/l is N/A).
 */
export function getFuelEconomy(
  brand: string,
  modelName: string,
): FuelEconomy | undefined {
  const brandModels = DATA.models[canonicalBrand(brand)];
  if (!brandModels) return undefined;

  for (const token of modelTokens(modelName)) {
    // exact then prefix match (handles "hr-v" vs "hrv", "t-cross")
    const hit =
      brandModels[token] ??
      Object.entries(brandModels).find(
        ([k]) => k === token || k.startsWith(token) || token.startsWith(k),
      )?.[1];
    if (hit) return { city: hit.city, road: hit.road };
  }
  return undefined;
}

export const fuelEconomySource = DATA.source;
