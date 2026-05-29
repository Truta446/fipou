type DividerLineProps = {
  label?: string;
  className?: string;
};

export function DividerLine({ label, className = '' }: DividerLineProps) {
  return (
    <div className={`flex items-center gap-3 font-mono text-sm text-[#A1A1AA] ${className}`}>
      {label && <span className="uppercase tracking-wider">{label}</span>}
      <span className="text-[#52525B]">⎯⎯⎯⎯⎯⎯</span>
    </div>
  );
}
