function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export default function ProductsTableSkeleton() {
  return (
    <div>
      <div className="flex gap-8 px-5 py-3 bg-gray-50 border-b border-gray-100">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24 hidden lg:block" />
        <Skeleton className="h-3 w-16 hidden md:block" />
        <Skeleton className="h-3 w-12 hidden md:block" />
        <Skeleton className="h-3 w-14" />
      </div>

      <div className="divide-y divide-gray-50">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-5 py-3.5">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-32 hidden lg:block" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-4 w-8 hidden md:block" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
