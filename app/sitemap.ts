import type { MetadataRoute } from "next";
import { FEATURED_FIPE_CODES } from "@/lib/featured";
import catalog from "@/lib/catalog/vehicles-index.json";
import { siteConfig } from "@/lib/seo";

const catalogCodes = (catalog as { vehicles: { fipeCode: string }[] }).vehicles.map(
  (v) => v.fipeCode,
);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/buscar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/ranking`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/comparar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/favoritos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Featured codes get higher priority; the harvested catalog fills the rest.
  const featured = new Set(FEATURED_FIPE_CODES);
  const allCodes = Array.from(new Set([...FEATURED_FIPE_CODES, ...catalogCodes]));

  const vehicleRoutes: MetadataRoute.Sitemap = allCodes.map((fipeCode) => ({
    url: `${siteConfig.url}/carro/${fipeCode}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: featured.has(fipeCode) ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...vehicleRoutes];
}
