/**
 * Server-only FIPE wrappers cached via Next.js `unstable_cache`.
 *
 * Use these from Server Components and route handlers. The underlying calls
 * go through `lib/api/fipe.ts` but each call is memoized + persisted across
 * deployments through Next's Data Cache.
 *
 * Cache windows are sized for FIPE's monthly refresh cadence:
 *   - brands/references   → 7 days     (rarely change)
 *   - models              → 24 hours
 *   - years/vehicle       → 24 hours
 *   - revalidate via tag  → `fipe:vehicle:<code>` and `fipe:catalog`
 */
import "server-only";
import { unstable_cache } from "next/cache";
import {
  envFipeOptions,
  fetchBrands as rawFetchBrands,
  fetchModels as rawFetchModels,
  fetchVehicle as rawFetchVehicle,
  fetchYears as rawFetchYears,
} from "@/lib/api/fipe";

const ONE_DAY = 60 * 60 * 24;
const SEVEN_DAYS = ONE_DAY * 7;

export const getBrands = unstable_cache(
  async () => rawFetchBrands(envFipeOptions()),
  ["fipe", "brands", "cars"],
  { revalidate: SEVEN_DAYS, tags: ["fipe:catalog", "fipe:brands"] },
);

export const getModels = (brandCode: string) =>
  unstable_cache(
    async () => rawFetchModels(brandCode, envFipeOptions()),
    ["fipe", "models", "cars", brandCode],
    { revalidate: ONE_DAY, tags: ["fipe:catalog", `fipe:brand:${brandCode}`] },
  )();

export const getYears = (brandCode: string, modelCode: string) =>
  unstable_cache(
    async () => rawFetchYears(brandCode, modelCode, envFipeOptions()),
    ["fipe", "years", "cars", brandCode, modelCode],
    { revalidate: ONE_DAY, tags: [`fipe:model:${brandCode}:${modelCode}`] },
  )();

export const getVehicle = (fipeCode: string) =>
  unstable_cache(
    async () => rawFetchVehicle(fipeCode, envFipeOptions()),
    ["fipe", "vehicle", "cars", fipeCode],
    { revalidate: ONE_DAY, tags: [`fipe:vehicle:${fipeCode}`] },
  )();
