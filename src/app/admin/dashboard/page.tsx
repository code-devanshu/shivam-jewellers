export default function AdminDashboard() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div className="p-4 bg-white shadow-sm rounded-lg">
        <h3 className="text-lg font-medium">Total Users</h3>
        <p className="text-2xl font-bold">123</p>
      </div>
      <div className="p-4 bg-white shadow-sm rounded-lg">
        <h3 className="text-lg font-medium">Total Orders</h3>
        <p className="text-2xl font-bold">456</p>
      </div>
      <div className="p-4 bg-white shadow-sm rounded-lg">
        <h3 className="text-lg font-medium">Revenue</h3>
        <p className="text-2xl font-bold">$7890</p>
      </div>
    </div>
  );
}
