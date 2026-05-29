"use client";

import { useMemo, useState } from "react";
import { simulateFinancing } from "@/lib/finance";
import { formatBRL, formatPct } from "@/lib/format";
import { MonoNumber } from "./mono-number";

type Props = {
  cashPrice: number;
  annualDepreciationPct: number;
};

const MONTH_OPTIONS = [12, 24, 36, 48, 60];

export function FinanceSimulator({ cashPrice, annualDepreciationPct }: Props) {
  const [downPayment, setDownPayment] = useState(() =>
    Math.round(cashPrice * 0.2),
  );
  const [months, setMonths] = useState(48);
  const [rate, setRate] = useState(1.8); // % a.m. típica

  const result = useMemo(
    () =>
      simulateFinancing({
        cashPrice,
        downPayment: Math.min(downPayment, cashPrice),
        months,
        monthlyRatePct: rate,
        annualDepreciationPct,
      }),
    [cashPrice, downPayment, months, rate, annualDepreciationPct],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Entrada">
          <CurrencyInput
            value={downPayment}
            onChange={(v) => setDownPayment(Math.max(0, Math.min(v, cashPrice)))}
          />
        </Field>

        <Field label="Parcelas">
          <div className="flex flex-wrap gap-1.5">
            {MONTH_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={`px-2.5 py-1.5 rounded font-mono text-xs transition-colors ${
                  months === m
                    ? "bg-[#3B82F6] text-[#FAFAFA]"
                    : "bg-white/[0.04] text-[#A1A1AA] hover:text-[#FAFAFA]"
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
        </Field>

        <Field label="Juros (% a.m.)">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.5}
              max={3.5}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="flex-1 accent-[#3B82F6]"
              aria-label="Taxa de juros mensal"
            />
            <span className="font-mono text-sm text-[#FAFAFA] w-12 text-right">
              {rate.toFixed(1).replace(".", ",")}%
            </span>
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/[0.06]">
        <Stat label="Parcela" value={formatBRL(result.monthlyPayment)} accent />
        <Stat label="Total pago" value={formatBRL(result.totalPaid)} />
        <Stat
          label="Juros totais"
          value={formatBRL(result.totalInterest)}
          tone="caution"
        />
        <Stat
          label={`Valor após ${months}m`}
          value={formatBRL(result.residualValue)}
        />
      </div>

      <div className="bg-gradient-to-br from-[#3B82F6]/10 to-transparent border border-[#3B82F6]/20 rounded-lg p-5">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <span className="text-sm text-[#A1A1AA]">
            Custo real do período{" "}
            <span className="text-[#52525B]">(pago − valor residual)</span>
          </span>
          <span className="flex items-baseline gap-2">
            <MonoNumber
              value={result.realCost}
              kind="brl"
              className="text-2xl font-semibold text-[#FAFAFA]"
            />
            <span className="font-mono text-sm text-[#F59E0B]">
              {formatPct(result.realCostPct)}
            </span>
          </span>
        </div>
        <p className="text-xs text-[#52525B] mt-2">
          Quanto esse carro terá custado de fato ao fim do financiamento, somando
          juros e depreciação. Manutenção e seguro não incluídos.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-mono text-[#52525B] uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  );
}

function CurrencyInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center bg-white/[0.04] rounded px-3 py-1.5">
      <span className="font-mono text-sm text-[#52525B] mr-1">R$</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent font-mono text-sm text-[#FAFAFA] outline-none"
        aria-label="Valor da entrada em reais"
      />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: "caution";
}) {
  const color = accent
    ? "text-[#3B82F6]"
    : tone === "caution"
      ? "text-[#F59E0B]"
      : "text-[#FAFAFA]";
  return (
    <div>
      <p className="text-xs text-[#52525B] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`font-mono text-base font-semibold ${color}`}>{value}</p>
    </div>
  );
}
