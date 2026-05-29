/**
 * Curated list of FIPE codes pre-rendered at build time (SSG).
 *
 * Every code here gets a fully static `/carro/[fipeCode]` page + OG image.
 * Adding/removing entries here directly changes the build-time API budget
 * (each ficha = N+1 fipe.fetchDetailByFipeCode calls, ≈ 7).
 *
 * All codes verified live against `fipe.parallelum.com.br/api/v2` (May 2026).
 */

export type FeaturedEntry = {
  fipeCode: string;
  /** Year code FIPE returns for the most recent model year. */
  primaryYearCode: string;
  /** Human label — only used in dev/debug, never user-facing. */
  label: string;
};

export const FEATURED_VEHICLES: FeaturedEntry[] = [
  { fipeCode: "002201-2", primaryYearCode: "2024-5", label: "Toyota Corolla Cross XR" },
  { fipeCode: "014112-7", primaryYearCode: "2024-6", label: "Honda Civic Touring Híbrido" },
  { fipeCode: "005534-4", primaryYearCode: "2024-5", label: "VW Polo TSI" },
  { fipeCode: "005509-3", primaryYearCode: "2024-5", label: "VW T-Cross Comfort" },
  { fipeCode: "004511-0", primaryYearCode: "2024-5", label: "Chevrolet Onix Turbo" },
  { fipeCode: "001546-6", primaryYearCode: "2024-5", label: "Fiat Pulse Impetus Turbo" },
  { fipeCode: "001516-4", primaryYearCode: "2024-3", label: "Fiat Toro Ranch Diesel 4x4" },
  { fipeCode: "017093-3", primaryYearCode: "2024-5", label: "Jeep Commander Longitude" },
  { fipeCode: "015244-7", primaryYearCode: "2024-5", label: "Hyundai Creta Comfort Plus" },
  { fipeCode: "095007-6", primaryYearCode: "2024-4", label: "BYD Dolphin EV" },
  { fipeCode: "003507-6", primaryYearCode: "2024-1", label: "Ford Mustang GT Performance" },
];

export const FEATURED_FIPE_CODES = FEATURED_VEHICLES.map((v) => v.fipeCode);
