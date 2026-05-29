import catalog from "./vehicles-index.json";
import { FEATURED_VEHICLES } from "@/lib/featured";

export type VehicleOption = { value: string; label: string };

type CatalogEntry = { fipeCode: string; brand: string; model: string };

const catalogVehicles = (catalog as { vehicles: CatalogEntry[] }).vehicles;

/**
 * Lightweight {value,label} list of every vehicle we can offer for comparison /
 * selection — the harvested catalog (~330) plus any featured codes not in it.
 *
 * It's just labels + FIPE codes (no prices/enrichment), so importing it on the
 * client is cheap. The full data for a chosen vehicle is fetched on demand via
 * useVehicle(fipeCode).
 */
export const VEHICLE_OPTIONS: VehicleOption[] = (() => {
  const byCode = new Map<string, VehicleOption>();

  for (const v of catalogVehicles) {
    byCode.set(v.fipeCode, {
      value: v.fipeCode,
      label: `${v.brand} ${v.model}`,
    });
  }
  // Ensure featured cars are always selectable even if not in the catalog harvest.
  for (const f of FEATURED_VEHICLES) {
    if (!byCode.has(f.fipeCode)) {
      byCode.set(f.fipeCode, { value: f.fipeCode, label: f.label });
    }
  }

  return [...byCode.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "pt-BR"),
  );
})();
