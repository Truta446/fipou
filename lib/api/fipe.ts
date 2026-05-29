/**
 * Real FIPE data layer powered by the `fipe-promise` library (v2 → uses
 * fipe.parallelum.com.br/api/v2 under the hood).
 *
 * This module is environment-agnostic: client code reaches it through the
 * TanStack Query hooks in `lib/queries/hooks.ts`, server components reach it
 * through `lib/api/fipe-server.ts` (which adds Next.js `unstable_cache`).
 *
 * Rate limits to respect (per IP, daily):
 *   - List endpoints (brands/models/years/references): 1000/day
 *   - Detail endpoint (price): 500/day
 * Cache aggressively. FIPE updates monthly, so a 24h server cache + an
 * in-process TanStack cache on the client is more than enough.
 */
import fipe from "fipe-promise";
import { parsePriceBRL } from "@/lib/format";
import {
  getEnrichment,
  normalizeFuel,
} from "@/lib/enrichment";
import type {
  Brand,
  Model,
  Year,
  Vehicle,
  VehicleHandle,
  PricePoint,
} from "@/lib/api/types";

/** Canonical year code used by FIPE for the brand-new "zero quilômetro" listing. */
export const ZERO_KM_YEAR = 32000;

const TYPE = fipe.vehicleType.CARS;

export type FipeOptions = {
  reference?: number;
  token?: string;
};

/* ------------------------------------------------------------------ catalog */

export async function fetchReferences() {
  return fipe.fetchReferences();
}

export async function fetchBrands(options?: FipeOptions): Promise<Brand[]> {
  const brands = await fipe.fetchBrands(TYPE, options);
  return brands.map((b) => ({ code: b.code, name: b.name }));
}

export async function fetchModels(
  brandCode: string,
  options?: FipeOptions,
): Promise<Model[]> {
  const models = await fipe.fetchModels(TYPE, brandCode, options);
  return models.map((m) => ({ code: m.code, name: m.name }));
}

export async function fetchYears(
  brandCode: string,
  modelCode: string,
  options?: FipeOptions,
): Promise<Year[]> {
  const years = await fipe.fetchYears(TYPE, brandCode, modelCode, options);
  return years.map((y) => ({ code: y.code, name: y.name }));
}

/* -------------------------------------------------------------- detail / ficha */

/**
 * Build a full Vehicle profile for a FIPE code by fetching every year variant
 * (including the zero-km synthetic 32000 year) and merging with enrichment data.
 *
 * Cost: 1 fetchYearsByFipeCode + N fetchDetailByFipeCode in parallel (N ≈ 5–7).
 * Cache aggressively in the server wrapper.
 */
export async function fetchVehicle(
  fipeCode: string,
  options?: FipeOptions,
): Promise<Vehicle> {
  const years = await fipe.fetchYearsByFipeCode(TYPE, fipeCode, options);
  if (years.length === 0) {
    throw new Error(`FIPE: no year variants for ${fipeCode}`);
  }

  const details = await Promise.all(
    years.map((y) =>
      fipe
        .fetchDetailByFipeCode(TYPE, fipeCode, y.code, options)
        .catch(() => null),
    ),
  );

  const ok = details.filter((d): d is NonNullable<typeof d> => d !== null);
  if (ok.length === 0) {
    throw new Error(`FIPE: every detail call failed for ${fipeCode}`);
  }

  const head = ok[0];
  const pricePoints: PricePoint[] = ok
    .filter((d) => d.modelYear !== ZERO_KM_YEAR)
    .map((d) => ({
      modelYear: d.modelYear,
      priceBRL: parsePriceBRL(d.price),
    }))
    .filter((p) => Number.isFinite(p.priceBRL))
    .sort((a, b) => a.modelYear - b.modelYear);

  const zeroKm = ok.find((d) => d.modelYear === ZERO_KM_YEAR);
  const zeroKmPriceBRL = zeroKm
    ? parsePriceBRL(zeroKm.price)
    : Math.max(...pricePoints.map((p) => p.priceBRL));

  const fuel = normalizeFuel(head.fuel || head.fuelAcronym);
  const enrichment = getEnrichment(fipeCode, head.brand, head.model, fuel);

  return {
    fipeCode: head.codeFipe,
    brand: head.brand,
    model: head.model,
    fuel,
    zeroKmPriceBRL,
    prices: pricePoints,
    referenceMonth: head.referenceMonth,
    ...enrichment,
  };
}

/* --------------------------------------------------------- search-page helpers */

/**
 * Given the user's three cascading dropdown picks, resolve the canonical FIPE
 * code by fetching the single year detail. Used by the buscar page right before
 * navigating to /carro/[fipeCode].
 */
export async function resolveHandle(
  brandCode: string,
  modelCode: string,
  yearCode: string,
  options?: FipeOptions,
): Promise<VehicleHandle> {
  const detail = await fipe.fetchDetail(
    TYPE,
    brandCode,
    modelCode,
    yearCode,
    options,
  );
  return {
    fipeCode: detail.codeFipe,
    brandCode,
    modelCode,
    yearCode,
    fuel: detail.fuel,
  };
}

/* ----------------------------------------------------------- API key from env */

/**
 * Pull `FIPE_TOKEN` from the environment. Currently the project ships without
 * a paid token (free tier limits apply); set this in Vercel only if you upgrade
 * to fipe.online.
 */
export function envFipeOptions(): FipeOptions | undefined {
  const token = process.env.FIPE_TOKEN;
  return token ? { token } : undefined;
}
