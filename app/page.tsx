import Link from "next/link";
import { getVehicle } from "@/lib/api/fipe-server";
import { FEATURED_FIPE_CODES } from "@/lib/featured";
import {
  calculateRetention4y,
  calculateAnnualLoss,
  getCurrentPrice,
} from "@/lib/analytics";
import type { Vehicle } from "@/lib/api/types";
import { DottedHeader } from "@/components/dotted-header";
import { MonoNumber } from "@/components/mono-number";
import { SparkBars } from "@/components/spark-bars";
import { DividerLine } from "@/components/divider-line";
import { Logo } from "@/components/logo";
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
} from "@/components/structured-data";

export const revalidate = 86400;

async function loadFeatured(): Promise<Vehicle[]> {
  const results = await Promise.all(
    FEATURED_FIPE_CODES.map((code) => getVehicle(code).catch(() => null)),
  );
  return results.filter((v): v is Vehicle => v !== null);
}

export default async function LandingPage() {
  const vehicles = await loadFeatured();
  const featuredVehicles = vehicles.slice(0, 3);
  const rankingVehicles = [...vehicles]
    .sort((a, b) => calculateRetention4y(b) - calculateRetention4y(a))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[min(600px,90vw)] aspect-square rounded-full bg-[#3B82F6] opacity-[0.08] blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[#3B82F6]" aria-hidden>
              ⚡
            </span>
            <DottedHeader>Inteligência automotiva brasileira</DottedHeader>
          </div>

          <h1 className="text-5xl md:text-7xl font-semibold text-[#FAFAFA] tracking-tight text-balance">
            Já fipou esse carro?
          </h1>

          <p className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto text-pretty">
            Análise completa de qualquer veículo brasileiro. Preço FIPE,
            depreciação real, recalls, índice de roubo e consumo. Antes de você
            comprar.
          </p>

          <Link
            href="/buscar"
            prefetch
            className="inline-flex items-center justify-center px-8 py-4 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#FAFAFA] font-medium rounded-lg transition-colors"
          >
            Analisar um carro
          </Link>

          <p className="font-mono text-xs text-[#52525B]">
            fipou /fiˈpow/ verbo · analisar um veículo a fundo antes de comprar
          </p>
        </div>
      </section>

      {featuredVehicles.length > 0 && (
        <section
          aria-labelledby="destaques"
          className="px-6 py-16 max-w-6xl mx-auto"
        >
          <DottedHeader className="mb-8">
            <span id="destaques">Análises em destaque</span>
          </DottedHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => {
              const prices = vehicle.prices.map((p) => p.priceBRL);
              const retention = calculateRetention4y(vehicle);
              const currentPrice = getCurrentPrice(vehicle);

              return (
                <article
                  key={vehicle.fipeCode}
                  className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6 space-y-4"
                >
                  <div>
                    <p className="text-[#A1A1AA] text-sm">{vehicle.brand}</p>
                    <h3 className="text-[#FAFAFA] text-lg font-medium">
                      {vehicle.model}
                    </h3>
                  </div>

                  <MonoNumber
                    value={currentPrice}
                    kind="brl"
                    className="text-3xl text-[#FAFAFA] font-semibold block"
                  />

                  <div className="flex items-center gap-3">
                    <SparkBars values={prices} />
                    <span className="font-mono text-sm text-[#A1A1AA]">
                      <MonoNumber value={retention} kind="pct" />
                    </span>
                  </div>

                  <Link
                    href={`/carro/${vehicle.fipeCode}`}
                    prefetch
                    className="inline-flex items-center text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium transition-colors"
                  >
                    Ver ficha →
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {rankingVehicles.length > 0 && (
        <section
          aria-labelledby="ranking-teaser"
          className="px-6 py-16 max-w-6xl mx-auto"
        >
          <DividerLine label="Ranking de depreciação" className="mb-8" />
          <span id="ranking-teaser" className="sr-only">
            Ranking de depreciação
          </span>

          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <caption className="sr-only">
                  Top 5 veículos por retenção de valor
                </caption>
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-mono text-[#52525B] uppercase tracking-wider"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-mono text-[#52525B] uppercase tracking-wider"
                    >
                      Modelo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-mono text-[#52525B] uppercase tracking-wider"
                    >
                      Retenção
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-mono text-[#52525B] uppercase tracking-wider"
                    >
                      Perda anual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankingVehicles.map((vehicle, index) => {
                    const retention = calculateRetention4y(vehicle);
                    const annualLoss = calculateAnnualLoss(vehicle);

                    return (
                      <tr
                        key={vehicle.fipeCode}
                        className="border-b border-white/[0.06] last:border-b-0"
                      >
                        <td className="px-6 py-4 font-mono text-[#A1A1AA]">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/carro/${vehicle.fipeCode}`}
                            prefetch
                            className="text-[#FAFAFA] hover:text-[#60A5FA] transition-colors"
                          >
                            {vehicle.brand} {vehicle.model}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <MonoNumber
                            value={retention}
                            kind="pct"
                            className="text-[#10B981]"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <MonoNumber
                            value={annualLoss}
                            kind="pct"
                            className="text-[#A1A1AA]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/ranking"
              prefetch
              className="inline-flex items-center text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors"
            >
              Ver ranking completo →
            </Link>
          </div>
        </section>
      )}

      <footer className="px-6 py-12 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Logo size={28} withWordmark />
            <p className="font-mono text-xs text-[#52525B]">
              fipou.com.br · fontes: FIPE · Senacon · INMETRO · Susep · BCB · 2026
            </p>
          </div>
          <nav aria-label="Rodapé" className="flex gap-6 text-xs font-mono">
            <Link
              href="/buscar"
              className="text-[#52525B] hover:text-[#FAFAFA] transition-colors"
            >
              Buscar
            </Link>
            <Link
              href="/ranking"
              className="text-[#52525B] hover:text-[#FAFAFA] transition-colors"
            >
              Ranking
            </Link>
            <Link
              href="/comparar"
              className="text-[#52525B] hover:text-[#FAFAFA] transition-colors"
            >
              Comparar
            </Link>
            <Link
              href="/favoritos"
              className="text-[#52525B] hover:text-[#FAFAFA] transition-colors"
            >
              Favoritos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
