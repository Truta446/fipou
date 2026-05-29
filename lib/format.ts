export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatKmL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value) + ' km/l';
}

export function formatYear(value: number): string {
  return value.toString();
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format an ISO date string (e.g. "2024-03-15") as Brazilian DD/MM/YYYY.
 * Returns the original string if it cannot be parsed.
 */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

/**
 * Format a date as a long Brazilian month + year reference (e.g. "maio de 2026").
 * Matches the FIPE "referenceMonth" string from the API.
 */
export function formatReferenceMonth(value: Date = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(value);
}

/**
 * Parse a BR-formatted FIPE price string (e.g. "R$ 125.092,00") back to a number
 * in BRL cents-truncated form (125092). Returns NaN if the input is unparseable.
 */
export function parsePriceBRL(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return NaN;
  const cleaned = String(value)
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n) : NaN;
}
