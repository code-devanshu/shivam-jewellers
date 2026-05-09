function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-blush/70 ${className}`} />;
}

function WishlistCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-blush bg-white">
      <div className="aspect-square bg-blush/50 animate-pulse" />
      <div className="p-4 space-y-2.5">
        <Pulse className="h-3.5 w-1/2" />
        <Pulse className="h-4 w-3/4" />
        <div className="flex items-center justify-between mt-2">
          <Pulse className="h-5 w-24" />
          <Pulse className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function WishlistLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 space-y-2">
        <Pulse className="h-8 w-36" />
        <Pulse className="h-3 w-24" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <WishlistCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
