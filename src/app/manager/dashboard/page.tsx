export default function ManagerDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Shop Manager Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Shop Configuration</h2>
        <p className="text-gray-600">
          Manage your shop settings and staff access here.
        </p>

        {/* Placeholder for shop config */}
        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-500">Shop ID: shop_1</p>
          <p className="text-sm text-gray-500">Status: Active</p>
        </div>
      </div>
    </div>
  );
}
