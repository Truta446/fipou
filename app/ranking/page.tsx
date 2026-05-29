"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  calculateRetention4y,
  calculateAnnualLoss,
} from "@/lib/analytics";
import type { Segment } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";
import { DottedHeader } from "@/components/dotted-header";
import { BackLink } from "@/components/back-link";
import { MonoNumber } from "@/components/mono-number";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVehiclesBatch } from "@/lib/queries/hooks";
import { FEATURED_FIPE_CODES } from "@/lib/featured";
import { Skeleton } from "@/components/ui/skeleton";

const segments: (Segment | "Todos")[] = [
  "Todos",
  "Sedan",
  "SUV",
  "Hatch",
  "Pickup",
  "Coupe",
];

function RetentionBar({ value }: { value: number }) {
  const filled = Math.max(0, Math.min(10, Math.round((value / 100) * 10)));
  const empty = 10 - filled;
  return (
    <span
      className="font-mono text-[#22D3EE]"
      aria-label={`Retenção de ${formatNumber(value, 1)} por cento`}
    >
      {"█".repeat(filled)}
      <span className="text-[#52525B]">{"░".repeat(empty)}</span>
    </span>
  );
}

export default function RankingPage() {
  const [selectedSegment, setSelectedSegment] = useState<Segment | "Todos">(
    "Todos",
  );
  const { data: vehicles, isLoading } = useVehiclesBatch(FEATURED_FIPE_CODES);

  const rankedVehicles = useMemo(() => {
    const list = selectedSegment === "Todos"
      ? vehicles
      : vehicles.filter((v) => v.segment === selectedSegment);
    return list
      .map((v) => ({
        ...v,
        retention: calculateRetention4y(v),
        annualLoss: calculateAnnualLoss(v),
      }))
      .sort((a, b) => b.retention - a.retention);
  }, [vehicles, selectedSegment]);

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <BackLink href="/" label="Voltar ao início" />
        <div className="space-y-4">
          <DottedHeader>Ranking</DottedHeader>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#FAFAFA] tracking-tight">
            Ranking de depreciação
          </h1>
          <p className="text-[#A1A1AA]">
            Quem mantém valor e quem perde rápido. Atualizado mensalmente com
            base na tabela FIPE.
          </p>
        </div>

        <Tabs
          value={selectedSegment}
          onValueChange={(v) => setSelectedSegment(v as Segment | "Todos")}
          className="w-full"
        >
          <TabsList className="bg-[#0A0A0A] border border-white/[0.06] p-1 flex-wrap h-auto">
            {segments.map((segment) => (
              <TabsTrigger
                key={segment}
                value={segment}
                className="data-[state=active]:bg-[#3B82F6] data-[state=active]:text-[#FAFAFA] text-[#A1A1AA]"
              >
                {segment}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <caption className="sr-only">
                Ranking de retenção de valor por segmento
              </caption>
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-4 text-left text-xs font-mono text-[#52525B] uppercase tracking-wider"
                  >
                    Pos
                  </th>
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-4 text-left text-xs font-mono text-[#52525B] uppercase tracking-wider"
                  >
                    Veículo
                  </th>
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-4 text-left text-xs font-mono text-[#52525B] uppercase tracking-wider hidden md:table-cell"
                  >
                    Segmento
                  </th>
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-4 text-left text-xs font-mono text-[#52525B] uppercase tracking-wider"
                  >
                    Retenção
                  </th>
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-4 text-left text-xs font-mono text-[#52525B] uppercase tracking-wider hidden sm:table-cell"
                  >
                    Perda anual
                  </th>
                  <th scope="col" className="px-4 md:px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {isLoading && rankedVehicles.length === 0
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/[0.06]">
                        <td colSpan={6} className="px-4 md:px-6 py-4">
                          <Skeleton className="h-6 w-full bg-white/[0.03]" />
                        </td>
                      </tr>
                    ))
                  : rankedVehicles.map((vehicle, index) => (
                      <tr
                        key={vehicle.fipeCode}
                        className="border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 md:px-6 py-4 font-mono text-[#A1A1AA]">
                          {index + 1}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div>
                            <span className="text-[#FAFAFA]">
                              {vehicle.brand}
                            </span>
                            <span className="text-[#A1A1AA] ml-2 text-sm hidden lg:inline">
                              {vehicle.model}
                            </span>
                            <p className="text-[#A1A1AA] text-sm lg:hidden">
                              {vehicle.model}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-[#52525B] hidden md:table-cell">
                          {vehicle.segment}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <RetentionBar value={vehicle.retention} />
                            <MonoNumber
                              value={vehicle.retention}
                              kind="pct"
                              className="text-[#10B981]"
                            />
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                          <MonoNumber
                            value={vehicle.annualLoss}
                            kind="pct"
                            className="text-[#A1A1AA]"
                          />
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <Link
                            href={`/carro/${vehicle.fipeCode}`}
                            prefetch
                            className="text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium transition-colors"
                          >
                            Ficha
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="font-mono text-xs text-[#52525B] text-center">
          Ranking atual baseado em {FEATURED_FIPE_CODES.length} veículos
          populares · expansão automática quando o snapshot mensal entrar no ar
        </p>

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
