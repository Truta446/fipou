import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ranking de depreciação",
  description:
    "Quem mantém valor e quem perde rápido. Ranking de depreciação por segmento, atualizado mensalmente com base na tabela FIPE.",
  alternates: { canonical: "/ranking" },
  openGraph: {
    title: "Ranking de depreciação · Fipou",
    description: "Quem mantém valor e quem perde rápido no mercado brasileiro.",
    url: "/ranking",
  },
};

export default function RankingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
