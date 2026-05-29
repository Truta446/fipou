import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getVehicle } from "@/lib/api/fipe-server";
import { getEconomicContext } from "@/lib/api/bcb";
import {
  calculateRetention4y,
  calculateAnnualLoss,
  getCurrentPrice,
  bestYearToBuy,
} from "@/lib/analytics";
import { FEATURED_FIPE_CODES } from "@/lib/featured";
import { generateVerdict } from "@/lib/verdict";
import { fipouScore } from "@/lib/score";
import { siteConfig, absoluteUrl } from "@/lib/seo";
import { formatBRL, formatDate, formatPct } from "@/lib/format";
import type { Vehicle } from "@/lib/api/types";
import { DottedHeader } from "@/components/dotted-header";
import { DividerLine } from "@/components/divider-line";
import { MonoNumber } from "@/components/mono-number";
import { VerdictBullet } from "@/components/verdict-bullet";
import { DepreciationChart } from "@/components/depreciation-chart";
import { WatchlistButton } from "@/components/watchlist-button";
import { VehicleJsonLd } from "@/components/structured-data";
import { FipouScorePanel, FipouScoreBadge } from "@/components/fipou-score";
import { FinanceSimulator } from "@/components/finance-simulator";
import { CostOfOwnership } from "@/components/cost-of-ownership";
import { ShareButton } from "@/components/share-button";
import { InfoTooltip } from "@/components/info-tooltip";
import { BackLink } from "@/components/back-link";

/** Load up to 3 same-segment alternatives from the featured set, ranked by retention. */
async function getSimilar(current: Vehicle): Promise<Vehicle[]> {
  const others = await Promise.all(
    FEATURED_FIPE_CODES.filter((c) => c !== current.fipeCode).map((c) =>
      getVehicle(c).catch(() => null),
    ),
  );
  return others
    .filter((v): v is Vehicle => v !== null && v.segment === current.segment)
    .sort((a, b) => calculateRetention4y(b) - calculateRetention4y(a))
    .slice(0, 3);
}

type Props = {
  params: Promise<{ fipeCode: string }>;
};

export async function generateStaticParams() {
  return FEATURED_FIPE_CODES.map((fipeCode) => ({ fipeCode }));
}

/** Allow on-demand rendering for any non-featured FIPE code (ISR). */
export const dynamicParams = true;

/** Re-validate fichas once a day (86400 s) to pick up monthly FIPE updates. */
export const revalidate = 86400;

async function tryGetVehicle(fipeCode: string) {
  try {
    return await getVehicle(fipeCode);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fipeCode } = await params;
  const vehicle = await tryGetVehicle(fipeCode);
  if (!vehicle) {
    return { title: "Veículo não encontrado" };
  }
  const currentPrice = getCurrentPrice(vehicle);
  const title = `${vehicle.brand} ${vehicle.model} · FIPE ${formatBRL(currentPrice)}`;
  const description = `Análise completa: preço FIPE ${formatBRL(currentPrice)}, depreciação real, recalls, índice de roubo e consumo do ${vehicle.brand} ${vehicle.model}. Antes de comprar.`;
  const ogUrl = `/carro/${vehicle.fipeCode}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: `/carro/${vehicle.fipeCode}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: absoluteUrl(`/carro/${vehicle.fipeCode}`),
      siteName: siteConfig.name,
      locale: "pt_BR",
      images: [
        {
          url: ogUrl,
          width: siteConfig.ogImageSize.width,
          height: siteConfig.ogImageSize.height,
          alt: `${vehicle.brand} ${vehicle.model}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function CarroPage({ params }: Props) {
  const { fipeCode } = await params;
  const vehicle = await tryGetVehicle(fipeCode);
  if (!vehicle) notFound();

  const econ = await getEconomicContext();
  const similar = await getSimilar(vehicle);
  const retention = calculateRetention4y(vehicle);
  const annualLoss = calculateAnnualLoss(vehicle);
  const verdict = generateVerdict(vehicle, { selic: econ?.selic });
  const currentPrice = getCurrentPrice(vehicle);
  const bestYear = bestYearToBuy(vehicle);
  const score = fipouScore(vehicle);
  const blendedKmL = vehicle.fuelEconomyKmL
    ? Number(
        (
          vehicle.fuelEconomyKmL.city * 0.6 +
          vehicle.fuelEconomyKmL.road * 0.4
        ).toFixed(1),
      )
    : null;

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <VehicleJsonLd vehicle={vehicle} currentPrice={currentPrice} />
      <div className="max-w-4xl mx-auto space-y-8">
        <BackLink href="/buscar" label="Voltar à busca" />
        <div className="space-y-4">
          <DottedHeader>Ficha completa</DottedHeader>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#FAFAFA] tracking-tight">
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className="font-mono text-sm text-[#52525B]">
            código FIPE {vehicle.fipeCode} · referência {vehicle.referenceMonth}
          </p>
        </div>

        <section
          aria-label="Preço FIPE"
          className="bg-[#0A0A0A] border border-[#3B82F6]/30 rounded-lg p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="font-mono text-sm text-[#3B82F6] mb-2">
                VALOR FIPE ⚡
              </p>
              <MonoNumber
                value={currentPrice}
                kind="brl"
                className="text-4xl md:text-5xl text-[#FAFAFA] font-semibold"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-8 md:text-right">
              <div>
                <p className="text-xs text-[#52525B] uppercase tracking-wider mb-1">
                  Zero-km
                </p>
                <MonoNumber
                  value={vehicle.zeroKmPriceBRL}
                  kind="brl"
                  className="text-lg text-[#A1A1AA]"
                />
              </div>
              <div>
                <p className="text-xs text-[#52525B] uppercase tracking-wider mb-1">
                  Retenção
                </p>
                <MonoNumber
                  value={retention}
                  kind="pct"
                  className="text-lg text-[#10B981]"
                />
              </div>
              <div>
                <p className="text-xs text-[#52525B] uppercase tracking-wider mb-1">
                  Perda anual
                </p>
                <MonoNumber
                  value={annualLoss}
                  kind="pct"
                  className="text-lg text-[#F59E0B]"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="Fipou Score"
          className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6 md:p-8"
        >
          <DividerLine label="Fipou Score" className="mb-6" />
          <FipouScorePanel vehicle={vehicle} />
        </section>

        <section
          aria-label="Depreciação"
          className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6 md:p-8"
        >
          <DividerLine label="Depreciação" className="mb-6" />
          <DepreciationChart vehicle={vehicle} />

          {bestYear && (
            <div className="mt-6 bg-gradient-to-br from-[#22D3EE]/10 to-transparent border border-[#22D3EE]/20 rounded-lg p-5">
              <p className="font-mono text-xs text-[#22D3EE] uppercase tracking-wider mb-2">
                ⚡ Melhor ano para comprar
              </p>
              <p className="text-[#FAFAFA]">
                O modelo{" "}
                <span className="font-mono font-semibold">
                  {bestYear.modelYear}
                </span>{" "}
                tem o melhor custo-benefício da curva: depreciação de apenas{" "}
                <MonoNumber
                  value={bestYear.forwardAnnualDropPct}
                  kind="pct"
                  className="text-[#22D3EE]"
                />{" "}
                ao ano daqui pra frente, já{" "}
                <MonoNumber
                  value={bestYear.savingsVsZeroKmBRL}
                  kind="brl"
                  className="text-[#10B981]"
                />{" "}
                (
                <MonoNumber value={bestYear.savingsVsZeroKmPct} kind="pct" />)
                mais barato que o zero-km.
              </p>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section
            aria-label="Recalls"
            className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6"
          >
            <p className="font-mono text-xs text-[#52525B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              Recalls
              <InfoTooltip text="Recall é uma convocação do fabricante para corrigir, de graça, um defeito de fábrica que pode afetar segurança. Fonte: Senacon/MJ." />
            </p>
            {vehicle.activeRecalls.length === 0 ? (
              <p className="text-[#10B981]">Sem recalls ativos</p>
            ) : (
              <div className="space-y-3">
                <p className="text-[#F59E0B]">
                  {vehicle.activeRecalls.length === 1
                    ? "1 recall ativo"
                    : `${vehicle.activeRecalls.length} recalls ativos`}
                </p>
                {vehicle.activeRecalls.map((recall, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-mono text-[#52525B]">
                      {formatDate(recall.date)}
                    </p>
                    <p className="text-[#A1A1AA]">{recall.summary}</p>
                    <span
                      className={`text-xs font-mono ${
                        recall.severity === "alta"
                          ? "text-[#EF4444]"
                          : recall.severity === "média"
                            ? "text-[#F59E0B]"
                            : "text-[#A1A1AA]"
                      }`}
                    >
                      {recall.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section
            aria-label="Índice de roubo"
            className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6"
          >
            <p className="font-mono text-xs text-[#52525B] uppercase tracking-wider mb-4">
              Índice de roubo (Susep)
            </p>
            {vehicle.theftRank ? (
              <p className="text-[#A1A1AA]">
                Posição{" "}
                <span className="font-mono text-[#FAFAFA]">
                  #{vehicle.theftRank.rank}
                </span>{" "}
                em {vehicle.theftRank.state} ·{" "}
                <span className="font-mono">{vehicle.theftRank.year}</span>
              </p>
            ) : (
              <p className="text-[#10B981]">Fora do top 100</p>
            )}
          </section>

          <section
            aria-label="Consumo"
            className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6"
          >
            <p className="font-mono text-xs text-[#52525B] uppercase tracking-wider mb-4">
              Consumo (INMETRO PBEV)
            </p>
            {vehicle.fuelEconomyKmL ? (
              <p className="font-mono text-[#A1A1AA]">
                <span className="text-[#FAFAFA]">
                  <MonoNumber
                    value={vehicle.fuelEconomyKmL.city}
                    kind="number"
                    decimals={1}
                  />
                </span>{" "}
                km/l cidade ·{" "}
                <span className="text-[#FAFAFA]">
                  <MonoNumber
                    value={vehicle.fuelEconomyKmL.road}
                    kind="number"
                    decimals={1}
                  />
                </span>{" "}
                km/l estrada
              </p>
            ) : vehicle.fuel === "Elétrico" ? (
              <p className="text-[#22D3EE]">Veículo elétrico</p>
            ) : (
              <p className="text-[#52525B]">Dados não disponíveis</p>
            )}
          </section>

          <section
            aria-label="Segmento"
            className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6"
          >
            <p className="font-mono text-xs text-[#52525B] uppercase tracking-wider mb-4">
              Segmento
            </p>
            <p className="text-[#A1A1AA]">
              {vehicle.segment} ·{" "}
              <MonoNumber
                value={retention}
                kind="pct"
                className="text-[#FAFAFA]"
              />{" "}
              vs média{" "}
              <MonoNumber value={vehicle.segmentRetention4yPct} kind="pct" />{" "}
              no segmento
            </p>
          </section>
        </div>

        <section
          aria-label="Simulador de financiamento"
          className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6 md:p-8"
        >
          <DividerLine label="Simular financiamento" className="mb-6" />
          <FinanceSimulator
            cashPrice={currentPrice}
            annualDepreciationPct={annualLoss}
          />
        </section>

        <section
          aria-label="Custo de manter"
          className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6 md:p-8"
        >
          <DividerLine label="Custo de manter" className="mb-6" />
          <CostOfOwnership
            cashPrice={currentPrice}
            annualDepreciationPct={annualLoss}
            kmPerLiter={blendedKmL}
            selicPct={econ?.selic ?? null}
          />
        </section>

        <section
          aria-label="Veredito"
          className="bg-gradient-to-br from-[#3B82F6]/10 to-transparent border border-[#3B82F6]/20 rounded-lg p-6 md:p-8"
        >
          <DividerLine label="Veredito" className="mb-6" />
          <div className="space-y-4">
            {verdict.map((line, i) => (
              <VerdictBullet key={i} symbol={line.symbol}>
                {line.text}
              </VerdictBullet>
            ))}
          </div>
        </section>

        {econ && (
          <section
            aria-label="Contexto econômico"
            className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6 md:p-8"
          >
            <DividerLine label="Contexto econômico" className="mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-[#52525B] uppercase tracking-wider mb-1">
                  IPCA · 12 meses
                </p>
                <MonoNumber
                  value={econ.ipca12m}
                  kind="pct"
                  className="text-2xl text-[#FAFAFA]"
                />
                <p className="font-mono text-xs text-[#52525B] mt-1">
                  até {econ.ipca12mLabel}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#52525B] uppercase tracking-wider mb-1">
                  Selic · meta a.a.
                </p>
                <MonoNumber
                  value={econ.selic}
                  kind="pct"
                  className="text-2xl text-[#22D3EE]"
                />
                <p className="font-mono text-xs text-[#52525B] mt-1">
                  taxa básica de juros
                </p>
              </div>
            </div>
            <p className="text-sm text-[#A1A1AA] mt-6">
              A curva de depreciação acima compara todos os anos no mesmo mês de
              referência ({vehicle.referenceMonth}), então já está em{" "}
              <span className="text-[#FAFAFA]">valores reais</span> — sem
              distorção de inflação.
            </p>
            <p className="font-mono text-[10px] text-[#52525B] mt-2">
              Fonte: Banco Central do Brasil · SGS (séries 13522, 432)
            </p>
          </section>
        )}

        {similar.length > 0 && (
          <section
            aria-label="Alternativas"
            className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6 md:p-8"
          >
            <DividerLine label="Alternativas no segmento" className="mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similar.map((alt) => {
                const altRet = calculateRetention4y(alt);
                const altScore = fipouScore(alt).score;
                const diff = altRet - retention;
                return (
                  <Link
                    key={alt.fipeCode}
                    href={`/carro/${alt.fipeCode}`}
                    prefetch
                    className="group rounded-lg border border-white/[0.06] p-4 transition-colors hover:border-white/[0.15] hover:bg-white/[0.02]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="text-[#A1A1AA] text-xs">{alt.brand}</p>
                        <p className="text-[#FAFAFA] text-sm font-medium truncate">
                          {alt.model}
                        </p>
                      </div>
                      <FipouScoreBadge vehicle={alt} size={40} />
                    </div>
                    <MonoNumber
                      value={getCurrentPrice(alt)}
                      kind="brl"
                      className="text-lg text-[#FAFAFA] font-semibold block"
                    />
                    <p className="font-mono text-xs mt-1 text-[#52525B]">
                      retém {formatPct(altRet)}
                      {Math.abs(diff) >= 0.5 && (
                        <span
                          className={
                            diff > 0 ? "text-[#10B981]" : "text-[#F59E0B]"
                          }
                        >
                          {" "}
                          ({diff > 0 ? "+" : "−"}
                          {formatPct(Math.abs(diff)).replace("%", "")} p.p.)
                        </span>
                      )}
                    </p>
                    <span className="inline-block mt-3 text-[#3B82F6] group-hover:text-[#60A5FA] text-xs font-medium transition-colors">
                      Ver ficha →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section
          aria-label="Compartilhar"
          className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg p-6 md:p-8"
        >
          <DividerLine label="Compartilhar análise" className="mb-6" />
          <ShareButton
            title={`${vehicle.brand} ${vehicle.model} — Fipou Score ${score.score}/100`}
            summary={`Vale ${formatBRL(currentPrice)} na FIPE, retém ${formatPct(retention)} do valor${
              vehicle.activeRecalls.length === 0
                ? ", sem recalls ativos"
                : `, ${vehicle.activeRecalls.length} recall(s) ativo(s)`
            }.`}
            path={`/carro/${vehicle.fipeCode}`}
          />
        </section>

        <div className="flex flex-col sm:flex-row gap-4">
          <WatchlistButton vehicle={vehicle} />
          <Link
            href={`/comparar?a=${vehicle.fipeCode}`}
            prefetch
            className="inline-flex items-center justify-center px-6 py-3 border border-[#3B82F6] text-[#60A5FA] hover:bg-[#3B82F6]/10 font-medium rounded-lg transition-colors"
          >
            Comparar com outro carro →
          </Link>
          <Link
            href="/buscar"
            className="inline-flex items-center justify-center px-6 py-3 border border-white/[0.06] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-white/[0.12] font-medium rounded-lg transition-colors"
          >
            Voltar à busca
          </Link>
        </div>
      </div>
    </div>
  );
}
