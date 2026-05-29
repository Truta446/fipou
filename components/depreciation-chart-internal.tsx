'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Vehicle } from '@/lib/api/types';
import { formatBRL } from '@/lib/format';

type DepreciationChartProps = {
  vehicle: Vehicle;
  className?: string;
};

export function DepreciationChartInternal({ vehicle, className = '' }: DepreciationChartProps) {
  const sortedPrices = [...vehicle.prices].sort((a, b) => a.modelYear - b.modelYear);
  
  const data = [
    ...sortedPrices.map((p) => ({
      year: p.modelYear.toString(),
      price: p.priceBRL,
    })),
    {
      year: '0km',
      price: vehicle.zeroKmPriceBRL,
    },
  ];
  
  return (
    <div className={className}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="year" 
              stroke="#52525B" 
              fontSize={12} 
              tickLine={false}
              axisLine={{ stroke: '#52525B', strokeOpacity: 0.3 }}
              fontFamily="var(--font-geist-mono)"
            />
            <YAxis 
              stroke="#52525B" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              fontFamily="var(--font-geist-mono)"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0A0A0A', 
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                fontFamily: 'var(--font-geist-mono)',
              }}
              labelStyle={{ color: '#A1A1AA' }}
              formatter={(value) => [
                typeof value === 'number' ? formatBRL(value) : String(value),
                'Preço',
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#3B82F6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            <tr>
              {data.map((d) => (
                <td key={d.year} className="pr-4 pb-1 text-[#52525B]">{d.year}</td>
              ))}
            </tr>
            <tr>
              {data.map((d) => (
                <td key={d.year} className="pr-4 text-[#A1A1AA]">{formatBRL(d.price)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
