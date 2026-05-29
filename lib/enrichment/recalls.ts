import type { Recall } from "@/lib/api/types";
import { canonicalBrand, primaryModelWord } from "./normalize";
import recallsData from "./data/recalls.json";

type RawRecall = {
  date: string;
  summary: string;
  severity: "alta" | "média" | "baixa";
  modelTokens: string[];
};

type RecallsFile = {
  source: string;
  brands: Record<string, RawRecall[]>;
};

const DATA = recallsData as RecallsFile;

/**
 * Real Senacon recalls matched to a vehicle by brand + primary model word.
 *
 * Source coverage is 2013–2017, so this mostly surfaces recalls for older
 * model years. The composer layers curated data on top, so featured (new)
 * cars are unaffected; this fills the long tail with real official data.
 */
export function getRecalls(brand: string, modelName: string): Recall[] {
  const list = DATA.brands[canonicalBrand(brand)];
  if (!list) return [];

  const word = primaryModelWord(modelName);
  if (!word) return [];

  return list
    .filter((r) => r.modelTokens.some((t) => t === word || t.startsWith(word)))
    .slice(0, 5)
    .map(({ date, summary, severity }) => ({ date, summary, severity }));
}

export const recallsSource = DATA.source;
