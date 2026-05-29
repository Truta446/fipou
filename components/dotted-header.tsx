type DottedHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export function DottedHeader({ children, className = '' }: DottedHeaderProps) {
  return (
    <div className={`flex items-center gap-2 font-mono text-sm text-[#3B82F6] tracking-wider ${className}`}>
      <span className="text-xs">●●●</span>
      <span className="uppercase">{children}</span>
    </div>
  );
}
