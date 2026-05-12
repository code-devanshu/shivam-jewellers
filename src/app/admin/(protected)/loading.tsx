function Sk({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} style={style} />;
}

export default function AdminDashboardLoading() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <Sk className="h-7 w-28 rounded-lg" />
          <Sk className="h-4 w-48 mt-2" />
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Sk className="h-7 w-28 rounded-full" />
          <Sk className="h-7 w-28 rounded-full" />
        </div>
      </div>

      {/* KPI row */}
      <div>
        <Sk className="h-3 w-16 mb-3 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <Sk className="w-10 h-10 rounded-xl" />
              </div>
              <Sk className="h-3 w-20" />
              <Sk className="h-7 w-24" />
              <Sk className="h-3 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Activity row */}
      <div>
        <Sk className="h-3 w-16 mb-3 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4">
              <Sk className="w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Sk className="h-6 w-10" />
                <Sk className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1.5">
              <Sk className="h-4 w-40" />
              <Sk className="h-3 w-52" />
            </div>
            <div className="flex items-center gap-3">
              <Sk className="h-3 w-12 rounded-full" />
              <Sk className="h-3 w-12 rounded-full" />
            </div>
          </div>
          <div className="flex items-end gap-2 h-36 px-1 pt-2">
            {[60, 45, 80, 30, 95, 55, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                  <Sk className="w-full rounded-t-md" style={{ height: `${h}%` } as React.CSSProperties} />
                </div>
                <Sk className="h-2 w-5 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Donut */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <Sk className="h-4 w-28 mb-1" />
          <Sk className="h-3 w-36 mb-5" />
          <div className="flex items-center gap-5">
            <Sk className="w-20 h-20 rounded-full shrink-0" />
            <div className="space-y-4 flex-1">
              <div className="space-y-1.5">
                <Sk className="h-3 w-20" />
                <Sk className="h-4 w-10" />
                <Sk className="h-3 w-16" />
              </div>
              <div className="space-y-1.5">
                <Sk className="h-3 w-20" />
                <Sk className="h-4 w-10" />
                <Sk className="h-3 w-16" />
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Sk className="h-3 w-20" />
                <Sk className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline + Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order pipeline */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <Sk className="h-4 w-28" />
            <Sk className="h-3 w-14" />
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Sk className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Sk className="h-3 w-24" />
                    <Sk className="h-3 w-6" />
                  </div>
                  <Sk className="h-1 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <Sk className="h-4 w-20" />
            <Sk className="h-3 w-14" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 flex flex-col items-center gap-1.5">
                <Sk className="h-6 w-8" />
                <Sk className="h-2.5 w-14 rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-3 pt-1">
            <Sk className="h-3 w-28" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Sk className="h-3 w-36" />
                <Sk className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((col) => (
          <div key={col} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Sk className="h-4 w-28" />
              <Sk className="h-3 w-16" />
            </div>
            <div className="divide-y divide-gray-50">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <Sk className="w-7 h-7 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Sk className="h-3.5 w-24" />
                      <Sk className="h-4 w-14 rounded-full" />
                    </div>
                    <Sk className="h-3 w-36" />
                  </div>
                  <Sk className="h-4 w-16 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <Sk className="w-9 h-9 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Sk className="h-4 w-20" />
              <Sk className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
