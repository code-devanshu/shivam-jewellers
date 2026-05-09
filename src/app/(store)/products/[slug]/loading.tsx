function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-blush/70 ${className}`} />;
}

export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <Pulse className="h-3 w-10" />
        <span className="text-blush">/</span>
        <Pulse className="h-3 w-16" />
        <span className="text-blush">/</span>
        <Pulse className="h-3 w-20" />
        <span className="text-blush">/</span>
        <Pulse className="h-3 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Image */}
        <div className="aspect-square rounded-3xl bg-blush/50 animate-pulse border border-blush" />

        {/* Info */}
        <div className="flex flex-col gap-6">
          {/* Badges */}
          <div className="flex gap-2">
            <Pulse className="h-6 w-24 rounded-full" />
            <Pulse className="h-6 w-32 rounded-full" />
          </div>

          {/* Name + weight */}
          <div className="space-y-3">
            <Pulse className="h-9 w-4/5" />
            <Pulse className="h-9 w-3/5" />
            <Pulse className="h-4 w-48 mt-1" />
          </div>

          {/* Price card */}
          <div className="bg-cream border border-blush rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Pulse className="h-9 w-36" />
              <Pulse className="h-4 w-28" />
            </div>
            <Pulse className="h-3 w-64" />
          </div>

          {/* Size selector */}
          <div className="space-y-2.5">
            <Pulse className="h-4 w-16" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Pulse key={i} className="h-10 w-16 rounded-xl" />
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <Pulse className="h-13 flex-1 rounded-full" />
            <Pulse className="h-13 w-13 rounded-full" />
          </div>

          {/* Description */}
          <div className="border-t border-blush pt-5 space-y-2">
            <Pulse className="h-4 w-28" />
            <Pulse className="h-3 w-full" />
            <Pulse className="h-3 w-5/6" />
            <Pulse className="h-3 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
