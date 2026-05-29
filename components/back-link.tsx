import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Consistent top-of-page back affordance for inner pages. */
export function BackLink({
  href = "/",
  label = "Voltar",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
