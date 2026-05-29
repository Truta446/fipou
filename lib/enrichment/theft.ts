import type { TheftRank } from "@/lib/api/types";
import { canonicalBrand, modelTokens } from "./normalize";
import theftData from "./data/theft.json";

type TheftFile = {
  source: string;
  year: number;
  models: Record<string, Record<string, { state: string; rank: number }>>;
};

const DATA = theftData as TheftFile;

/**
 * Susep/SSP theft-and-robbery ranking matched by brand + model word.
 * Returns undefined when the model is outside the published top list.
 */
export function getTheftRank(
  brand: string,
  modelName: string,
): TheftRank | undefined {
  const brandModels = DATA.models[canonicalBrand(brand)];
  if (!brandModels) return undefined;

  for (const token of modelTokens(modelName)) {
    const hit =
      brandModels[token] ??
      Object.entries(brandModels).find(
        ([k]) => k === token || k.startsWith(token) || token.startsWith(k),
      )?.[1];
    if (hit) return { state: hit.state, rank: hit.rank, year: DATA.year };
  }
  return undefined;
}

export const theftSource = DATA.source;
