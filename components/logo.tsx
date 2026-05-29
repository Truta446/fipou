import { cn } from "@/lib/utils";

type LogoProps = {
  /** Square edge in pixels for the icon mark. */
  size?: number;
  /** Render mark + "fipou" wordmark side-by-side. */
  withWordmark?: boolean;
  /** Wordmark text size; defaults scale with `size`. */
  wordmarkClassName?: string;
  className?: string;
};

/**
 * Fipou brand mark — electric-blue lightning bolt on a black tile.
 * Renders inline-flex so it can sit next to other text.
 */
export function Logo({
  size = 32,
  withWordmark = false,
  wordmarkClassName,
  className,
}: LogoProps) {
  const mark = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role="img"
      aria-label="Fipou"
      className="shrink-0"
    >
      <rect width="32" height="32" rx={size <= 24 ? 5 : 7} fill="#000" />
      <path
        d="M18.4 5L9 17.4h5.3l-1.1 9.6 9.4-12.4h-5.3l1.1-9.6z"
        fill="#3B82F6"
        stroke="#3B82F6"
        strokeWidth={0.6}
        strokeLinejoin="round"
      />
    </svg>
  );

  if (!withWordmark) {
    return <span className={cn("inline-flex", className)}>{mark}</span>;
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2.5 align-middle", className)}
    >
      {mark}
      <span
        className={cn(
          "font-semibold tracking-tight text-[#FAFAFA]",
          wordmarkClassName ?? (size >= 32 ? "text-xl" : "text-base"),
        )}
      >
        fipou
      </span>
    </span>
  );
}
