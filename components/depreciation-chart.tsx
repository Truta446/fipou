"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle } from "@/lib/api/types";

const ChartInternal = dynamic(
  () =>
    import("./depreciation-chart-internal").then(
      (m) => m.DepreciationChartInternal,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-64 w-full bg-white/[0.02] rounded animate-pulse"
        aria-label="Carregando gráfico de depreciação"
      />
    ),
  },
);

export function DepreciationChart({
  vehicle,
  className,
}: {
  vehicle: Vehicle;
  className?: string;
}) {
  return <ChartInternal vehicle={vehicle} className={className} />;
}
