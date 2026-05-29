import { HelpCircle } from "lucide-react";

/**
 * Lightweight CSS-only tooltip (hover + keyboard focus, no JS state).
 * Renders a small ? trigger with an explanatory bubble.
 */
export function InfoTooltip({
  text,
  label = "Mais informação",
}: {
  text: string;
  label?: string;
}) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#52525B] transition-colors hover:text-[#A1A1AA] focus-visible:text-[#A1A1AA] focus:outline-none"
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-md border border-white/[0.08] bg-[#0A0A0A] px-3 py-2 text-xs leading-relaxed text-[#A1A1AA] opacity-0 shadow-xl shadow-black/50 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#0A0A0A]" />
      </span>
    </span>
  );
}
