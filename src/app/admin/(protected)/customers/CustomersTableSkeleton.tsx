export default function CustomersTableSkeleton() {
  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
            <th className="text-left px-5 py-3 font-medium">Customer</th>
            <th className="text-left px-5 py-3 font-medium">Cart</th>
            <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Cart value</th>
            <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Orders</th>
            <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Joined</th>
            <th className="text-left px-5 py-3 font-medium">Contact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="align-top">
              <td className="px-5 py-3">
                <div className="h-3.5 w-24 bg-blush/60 rounded-full animate-pulse" />
                <div className="h-3 w-20 bg-blush/40 rounded-full animate-pulse mt-2" />
              </td>
              <td className="px-5 py-3">
                <div className="h-3.5 w-14 bg-blush/60 rounded-full animate-pulse" />
                <div className="h-3 w-32 bg-blush/40 rounded-full animate-pulse mt-2" />
              </td>
              <td className="px-5 py-3 hidden md:table-cell">
                <div className="h-3.5 w-16 bg-blush/60 rounded-full animate-pulse" />
              </td>
              <td className="px-5 py-3 hidden lg:table-cell">
                <div className="h-3.5 w-6 bg-blush/40 rounded-full animate-pulse" />
              </td>
              <td className="px-5 py-3 hidden md:table-cell">
                <div className="h-3.5 w-20 bg-blush/40 rounded-full animate-pulse" />
              </td>
              <td className="px-5 py-3">
                <div className="h-3.5 w-28 bg-blush/60 rounded-full animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
