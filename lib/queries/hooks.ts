"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchBrands,
  fetchModels,
  fetchVehicle,
  fetchYears,
  resolveHandle,
} from "@/lib/api/fipe";
import { queryKeys } from "./keys";

const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR * 24;
const SEVEN_DAYS = ONE_DAY * 7;

/* --------------------------------------------------- catalog (cascading flow) */

export function useBrands() {
  return useQuery({
    queryKey: queryKeys.brands(),
    queryFn: () => fetchBrands(),
    staleTime: SEVEN_DAYS,
    gcTime: SEVEN_DAYS,
  });
}

export function useModels(brandCode: string | undefined) {
  return useQuery({
    queryKey: queryKeys.models(brandCode ?? ""),
    queryFn: () => fetchModels(brandCode!),
    enabled: Boolean(brandCode),
    staleTime: ONE_DAY,
  });
}

export function useYears(
  brandCode: string | undefined,
  modelCode: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.years(brandCode ?? "", modelCode ?? ""),
    queryFn: () => fetchYears(brandCode!, modelCode!),
    enabled: Boolean(brandCode && modelCode),
    staleTime: ONE_DAY,
  });
}

/* ----------------------------------------------------------- vehicle (ficha) */

export function useVehicle(fipeCode: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vehicle(fipeCode ?? ""),
    queryFn: () => fetchVehicle(fipeCode!),
    enabled: Boolean(fipeCode),
    staleTime: ONE_DAY,
  });
}

/** Resolve brand+model+year → FIPE code right before navigating to a ficha. */
export function useResolveHandle(
  brandCode: string | undefined,
  modelCode: string | undefined,
  yearCode: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.resolve(
      brandCode ?? "",
      modelCode ?? "",
      yearCode ?? "",
    ),
    queryFn: () => resolveHandle(brandCode!, modelCode!, yearCode!),
    enabled: Boolean(brandCode && modelCode && yearCode),
    staleTime: ONE_DAY,
  });
}

/* --------------------------------------------------- batch (favoritos/ranking) */

/**
 * Fetch many vehicles in parallel. Each one is cached individually by FIPE
 * code, so revisiting a list of favourites costs zero network calls after
 * the first load.
 */
export function useVehiclesBatch(fipeCodes: string[]) {
  return useQueries({
    queries: fipeCodes.map((fipeCode) => ({
      queryKey: queryKeys.vehicle(fipeCode),
      queryFn: () => fetchVehicle(fipeCode),
      staleTime: ONE_DAY,
    })),
    combine: (results) => ({
      data: results
        .map((r) => r.data)
        .filter((v): v is NonNullable<typeof v> => Boolean(v)),
      isLoading: results.some((r) => r.isLoading),
      isError: results.some((r) => r.isError),
      errors: results.filter((r) => r.isError).map((r) => r.error),
    }),
  });
}
