"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DottedHeader } from "@/components/dotted-header";
import { BackLink } from "@/components/back-link";
import { SearchableSelect } from "@/components/searchable-select";
import {
  useBrands,
  useModels,
  useYears,
  useResolveHandle,
} from "@/lib/queries/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuscarPage() {
  const router = useRouter();
  const [brandCode, setBrandCode] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [yearCode, setYearCode] = useState("");

  const brandsQ = useBrands();
  const modelsQ = useModels(brandCode || undefined);
  const yearsQ = useYears(brandCode || undefined, modelCode || undefined);
  const handleQ = useResolveHandle(
    brandCode || undefined,
    modelCode || undefined,
    yearCode || undefined,
  );

  function handleBrandChange(value: string) {
    setBrandCode(value);
    setModelCode("");
    setYearCode("");
  }

  function handleModelChange(value: string) {
    setModelCode(value);
    setYearCode("");
  }

  // Prefetch the ficha route as soon as the FIPE code resolves.
  useEffect(() => {
    if (handleQ.data) {
      router.prefetch(`/carro/${handleQ.data.fipeCode}`);
    }
  }, [handleQ.data, router]);

  const ready = Boolean(handleQ.data);
  const resolving = Boolean(yearCode) && handleQ.isLoading;

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-12">
        <BackLink href="/" label="Voltar ao início" />
        <div className="space-y-4">
          <DottedHeader>Buscar veículo</DottedHeader>
          <h1 className="text-4xl font-semibold text-[#FAFAFA] tracking-tight">
            Buscar veículo
          </h1>
          <p className="text-[#A1A1AA]">
            Selecione marca, modelo e ano. Em segundos você tem a ficha
            completa.
          </p>
        </div>

        <div className="space-y-6">
          <SelectField
            label="Marca"
            placeholder="Selecione a marca"
            value={brandCode}
            onChange={handleBrandChange}
            options={(brandsQ.data ?? []).map((b) => ({
              value: b.code,
              label: b.name,
            }))}
            loading={brandsQ.isLoading}
            disabled={false}
          />

          <SelectField
            label="Modelo"
            placeholder={
              brandCode ? "Selecione o modelo" : "Primeiro selecione a marca"
            }
            value={modelCode}
            onChange={handleModelChange}
            options={(modelsQ.data ?? []).map((m) => ({
              value: m.code,
              label: m.name,
            }))}
            loading={modelsQ.isLoading && Boolean(brandCode)}
            disabled={!brandCode}
          />

          <SelectField
            label="Ano / Combustível"
            placeholder={
              modelCode
                ? "Selecione ano e combustível"
                : "Primeiro selecione o modelo"
            }
            value={yearCode}
            onChange={setYearCode}
            options={(yearsQ.data ?? []).map((y) => ({
              value: y.code,
              label: y.name,
            }))}
            loading={yearsQ.isLoading && Boolean(modelCode)}
            disabled={!modelCode}
            monoLabel
          />

          {yearCode && (
            <>
              {ready && handleQ.data ? (
                <Link
                  href={`/carro/${handleQ.data.fipeCode}`}
                  prefetch
                  className="inline-flex items-center justify-center w-full px-8 py-4 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#FAFAFA] font-medium rounded-lg transition-colors"
                >
                  Ver ficha →
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center w-full px-8 py-4 bg-[#3B82F6]/60 text-[#FAFAFA] font-medium rounded-lg cursor-wait"
                >
                  {resolving ? "Resolvendo código FIPE…" : "Aguardando…"}
                </button>
              )}
              {handleQ.isError && (
                <p className="text-sm text-[#EF4444] font-mono text-center">
                  Não foi possível resolver esse veículo. Tente novamente.
                </p>
              )}
            </>
          )}
        </div>

        <p className="font-mono text-xs text-[#52525B] text-center">
          Catálogo: ~100 marcas · ~75.000 versões · dados FIPE atualizados
          mensalmente
        </p>

        <div className="text-center">
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

type SelectFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  loading: boolean;
  disabled: boolean;
  monoLabel?: boolean;
};

function SelectField({
  label,
  placeholder,
  value,
  onChange,
  options,
  loading,
  disabled,
  monoLabel,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-mono text-[#52525B] uppercase tracking-wider">
        {label}
      </label>
      {loading ? (
        <Skeleton className="h-10 w-full bg-[#0A0A0A] border border-white/[0.06]" />
      ) : (
        <SearchableSelect
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          disabled={disabled}
          mono={monoLabel}
        />
      )}
    </div>
  );
}
