import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} · ${siteConfig.tagline}`,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: siteConfig.themeColor,
    theme_color: siteConfig.themeColor,
    lang: siteConfig.locale,
    dir: "ltr",
    categories: ["finance", "shopping", "utilities"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Buscar veículo",
        url: "/buscar",
        description: "Abrir busca por marca, modelo e ano",
      },
      {
        name: "Ranking",
        url: "/ranking",
        description: "Ver ranking de depreciação",
      },
      {
        name: "Favoritos",
        url: "/favoritos",
        description: "Ver veículos salvos",
      },
    ],
  };
}
