import { siteConfig, absoluteUrl } from "@/lib/seo";
import type { Vehicle } from "@/lib/api/types";

function Script({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify is safe here because data is constructed from known values.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/icon.svg"),
    sameAs: [],
    description: siteConfig.description,
  };
  return <Script data={data} />;
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return <Script data={data} />;
}

export function VehicleJsonLd({
  vehicle,
  currentPrice,
}: {
  vehicle: Vehicle;
  currentPrice: number;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${vehicle.brand} ${vehicle.model}`,
    brand: { "@type": "Brand", name: vehicle.brand },
    model: vehicle.model,
    vehicleConfiguration: vehicle.segment,
    fuelType: vehicle.fuel,
    productID: vehicle.fipeCode,
    url: absoluteUrl(`/carro/${vehicle.fipeCode}`),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: Math.min(...vehicle.prices.map((p) => p.priceBRL)),
      highPrice: vehicle.zeroKmPriceBRL,
      offerCount: vehicle.prices.length + 1,
      availability: "https://schema.org/InStock",
    },
    fuelEfficiency: vehicle.fuelEconomyKmL
      ? [
          {
            "@type": "QuantitativeValue",
            value: vehicle.fuelEconomyKmL.city,
            unitText: "km/l",
            name: "cidade",
          },
          {
            "@type": "QuantitativeValue",
            value: vehicle.fuelEconomyKmL.road,
            unitText: "km/l",
            name: "estrada",
          },
        ]
      : undefined,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Preço FIPE atual",
        value: currentPrice,
        unitCode: "BRL",
      },
      {
        "@type": "PropertyValue",
        name: "Retenção de valor (%)",
        value: ((vehicle.prices[0]?.priceBRL ?? 0) / vehicle.zeroKmPriceBRL) * 100,
      },
    ],
  };
  return <Script data={data} />;
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
  return <Script data={data} />;
}
