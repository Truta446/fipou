import "server-only";
import { unstable_cache } from "next/cache";

/**
 * Banco Central do Brasil — SGS (Sistema Gerenciador de Séries Temporais).
 *
 * Public, key-less JSON API. We use it for macro context on the ficha:
 *   - série 13522 → IPCA acumulado 12 meses (%)
 *   - série 432   → Meta Selic definida pelo Copom (% a.a.)
 *
 * Fetched server-side only (no browser CSP impact) and cached for 24h.
 *
 * IMPORTANT — why we don't "inflation-adjust" the depreciation curve:
 * the FIPE curve is cross-sectional (every model year priced in the SAME
 * reference month), so it is already expressed in constant (real) reais.
 * There is nothing to deflate until we accumulate our own historical price
 * snapshots over time. `deflate()` below is the helper that WILL adjust those
 * future time-series; today the IPCA is used purely as macro context +
 * opportunity-cost framing in the verdict.
 */

const SGS = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";

export type EconomicContext = {
  /** IPCA accumulated over the last 12 months, in %. */
  ipca12m: number;
  /** Human label of the IPCA reference month, e.g. "abril de 2026". */
  ipca12mLabel: string;
  /** Selic target rate, in % per year. */
  selic: number;
};

type SgsPoint = { data: string; valor: string };

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "01/04/2026" → "abril de 2026" */
function brDateToLabel(br: string): string {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return br;
  const month = MONTHS[Number(m[2]) - 1] ?? "";
  return `${month} de ${m[3]}`;
}

async function fetchLatest(series: number): Promise<SgsPoint | null> {
  try {
    const res = await fetch(
      `${SGS}.${series}/dados/ultimos/1?formato=json`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as SgsPoint[];
    return data[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchEconomicContext(): Promise<EconomicContext | null> {
  const [ipca, selic] = await Promise.all([
    fetchLatest(13522),
    fetchLatest(432),
  ]);
  if (!ipca || !selic) return null;
  return {
    ipca12m: Number(ipca.valor),
    ipca12mLabel: brDateToLabel(ipca.data),
    selic: Number(selic.valor),
  };
}

/** Cached economic context (24h). Returns null if BCB is unreachable. */
export const getEconomicContext = unstable_cache(
  fetchEconomicContext,
  ["bcb", "economic-context"],
  { revalidate: 60 * 60 * 24, tags: ["bcb"] },
);

/**
 * Deflate a past nominal value to present-day reais using an accumulated
 * inflation factor. Reserved for the future historical-snapshot feature.
 *
 * @param nominal   value in reais of the past period
 * @param accumIpca accumulated IPCA between the past period and now, in % (e.g. 4.39)
 */
export function deflate(nominal: number, accumIpca: number): number {
  return nominal * (1 + accumIpca / 100);
}
