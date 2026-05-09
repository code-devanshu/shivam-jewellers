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

export default function HomeLoading() {
  return (
    <div>
      {/* Hero */}
      <div className="min-h-[88vh] bg-gradient-to-br from-brown-dark via-brown to-rose-gold-dark animate-pulse" />

      {/* Shop by Category */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <Pulse className="h-3 w-16" />
            <Pulse className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-blush bg-white">
                <div className="aspect-square bg-blush/50 animate-pulse" />
                <div className="p-3">
                  <Pulse className="h-4 w-3/4 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <Pulse className="h-3 w-20" />
            <Pulse className="h-8 w-56" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
