import Link from "next/link";
import type { Metadata } from "next";
import { DottedHeader } from "@/components/dotted-header";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Sem conexão",
  description: "Você está offline.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background px-6 py-16 flex items-center justify-center">
      <div className="max-w-md text-center space-y-6 flex flex-col items-center">
        <Logo size={48} withWordmark wordmarkClassName="text-2xl" />
        <DottedHeader>Sem conexão</DottedHeader>
        <h1 className="text-3xl md:text-4xl font-semibold text-[#FAFAFA] tracking-tight">
          Você está offline
        </h1>
        <p className="text-[#A1A1AA]">
          Esta página ainda não está disponível para uso offline. Verifique sua
          conexão e tente novamente.
        </p>
        <p className="font-mono text-xs text-[#52525B]">
          As fichas que você já visitou continuam acessíveis.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-[#3B82F6] text-[#60A5FA] hover:bg-[#3B82F6]/10 font-medium rounded-lg transition-colors"
        >
          Tentar novamente
        </Link>
      </div>
    </div>
  );
}
