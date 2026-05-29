import Link from "next/link";
import type { Metadata } from "next";
import { DottedHeader } from "@/components/dotted-header";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background px-6 py-16 flex items-center justify-center">
      <div className="max-w-md text-center space-y-6 flex flex-col items-center">
        <Link href="/" aria-label="Início">
          <Logo size={48} withWordmark wordmarkClassName="text-2xl" />
        </Link>
        <DottedHeader>404</DottedHeader>
        <h1 className="text-5xl md:text-6xl font-semibold text-[#FAFAFA] tracking-tight font-mono">
          404
        </h1>
        <p className="text-[#A1A1AA]">
          Essa página não existe ou foi movida.
        </p>
        <p className="font-mono text-xs text-[#52525B]">
          Talvez você quis ver a busca?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-white/[0.06] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-white/[0.12] font-medium rounded-lg transition-colors"
          >
            Início
          </Link>
          <Link
            href="/buscar"
            className="inline-flex items-center justify-center px-6 py-3 border border-[#3B82F6] text-[#60A5FA] hover:bg-[#3B82F6]/10 font-medium rounded-lg transition-colors"
          >
            Buscar um veículo →
          </Link>
        </div>
      </div>
    </div>
  );
}
