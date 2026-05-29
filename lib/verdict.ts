import type { Vehicle } from "@/lib/api/types";
import { calculateRetention4y, calculateAnnualLoss } from "./analytics";
import { formatNumber } from "./format";

export type VerdictSymbol = "✓" | "⚠" | "✕";

export type VerdictLine = {
  symbol: VerdictSymbol;
  text: string;
};

function fmt(value: number, decimals = 1): string {
  return formatNumber(value, decimals);
}

function fmtSigned(value: number, decimals = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatNumber(Math.abs(value), decimals)}`;
}

/** Optional macro context to enrich the verdict with an opportunity-cost line. */
export type VerdictContext = {
  /** Selic target rate (% a.a.) — the risk-free benchmark a buyer's cash could earn. */
  selic?: number;
};

export function generateVerdict(
  vehicle: Vehicle,
  context?: VerdictContext,
): VerdictLine[] {
  const lines: VerdictLine[] = [];

  const retention = calculateRetention4y(vehicle);
  const retentionDiff = retention - vehicle.segmentRetention4yPct;

  // Retention vs segment
  if (retentionDiff > 5) {
    lines.push({
      symbol: "✓",
      text: `Retém valor acima da média do segmento (${fmtSigned(retentionDiff)} p.p.)`,
    });
  } else if (retentionDiff >= -2) {
    lines.push({
      symbol: "⚠",
      text: "Retenção de valor na média do segmento",
    });
  } else {
    lines.push({
      symbol: "✕",
      text: `Retém valor abaixo da média do segmento (${fmtSigned(retentionDiff)} p.p.)`,
    });
  }

  // Recalls
  if (vehicle.activeRecalls.length === 0) {
    lines.push({
      symbol: "✓",
      text: "Sem recalls ativos",
    });
  } else {
    const highSeverity = vehicle.activeRecalls.filter(
      (r) => r.severity === "alta",
    ).length;
    const total = vehicle.activeRecalls.length;
    const plural = total === 1 ? "recall ativo" : "recalls ativos";
    if (highSeverity > 0) {
      lines.push({
        symbol: "✕",
        text: `${total} ${plural}, ${highSeverity} de alta severidade`,
      });
    } else {
      lines.push({
        symbol: "⚠",
        text: `${total} ${plural}`,
      });
    }
  }

  // Theft
  if (vehicle.theftRank) {
    if (vehicle.theftRank.rank <= 10) {
      lines.push({
        symbol: "✕",
        text: `Top ${vehicle.theftRank.rank} em furtos no estado de ${vehicle.theftRank.state} (${vehicle.theftRank.year})`,
      });
    } else if (vehicle.theftRank.rank <= 30) {
      lines.push({
        symbol: "⚠",
        text: `Top ${vehicle.theftRank.rank} em furtos no estado de ${vehicle.theftRank.state} (${vehicle.theftRank.year})`,
      });
    } else {
      lines.push({
        symbol: "✓",
        text: `Baixo índice de roubo em ${vehicle.theftRank.state}`,
      });
    }
  } else {
    lines.push({
      symbol: "✓",
      text: "Fora do top 100 de furtos — baixo risco",
    });
  }

  // Fuel economy
  if (vehicle.fuelEconomyKmL) {
    const avgCity =
      vehicle.segment === "SUV"
        ? 10.5
        : vehicle.segment === "Sedan"
          ? 11.2
          : vehicle.segment === "Pickup"
            ? 9.5
            : 12.0;

    if (vehicle.fuelEconomyKmL.city > avgCity) {
      lines.push({
        symbol: "✓",
        text: `Consumo ${fmt(vehicle.fuelEconomyKmL.city)} km/l — acima da média da categoria`,
      });
    } else if (vehicle.fuelEconomyKmL.city >= avgCity - 1) {
      lines.push({
        symbol: "⚠",
        text: `Consumo ${fmt(vehicle.fuelEconomyKmL.city)} km/l — na média da categoria`,
      });
    } else {
      lines.push({
        symbol: "✕",
        text: `Consumo ${fmt(vehicle.fuelEconomyKmL.city)} km/l — abaixo da média da categoria`,
      });
    }
  } else if (vehicle.fuel === "Elétrico") {
    lines.push({
      symbol: "✓",
      text: "Veículo elétrico — zero emissões e baixo custo por km",
    });
  }

  // Annual loss
  const annualLoss = calculateAnnualLoss(vehicle);
  if (annualLoss < 7) {
    lines.push({
      symbol: "✓",
      text: `Perda anual de apenas ${fmt(annualLoss)}% — excelente`,
    });
  } else if (annualLoss <= 10) {
    lines.push({
      symbol: "⚠",
      text: `Perda anual de ${fmt(annualLoss)}% — dentro do esperado`,
    });
  }

  // Opportunity cost vs the risk-free rate (Selic), when available.
  // Both figures are real-terms %/year, so the comparison is fair.
  if (context?.selic && context.selic > 0) {
    lines.push({
      symbol: annualLoss > context.selic ? "✕" : "⚠",
      text: `Deprecia ${fmt(annualLoss)}% a.a. enquanto a Selic rende ${fmt(context.selic)}% a.a. — considere o custo de oportunidade`,
    });
  }

  return lines;
}
