import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Seus veículos salvos para acompanhar.",
  alternates: { canonical: "/favoritos" },
  robots: { index: false, follow: false },
};

export default function FavoritosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
