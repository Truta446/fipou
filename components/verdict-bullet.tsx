import { VerdictSymbol } from '@/lib/verdict';

type VerdictBulletProps = {
  symbol: VerdictSymbol;
  children: React.ReactNode;
  className?: string;
};

const symbolColors: Record<VerdictSymbol, string> = {
  '✓': 'text-[#10B981]',
  '⚠': 'text-[#F59E0B]',
  '✕': 'text-[#EF4444]',
};

export function VerdictBullet({ symbol, children, className = '' }: VerdictBulletProps) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <span className={`${symbolColors[symbol]} text-lg leading-none mt-0.5`}>{symbol}</span>
      <span className="text-[#FAFAFA]">{children}</span>
    </div>
  );
}
