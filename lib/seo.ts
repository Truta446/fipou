export const siteConfig = {
  name: "Fipou",
  shortName: "Fipou",
  domain: "www.fipou.com.br",
  // Canonical, crawler-facing URL (sitemap, canonical tags, og:image).
  // It MUST be the stable production domain — never Vercel's per-deploy
  // VERCEL_URL (ephemeral + behind Deployment Protection), which breaks
  // both sitemaps (cross-domain) and social previews.
  // www.fipou.com.br is the Vercel Production domain; fipou.com.br 307s to it.
  // NEXT_PUBLIC_SITE_URL can override (e.g. for a staging canonical).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fipou.com.br",
  locale: "pt-BR",
  description:
    "Análise completa de qualquer veículo brasileiro. Preço FIPE, depreciação real, recalls, índice de roubo e consumo. Antes de você comprar.",
  tagline: "Já fipou esse carro?",
  themeColor: "#000000",
  brandColor: "#3B82F6",
  sources: ["FIPE", "Senacon", "INMETRO", "Susep", "BCB"],
  ogImageSize: { width: 1200, height: 630 },
  twitter: {
    handle: "@fipou",
    site: "@fipou",
  },
} as const;

export type SiteConfig = typeof siteConfig;

export function absoluteUrl(path = "/") {
  const base = siteConfig.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
