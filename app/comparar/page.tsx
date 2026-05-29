"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import {
  calculateRetention4y,
  calculateAnnualLoss,
  getCurrentPrice,
} from "@/lib/analytics";
import { fipouScore, scoreColor } from "@/lib/score";
import { formatBRL, formatPct, formatNumber } from "@/lib/format";
import type { Vehicle } from "@/lib/api/types";
import { DottedHeader } from "@/components/dotted-header";
import { BackLink } from "@/components/back-link";
import { VehicleCard } from "@/components/vehicle-card";
import { SearchableSelect } from "@/components/searchable-select";
import { useVehicle, useVehiclesBatch } from "@/lib/queries/hooks";
import { FEATURED_FIPE_CODES } from "@/lib/featured";
import { Skeleton } from "@/components/ui/skeleton";

type Row = {
  label: string;
  a: string;
  b: string;
  /** -1 → A wins, 1 → B wins, 0 → tie/neutral. */
  winner: -1 | 0 | 1;
  hint?: string;
};

function buildRows(a: Vehicle, b: Vehicle): Row[] {
  const priceA = getCurrentPrice(a);
  const priceB = getCurrentPrice(b);
  const retA = calculateRetention4y(a);
  const retB = calculateRetention4y(b);
  const lossA = calculateAnnualLoss(a);
  const lossB = calculateAnnualLoss(b);
  const scoreA = fipouScore(a).score;
  const scoreB = fipouScore(b).score;
  const theftA = a.theftRank?.rank ?? 999;
  const theftB = b.theftRank?.rank ?? 999;
  const ecoA = a.fuelEconomyKmL?.city ?? 0;
  const ecoB = b.fuelEconomyKmL?.city ?? 0;

  const cmp = (x: number, y: number, higherBetter: boolean): -1 | 0 | 1 => {
    if (x === y) return 0;
    const aWins = higherBetter ? x > y : x < y;
    return aWins ? -1 : 1;
  };

  return [
    {
      label: "Fipou Score",
      a: String(scoreA),
      b: String(scoreB),
      winner: cmp(scoreA, scoreB, true),
    },
    {
      label: "Preço FIPE",
      a: formatBRL(priceA),
      b: formatBRL(priceB),
      winner: cmp(priceA, priceB, false),
      hint: "menor preço",
    },
    {
      label: "Retenção de valor",
      a: formatPct(retA),
      b: formatPct(retB),
      winner: cmp(retA, retB, true),
    },
    {
      label: "Perda anual",
      a: formatPct(lossA),
      b: formatPct(lossB),
      winner: cmp(lossA, lossB, false),
    },
    {
      label: "Recalls ativos",
      a: String(a.activeRecalls.length),
      b: String(b.activeRecalls.length),
      winner: cmp(a.activeRecalls.length, b.activeRecalls.length, false),
    },
    {
      label: "Risco de roubo",
      a: a.theftRank ? `#${a.theftRank.rank} ${a.theftRank.state}` : "fora do top",
      b: b.theftRank ? `#${b.theftRank.rank} ${b.theftRank.state}` : "fora do top",
      winner: cmp(theftA, theftB, true), // rank maior (ou ausente) = mais seguro
    },
    {
      label: "Consumo cidade",
      a: a.fuelEconomyKmL ? `${formatNumber(ecoA, 1)} km/l` : "—",
      b: b.fuelEconomyKmL ? `${formatNumber(ecoB, 1)} km/l` : "—",
      winner: ecoA && ecoB ? cmp(ecoA, ecoB, true) : 0,
    },
  ];
}

function CompararContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeA = searchParams.get("a") ?? "";
  const codeB = searchParams.get("b") ?? "";

  const optionsQ = useVehiclesBatch(FEATURED_FIPE_CODES);
  const vehicleA = useVehicle(codeA || undefined).data;
  const vehicleB = useVehicle(codeB || undefined).data;

  function setSide(side: "a" | "b", code: string) {
    const params = new URLSearchParams(searchParams);
    if (code) params.set(side, code);
    else params.delete(side);
    router.replace(`/comparar?${params.toString()}`, { scroll: false });
  }

  const options = useMemo(
    () =>
      optionsQ.data.map((v) => ({
        value: v.fipeCode,
        label: `${v.brand} ${v.model}`,
      })),
    [optionsQ.data],
  );

  const rows = useMemo(
    () => (vehicleA && vehicleB ? buildRows(vehicleA, vehicleB) : null),
    [vehicleA, vehicleB],
  );

  const tally = useMemo(() => {
    if (!rows) return null;
    let a = 0;
    let b = 0;
    for (const r of rows) {
      if (r.winner === -1) a++;
      else if (r.winner === 1) b++;
    }
    return { a, b };
  }, [rows]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Side
          vehicle={vehicleA}
          options={options}
          loading={optionsQ.isLoading}
          placeholder="Selecione o primeiro veículo"
          onChoose={(c) => setSide("a", c)}
          onClear={() => setSide("a", "")}
        />
        <Side
          vehicle={vehicleB}
          options={options}
          loading={optionsQ.isLoading}
          placeholder="Selecione o segundo veículo"
          onChoose={(c) => setSide("b", c)}
          onClear={() => setSide("b", "")}
        />
      </div>

      {rows && vehicleA && vehicleB && tally && (
        <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-3 items-center px-4 sm:px-6 py-4 border-b border-white/[0.06]">
            <span className="font-mono text-xs text-[#52525B] uppercase tracking-wider">
              Comparativo
            </span>
            <span className="text-right text-sm font-medium text-[#3B82F6] truncate px-2">
              {vehicleA.brand}
            </span>
            <span className="text-right text-sm font-medium text-[#22D3EE] truncate px-2">
              {vehicleB.brand}
            </span>
          </div>

          {rows.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-3 items-center px-4 sm:px-6 py-3 border-b border-white/[0.04] last:border-b-0"
            >
              <span className="text-sm text-[#A1A1AA]">
                {r.label}
                {r.hint && (
                  <span className="text-[#52525B] text-xs"> · {r.hint}</span>
                )}
              </span>
              <span
                className={`text-right font-mono text-sm px-2 ${
                  r.winner === -1
                    ? "text-[#10B981] font-semibold"
                    : "text-[#A1A1AA]"
                }`}
              >
                {r.a}
                {r.winner === -1 && " ✓"}
              </span>
              <span
                className={`text-right font-mono text-sm px-2 ${
                  r.winner === 1
                    ? "text-[#10B981] font-semibold"
                    : "text-[#A1A1AA]"
                }`}
              >
                {r.b}
                {r.winner === 1 && " ✓"}
              </span>
            </div>
          ))}

          <div className="px-4 sm:px-6 py-4 bg-white/[0.02] flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono text-xs text-[#52525B] uppercase tracking-wider">
              Vencedor
            </span>
            <span className="text-sm">
              {tally.a === tally.b ? (
                <span className="text-[#A1A1AA]">Empate técnico</span>
              ) : tally.a > tally.b ? (
                <span className="text-[#3B82F6] font-semibold">
                  {vehicleA.brand} {vehicleA.model.split(" ")[0]} leva ({tally.a}×
                  {tally.b})
                </span>
              ) : (
                <span className="text-[#22D3EE] font-semibold">
                  {vehicleB.brand} {vehicleB.model.split(" ")[0]} leva ({tally.b}×
                  {tally.a})
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

function Side({
  vehicle,
  options,
  loading,
  placeholder,
  onChoose,
  onClear,
}: {
  vehicle: Vehicle | undefined;
  options: { value: string; label: string }[];
  loading: boolean;
  placeholder: string;
  onChoose: (code: string) => void;
  onClear: () => void;
}) {
  if (vehicle) {
    const { score } = fipouScore(vehicle);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className="font-mono text-xs"
            style={{ color: scoreColor(score) }}
          >
            Fipou Score {score}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-xs text-[#52525B] hover:text-[#FAFAFA] transition-colors"
          >
            <RefreshCw className="h-3 w-3" aria-hidden />
            Trocar
          </button>
        </div>
        <VehicleCard vehicle={vehicle} variant="full" />
      </div>
    );
  }

  if (loading) {
    return (
      <Skeleton className="h-12 w-full bg-[#0A0A0A] border border-white/[0.06]" />
    );
  }

  return (
    <div className="space-y-3">
      <SearchableSelect
        value=""
        onChange={onChoose}
        options={options}
        placeholder={placeholder}
      />
      <div className="bg-[#0A0A0A] border-2 border-dashed border-white/[0.06] rounded-lg p-8 flex items-center justify-center min-h-[280px]">
        <p className="text-[#52525B] text-center text-sm">
          Escolha um veículo para comparar
        </p>
      </div>
    </div>
  );
}

export default function CompararPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <BackLink href="/" label="Voltar ao início" />
        <div className="space-y-4">
          <DottedHeader>Comparar veículos</DottedHeader>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#FAFAFA] tracking-tight">
            Compare dois veículos
          </h1>
          <p className="text-[#A1A1AA]">
            Lado a lado em preço, score, retenção, recalls, roubo e consumo —
            com vencedor por métrica.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-12 bg-[#0A0A0A] border border-white/[0.06]" />
              <Skeleton className="h-12 bg-[#0A0A0A] border border-white/[0.06]" />
            </div>
          }
        >
          <CompararContent />
        </Suspense>

        <div className="text-center pt-8">
          <Link
            href="/"
            className="text-[#A1A1AA] hover:text-[#FAFAFA] text-sm transition-colors"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
