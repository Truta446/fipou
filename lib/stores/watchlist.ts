"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Vehicle } from "@/lib/api/types";

/**
 * Watchlist persisted in localStorage (key "fipou:watchlist").
 *
 * We store a full snapshot of each saved Vehicle — NOT just the FIPE code — so
 * the favorites page renders instantly with zero network calls (and works
 * offline). The snapshot is small (price array + enrichment) and refreshed
 * whenever the user opens that car's ficha again and re-saves.
 */
type WatchlistState = {
  vehicles: Vehicle[];
  /** Add if absent, remove if present. */
  toggle: (vehicle: Vehicle) => void;
  has: (fipeCode: string) => boolean;
  remove: (fipeCode: string) => void;
  clear: () => void;
};

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      toggle: (vehicle) =>
        set((state) => ({
          vehicles: state.vehicles.some((v) => v.fipeCode === vehicle.fipeCode)
            ? state.vehicles.filter((v) => v.fipeCode !== vehicle.fipeCode)
            : [...state.vehicles, vehicle],
        })),
      has: (fipeCode) => get().vehicles.some((v) => v.fipeCode === fipeCode),
      remove: (fipeCode) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.fipeCode !== fipeCode),
        })),
      clear: () => set({ vehicles: [] }),
    }),
    {
      name: "fipou:watchlist",
      storage: createJSONStorage(() => localStorage),
      // v2: schema changed from fipeCodes[] to vehicles[]. Drop old data.
      version: 2,
      migrate: () => ({ vehicles: [] }) as Partial<WatchlistState>,
    },
  ),
);
