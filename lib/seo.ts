export const siteConfig = {
  name: "Fipou",
  shortName: "Fipou",
  domain: "fipou.com.br",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://fipou.com.br"),
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
