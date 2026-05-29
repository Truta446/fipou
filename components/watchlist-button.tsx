"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useWatchlist } from "@/lib/stores/watchlist";
import type { Vehicle } from "@/lib/api/types";

type Props = {
  vehicle: Vehicle;
  label?: string;
  className?: string;
};

export function WatchlistButton({ vehicle, label, className = "" }: Props) {
  const toggle = useWatchlist((s) => s.toggle);
  const has = useWatchlist((s) =>
    s.vehicles.some((v) => v.fipeCode === vehicle.fipeCode),
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const active = mounted && has;

  return (
    <button
      type="button"
      onClick={() => toggle(vehicle)}
      aria-pressed={active}
      aria-label={active ? "Remover dos favoritos" : "Salvar nos favoritos"}
      className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-medium transition-colors ${
        active
          ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#60A5FA]"
          : "border-white/[0.06] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-white/[0.12]"
      } ${className}`}
    >
      {active ? (
        <BookmarkCheck className="h-4 w-4" aria-hidden />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden />
      )}
      <span>{label ?? (active ? "Salvo" : "Salvar")}</span>
    </button>
  );
}
