'use client';

import Link from 'next/link';
import type { Vehicle } from '@/lib/api/types';
import { calculateRetention4y, getCurrentPrice } from '@/lib/analytics';
import { MonoNumber } from './mono-number';
import { SparkBars } from './spark-bars';
import { FipouScoreBadge } from './fipou-score';

type VehicleCardProps = {
  vehicle: Vehicle;
  variant?: 'compact' | 'full';
  className?: string;
};

export function VehicleCard({ vehicle, variant = 'compact', className = '' }: VehicleCardProps) {
  const retention = calculateRetention4y(vehicle);
  const currentPrice = getCurrentPrice(vehicle);
  const prices = vehicle.prices.map(p => p.priceBRL);
  
  if (variant === 'compact') {
    return (
      <div className={`bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6 ${className}`}>
        <div className="space-y-4">
          <div>
            <p className="text-[#A1A1AA] text-sm">{vehicle.brand}</p>
            <h3 className="text-[#FAFAFA] text-lg font-medium">{vehicle.model}</h3>
          </div>
          
          <div className="flex items-baseline gap-2">
            <MonoNumber value={currentPrice} kind="brl" className="text-2xl text-[#FAFAFA] font-semibold" />
          </div>
          
          <div className="flex items-center gap-3">
            <SparkBars values={prices} />
            <span className="font-mono text-sm text-[#A1A1AA]">
              <MonoNumber value={retention} kind="pct" />
            </span>
          </div>
          
          <Link 
            href={`/carro/${vehicle.fipeCode}`}
            className="inline-flex items-center text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium transition-colors"
          >
            Ver ficha →
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6 space-y-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[#A1A1AA] text-sm">{vehicle.brand}</p>
          <h3 className="text-[#FAFAFA] text-xl font-medium">{vehicle.model}</h3>
          <p className="font-mono text-xs text-[#52525B] mt-1">
            código FIPE {vehicle.fipeCode}
          </p>
        </div>
        <FipouScoreBadge vehicle={vehicle} size={52} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[#52525B] text-xs uppercase tracking-wider mb-1">Preço atual</p>
          <MonoNumber value={currentPrice} kind="brl" className="text-xl text-[#FAFAFA] font-semibold" />
        </div>
        <div>
          <p className="text-[#52525B] text-xs uppercase tracking-wider mb-1">Zero-km</p>
          <MonoNumber value={vehicle.zeroKmPriceBRL} kind="brl" className="text-xl text-[#A1A1AA]" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
        <div>
          <p className="text-[#52525B] text-xs uppercase tracking-wider mb-1">Retenção</p>
          <MonoNumber value={retention} kind="pct" className="text-lg text-[#FAFAFA]" />
        </div>
        <div>
          <p className="text-[#52525B] text-xs uppercase tracking-wider mb-1">Recalls</p>
          <span className={`font-mono text-lg ${vehicle.activeRecalls.length === 0 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
            {vehicle.activeRecalls.length}
          </span>
        </div>
      </div>
      
      {vehicle.theftRank && (
        <div className="pt-2 border-t border-white/[0.06]">
          <p className="text-[#52525B] text-xs uppercase tracking-wider mb-1">Índice de roubo</p>
          <p className="text-[#A1A1AA] text-sm">
            #{vehicle.theftRank.rank} em {vehicle.theftRank.state} ({vehicle.theftRank.year})
          </p>
        </div>
      )}
      
      {vehicle.fuelEconomyKmL && (
        <div className="pt-2 border-t border-white/[0.06]">
          <p className="text-[#52525B] text-xs uppercase tracking-wider mb-1">Consumo</p>
          <p className="font-mono text-sm text-[#A1A1AA]">
            <MonoNumber value={vehicle.fuelEconomyKmL.city} kind="number" decimals={1} /> km/l cidade ·{' '}
            <MonoNumber value={vehicle.fuelEconomyKmL.road} kind="number" decimals={1} /> km/l estrada
          </p>
        </div>
      )}
    </div>
  );
}
