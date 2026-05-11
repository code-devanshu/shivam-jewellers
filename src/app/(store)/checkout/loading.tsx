function Bone({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-lg animate-pulse ${className ?? ""}`} />;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-blush rounded-2xl p-6 space-y-4">
      {children}
    </div>
  );
}

export default function CheckoutLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Bone className="h-8 w-36 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery method */}
          <Card>
            <Bone className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-3">
              <Bone className="h-20 rounded-xl" />
              <Bone className="h-20 rounded-xl" />
            </div>
            <Bone className="h-14 rounded-xl" />
          </Card>

          {/* Notes */}
          <Card>
            <Bone className="h-5 w-32" />
            <Bone className="h-20 rounded-xl" />
          </Card>

          {/* Payment method */}
          <Card>
            <Bone className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-3">
              <Bone className="h-20 rounded-xl" />
              <Bone className="h-20 rounded-xl" />
            </div>
          </Card>
        </div>

        {/* Right column — order summary */}
        <div className="space-y-4">
          <Card>
            <Bone className="h-5 w-36" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Bone className="w-14 h-14 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Bone className="h-3 w-3/4" />
                    <Bone className="h-3 w-1/2" />
                    <Bone className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-blush pt-4 space-y-2">
              <div className="flex justify-between">
                <Bone className="h-3 w-28" />
                <Bone className="h-3 w-16" />
              </div>
              <div className="flex justify-between">
                <Bone className="h-3 w-16" />
                <Bone className="h-3 w-16" />
              </div>
              <div className="flex justify-between pt-2">
                <Bone className="h-4 w-12" />
                <Bone className="h-4 w-20" />
              </div>
            </div>
          </Card>

          <Bone className="h-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}
