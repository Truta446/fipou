/**
 * TanStack Query key factory.
 *
 * Convention: every key starts with the `["fipe"]` namespace so we can
 * invalidate everything in one shot from a future ETL cron.
 */

export const queryKeys = {
  all: ["fipe"] as const,
  brands: () => [...queryKeys.all, "brands"] as const,
  models: (brandCode: string) =>
    [...queryKeys.all, "models", brandCode] as const,
  years: (brandCode: string, modelCode: string) =>
    [...queryKeys.all, "years", brandCode, modelCode] as const,
  vehicle: (fipeCode: string) =>
    [...queryKeys.all, "vehicle", fipeCode] as const,
  resolve: (brandCode: string, modelCode: string, yearCode: string) =>
    [...queryKeys.all, "resolve", brandCode, modelCode, yearCode] as const,
};
