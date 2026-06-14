import { PageHeader } from '@/components/admin/PageHeader';

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Total Sales',
      value: '$12,450',
      change: '+12%',
      color: 'bg-blue-600',
    },
    { label: 'Orders', value: '540', change: '+5%', color: 'bg-indigo-600' },
    { label: 'Products', value: '32', change: '0%', color: 'bg-purple-600' },
    { label: 'Customers', value: '128', change: '+18%', color: 'bg-pink-600' },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your store's performance."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
            <div
              className={`text-xs font-bold text-white px-2 py-1 rounded-full ${stat.color}`}
            >
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center">
          <p className="text-gray-400">Sales Chart Placeholder</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center">
          <p className="text-gray-400">Recent Activity Placeholder</p>
        </div>
      </div>
    </div>
  );
}
