import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-8" aria-busy="true">
        <Skeleton className="h-10 w-1/2 bg-white/[0.06]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-10 bg-white/[0.04]" />
          <Skeleton className="h-10 bg-white/[0.04]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 bg-white/[0.04] rounded-lg" />
          <Skeleton className="h-80 bg-white/[0.04] rounded-lg" />
        </div>
      </div>
    </div>
  );
}
