"use client";

import { useMemo, useState } from "react";
import { ownershipCost } from "@/lib/finance";
import { formatBRL } from "@/lib/format";
import { MonoNumber } from "./mono-number";

type Props = {
  cashPrice: number;
  annualDepreciationPct: number;
  /** Combined km/l (city·road blend) or null when unavailable / electric. */
  kmPerLiter: number | null;
  selicPct: number | null;
};

export function CostOfOwnership({
  cashPrice,
  annualDepreciationPct,
  kmPerLiter,
  selicPct,
}: Props) {
  const [kmPerYear, setKmPerYear] = useState(12000);
  const [fuelPrice, setFuelPrice] = useState(6.0);

  const cost = useMemo(
    () =>
      ownershipCost({
        cashPrice,
        annualDepreciationPct,
        kmPerYear,
        fuelPricePerLiter: fuelPrice,
        kmPerLiter,
        selicPct,
      }),
    [cashPrice, annualDepreciationPct, kmPerYear, fuelPrice, kmPerLiter, selicPct],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#52525B] uppercase tracking-wider">
            Quilometragem por ano
          </span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5000}
              max={40000}
              step={1000}
              value={kmPerYear}
              onChange={(e) => setKmPerYear(Number(e.target.value))}
              className="flex-1 accent-[#3B82F6]"
              aria-label="Quilômetros rodados por ano"
            />
            <span className="font-mono text-sm text-[#FAFAFA] w-20 text-right">
              {kmPerYear.toLocaleString("pt-BR")} km
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono text-[#52525B] uppercase tracking-wider">
            Preço do combustível
          </span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={4}
              max={8}
              step={0.1}
              value={fuelPrice}
              onChange={(e) => setFuelPrice(Number(e.target.value))}
              className="flex-1 accent-[#3B82F6]"
              aria-label="Preço do litro de combustível"
            />
            <span className="font-mono text-sm text-[#FAFAFA] w-20 text-right">
              R$ {fuelPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
        <Row
          label="Combustível / ano"
          value={
            kmPerLiter ? formatBRL(cost.fuelPerYear) : "—"
          }
          hint={kmPerLiter ? `${kmPerLiter.toFixed(1).replace(".", ",")} km/l` : "elétrico / sem dado"}
        />
        <Row
          label="Depreciação / ano"
          value={formatBRL(cost.depreciationPerYear)}
          hint={`${annualDepreciationPct.toFixed(1).replace(".", ",")}% a.a.`}
          tone="caution"
        />
        <Row
          label="Custo de oportunidade / ano"
          value={selicPct ? formatBRL(cost.opportunityPerYear) : "—"}
          hint={selicPct ? `Selic ${selicPct.toFixed(1).replace(".", ",")}%` : "—"}
        />
      </div>

      <div className="bg-gradient-to-br from-[#3B82F6]/10 to-transparent border border-[#3B82F6]/20 rounded-lg p-5 flex items-baseline justify-between flex-wrap gap-2">
        <span className="text-sm text-[#A1A1AA]">
          Custo total estimado por mês
        </span>
        <MonoNumber
          value={cost.totalPerMonth}
          kind="brl"
          className="text-2xl font-semibold text-[#FAFAFA]"
        />
      </div>
      <p className="text-xs text-[#52525B]">
        Combustível + depreciação + custo de oportunidade do capital parado.
        Manutenção, seguro e IPVA não incluídos.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "caution";
}) {
  return (
    <div>
      <p className="text-xs text-[#52525B] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`font-mono text-base font-semibold ${
          tone === "caution" ? "text-[#F59E0B]" : "text-[#FAFAFA]"
        }`}
      >
        {value}
      </p>
      <p className="font-mono text-[10px] text-[#52525B] mt-0.5">{hint}</p>
    </div>
  );
}
