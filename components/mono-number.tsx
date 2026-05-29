import { formatBRL, formatPct, formatKmL, formatYear, formatNumber } from '@/lib/format';

type MonoNumberProps = {
  value: number;
  kind: 'brl' | 'pct' | 'kml' | 'year' | 'code' | 'number';
  decimals?: number;
  className?: string;
};

export function MonoNumber({ value, kind, decimals = 0, className = '' }: MonoNumberProps) {
  let formatted: string;
  
  switch (kind) {
    case 'brl':
      formatted = formatBRL(value);
      break;
    case 'pct':
      formatted = formatPct(value);
      break;
    case 'kml':
      formatted = formatKmL(value);
      break;
    case 'year':
      formatted = formatYear(value);
      break;
    case 'code':
      formatted = String(value);
      break;
    case 'number':
      formatted = formatNumber(value, decimals);
      break;
    default:
      formatted = String(value);
  }
  
  return (
    <span className={`font-mono ${className}`}>
      {formatted}
    </span>
  );
}
