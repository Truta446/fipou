/**
 * Pure financial math for the financing simulator and cost-of-ownership.
 * No dependencies, no I/O — safe on client and server.
 */

/** Tabela Price monthly payment (PMT). */
export function monthlyPayment(
  principal: number,
  monthlyRatePct: number,
  months: number,
): number {
  if (months <= 0) return 0;
  const i = monthlyRatePct / 100;
  if (i === 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
}

export type FinancingResult = {
  financed: number;
  monthlyPayment: number;
  totalPaid: number; // entrada + parcelas
  totalInterest: number;
  residualValue: number; // valor FIPE estimado ao fim do contrato
  realCost: number; // totalPaid - residualValue
  realCostPct: number; // realCost / preço à vista
};

/**
 * Simulate financing a car and project its residual FIPE value at the end of
 * the contract using the model's annual depreciation rate.
 */
export function simulateFinancing(params: {
  cashPrice: number;
  downPayment: number;
  months: number;
  monthlyRatePct: number;
  annualDepreciationPct: number;
}): FinancingResult {
  const { cashPrice, downPayment, months, monthlyRatePct, annualDepreciationPct } =
    params;
  const financed = Math.max(0, cashPrice - downPayment);
  const pmt = monthlyPayment(financed, monthlyRatePct, months);
  const totalParcelas = pmt * months;
  const totalPaid = downPayment + totalParcelas;
  const totalInterest = totalParcelas - financed;

  const years = months / 12;
  const residualValue =
    cashPrice * Math.pow(1 - annualDepreciationPct / 100, years);

  const realCost = totalPaid - residualValue;

  return {
    financed,
    monthlyPayment: pmt,
    totalPaid,
    totalInterest,
    residualValue,
    realCost,
    realCostPct: cashPrice > 0 ? (realCost / cashPrice) * 100 : 0,
  };
}

export type OwnershipCost = {
  fuelPerYear: number;
  depreciationPerYear: number;
  opportunityPerYear: number;
  totalPerYear: number;
  totalPerMonth: number;
};

/**
 * Annual cost of keeping the car: fuel + depreciation + opportunity cost of the
 * capital tied up (benchmarked to Selic). Maintenance/insurance are out of scope
 * (no data source yet) and intentionally excluded.
 */
export function ownershipCost(params: {
  cashPrice: number;
  annualDepreciationPct: number;
  kmPerYear: number;
  fuelPricePerLiter: number;
  kmPerLiter: number | null;
  selicPct: number | null;
}): OwnershipCost {
  const {
    cashPrice,
    annualDepreciationPct,
    kmPerYear,
    fuelPricePerLiter,
    kmPerLiter,
    selicPct,
  } = params;

  const fuelPerYear =
    kmPerLiter && kmPerLiter > 0
      ? (kmPerYear / kmPerLiter) * fuelPricePerLiter
      : 0;
  const depreciationPerYear = cashPrice * (annualDepreciationPct / 100);
  const opportunityPerYear =
    selicPct && selicPct > 0 ? cashPrice * (selicPct / 100) : 0;

  const totalPerYear = fuelPerYear + depreciationPerYear + opportunityPerYear;

  return {
    fuelPerYear,
    depreciationPerYear,
    opportunityPerYear,
    totalPerYear,
    totalPerMonth: totalPerYear / 12,
  };
}
