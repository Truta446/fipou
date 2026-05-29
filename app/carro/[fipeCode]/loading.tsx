import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-8" aria-busy="true">
        <div className="space-y-3">
          <Skeleton className="h-3 w-40 bg-white/[0.04]" />
          <Skeleton className="h-10 w-3/4 bg-white/[0.06]" />
          <Skeleton className="h-3 w-56 bg-white/[0.04]" />
        </div>
        <Skeleton className="h-40 w-full bg-white/[0.04] rounded-lg" />
        <Skeleton className="h-64 w-full bg-white/[0.04] rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-28 w-full bg-white/[0.04] rounded-lg" />
          <Skeleton className="h-28 w-full bg-white/[0.04] rounded-lg" />
          <Skeleton className="h-28 w-full bg-white/[0.04] rounded-lg" />
          <Skeleton className="h-28 w-full bg-white/[0.04] rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full bg-white/[0.04] rounded-lg" />
      </div>
    </div>
  );
}
