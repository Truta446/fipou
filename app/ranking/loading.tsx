import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-8" aria-busy="true">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24 bg-white/[0.04]" />
          <Skeleton className="h-10 w-1/2 bg-white/[0.06]" />
          <Skeleton className="h-3 w-2/3 bg-white/[0.04]" />
        </div>
        <Skeleton className="h-10 w-full max-w-md bg-white/[0.04] rounded-lg" />
        <Skeleton className="h-96 w-full bg-white/[0.04] rounded-lg" />
      </div>
    </div>
  );
}
