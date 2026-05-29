import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar veículo",
  description:
    "Selecione marca, modelo e ano. Em segundos você tem a ficha completa com preço FIPE, depreciação, recalls e consumo.",
  alternates: { canonical: "/buscar" },
  openGraph: {
    title: "Buscar veículo · Fipou",
    description:
      "Selecione marca, modelo e ano. Em segundos você tem a ficha completa.",
    url: "/buscar",
  },
};

export default function BuscarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
