function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export default function AdminBannersLoading() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28 rounded-lg" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex gap-8 px-5 py-3 bg-gray-50 border-b border-gray-100">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20 hidden md:block" />
          <Skeleton className="h-3 w-12 hidden md:block" />
        </div>

        <div className="divide-y divide-gray-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-5 py-3.5">
              <Skeleton className="h-10 w-16 rounded-lg" />
              <Skeleton className="h-4 w-20 hidden md:block" />
              <Skeleton className="h-4 w-8 hidden md:block" />
              <div className="flex gap-2 ml-auto">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
