import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-12" aria-busy="true">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24 bg-white/[0.04]" />
          <Skeleton className="h-10 w-2/3 bg-white/[0.06]" />
          <Skeleton className="h-3 w-3/4 bg-white/[0.04]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full bg-white/[0.04]" />
          <Skeleton className="h-10 w-full bg-white/[0.04]" />
          <Skeleton className="h-10 w-full bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
