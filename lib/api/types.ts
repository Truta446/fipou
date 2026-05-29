/**
 * Domain types shared between the FIPE catalogue layer and the UI.
 *
 * Fields directly sourced from the FIPE API are required.
 * Enrichment fields (segment, fuel economy, recalls, theft rank, segment retention)
 * come from external open-data sources (Senacon, INMETRO, Susep) and currently
 * fall back to a curated table in `lib/enrichment.ts`.
 */

export type Segment = "Sedan" | "SUV" | "Hatch" | "Pickup" | "Coupe";
export type Fuel = "Flex" | "Gasolina" | "Diesel" | "Elétrico" | "Híbrido";

export type Brand = { code: string; name: string };
export type Model = { code: string; name: string };
export type Year = { code: string; name: string };

export type PricePoint = { modelYear: number; priceBRL: number };

export type Recall = {
  date: string;
  summary: string;
  severity: "alta" | "média" | "baixa";
};

export type TheftRank = { state: string; rank: number; year: number };

export type FuelEconomy = { city: number; road: number };

/** Enrichment data that does NOT come from FIPE — currently mocked, will move to Senacon/INMETRO/Susep. */
export type VehicleEnrichment = {
  segment: Segment;
  fuelEconomyKmL?: FuelEconomy;
  activeRecalls: Recall[];
  theftRank?: TheftRank;
  segmentRetention4yPct: number;
};

/** A full vehicle profile: real FIPE data + enrichment fallback. */
export type Vehicle = {
  fipeCode: string;
  brand: string;
  model: string;
  fuel: Fuel;
  zeroKmPriceBRL: number;
  prices: PricePoint[];
  referenceMonth: string;
} & VehicleEnrichment;

/** What the cascading search page needs to enable the "Ver ficha" button. */
export type VehicleHandle = {
  fipeCode: string;
  brandCode: string;
  modelCode: string;
  yearCode: string;
  fuel: string;
};
