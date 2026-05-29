"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

/**
 * Share the ficha on WhatsApp (and copy-link fallback). Builds a wa.me link
 * with a short verdict summary + the canonical URL.
 */
export function ShareButton({
  title,
  summary,
  path,
}: {
  title: string;
  summary: string;
  path: string;
}) {
  const [copied, setCopied] = useState(false);

  function urlNow() {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return `https://fipou.com.br${path}`;
  }

  function shareWhatsApp() {
    const text = `${title}\n${summary}\n\nVeja no Fipou: ${urlNow()}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(urlNow());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={shareWhatsApp}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#25D366] text-black font-medium transition-opacity hover:opacity-90"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Compartilhar no WhatsApp
      </button>
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copiar link"
        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/[0.06] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-white/[0.12] font-medium transition-colors"
      >
        {copied ? (
          <Check className="h-4 w-4 text-[#10B981]" aria-hidden />
        ) : (
          <span className="font-mono text-sm">copiar link</span>
        )}
      </button>
    </div>
  );
}
