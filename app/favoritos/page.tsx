"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useWatchlist } from "@/lib/stores/watchlist";
import { DottedHeader } from "@/components/dotted-header";
import { BackLink } from "@/components/back-link";
import { VehicleCard } from "@/components/vehicle-card";

export default function FavoritosPage() {
  const vehicles = useWatchlist((s) => s.vehicles);
  const clear = useWatchlist((s) => s.clear);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: localStorage is only available after mount.
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <BackLink href="/" label="Voltar ao início" />
        <div className="space-y-4">
          <DottedHeader>Favoritos</DottedHeader>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#FAFAFA] tracking-tight">
            Veículos salvos
          </h1>
          <p className="text-[#A1A1AA]">
            Carros que você está acompanhando. Lista local — salva no seu
            dispositivo.
          </p>
        </div>

        {!mounted ? (
          <p className="text-[#52525B] font-mono text-sm">Carregando…</p>
        ) : vehicles.length === 0 ? (
          <div className="bg-[#0A0A0A] border-2 border-dashed border-white/[0.06] rounded-lg p-12 text-center space-y-4">
            <p className="text-[#A1A1AA]">
              Você ainda não salvou nenhum veículo.
            </p>
            <Link
              href="/buscar"
              className="inline-flex items-center justify-center px-6 py-3 border border-[#3B82F6] text-[#60A5FA] hover:bg-[#3B82F6]/10 font-medium rounded-lg transition-colors"
            >
              Buscar um veículo →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <VehicleCard key={v.fipeCode} vehicle={v} variant="compact" />
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-2 text-sm text-[#52525B] hover:text-[#EF4444] transition-colors"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Limpar lista
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
