import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comparar veículos",
  description:
    "Compare dois veículos lado a lado: preço, retenção de valor, recalls, índice de roubo e consumo.",
  alternates: { canonical: "/comparar" },
  openGraph: {
    title: "Comparar veículos · Fipou",
    description: "Duas fichas FIPE lado a lado, com vencedor por métrica.",
    url: "/comparar",
  },
};

export default function CompararLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
