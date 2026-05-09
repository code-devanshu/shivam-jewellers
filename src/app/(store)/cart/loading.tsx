function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-blush/70 ${className}`} />;
}

function CartRowSkeleton() {
  return (
    <div className="flex gap-4 py-5 border-b border-blush last:border-0">
      <div className="w-24 h-24 rounded-2xl bg-blush/50 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-3 w-20" />
        <Pulse className="h-5 w-48" />
        <Pulse className="h-3 w-32" />
        <div className="flex items-center justify-between mt-3">
          <Pulse className="h-8 w-24 rounded-full" />
          <Pulse className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}

export default function CartLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Pulse className="h-8 w-24 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 bg-white border border-blush rounded-2xl px-5 divide-y divide-blush">
          <CartRowSkeleton />
          <CartRowSkeleton />
          <CartRowSkeleton />
        </div>

        {/* Summary */}
        <div className="bg-white border border-blush rounded-2xl p-5 space-y-4 h-fit">
          <Pulse className="h-5 w-32" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Pulse className="h-4 w-20" />
              <Pulse className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Pulse className="h-4 w-16" />
              <Pulse className="h-4 w-20" />
            </div>
            <div className="flex justify-between pt-2 border-t border-blush">
              <Pulse className="h-5 w-12" />
              <Pulse className="h-5 w-24" />
            </div>
          </div>
          <Pulse className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
