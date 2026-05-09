function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-blush/70 ${className}`} />;
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-blush bg-white">
      <div className="aspect-square bg-blush/50 animate-pulse" />
      <div className="p-4 space-y-2.5">
        <Pulse className="h-3.5 w-1/2" />
        <Pulse className="h-4 w-3/4" />
        <Pulse className="h-5 w-1/3 mt-1" />
      </div>
    </div>
  );
}

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Pulse className="h-3 w-10" />
        <span className="text-blush">/</span>
        <Pulse className="h-3 w-16" />
      </div>

      {/* Title */}
      <div className="mb-8 space-y-2">
        <Pulse className="h-8 w-40" />
        <Pulse className="h-3 w-24" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-52 shrink-0 space-y-7">
          <div className="space-y-3">
            <Pulse className="h-3 w-20" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Pulse key={i} className="h-4 w-full" />
            ))}
          </div>
          <div className="space-y-3">
            <Pulse className="h-3 w-14" />
            {Array.from({ length: 2 }).map((_, i) => (
              <Pulse key={i} className="h-4 w-full" />
            ))}
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
