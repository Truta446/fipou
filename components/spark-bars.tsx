type SparkBarsProps = {
  values: number[];
  className?: string;
};

const bars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

export function SparkBars({ values, className = '' }: SparkBarsProps) {
  if (values.length === 0) return null;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const sparkChars = values.map((value) => {
    const normalized = (value - min) / range;
    const index = Math.min(Math.floor(normalized * bars.length), bars.length - 1);
    return bars[index];
  });
  
  return (
    <span className={`font-mono text-[#22D3EE] ${className}`}>
      {sparkChars.join('')}
    </span>
  );
}
