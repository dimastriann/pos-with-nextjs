'use client';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/admin/PageHeader';
import { orderRepository } from '@/repositories/orderRepository';
import { productRepository } from '@/repositories/productRepository';
import { contactRepository } from '@/repositories/contactRepository';

interface Stats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalSales: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 });

  useEffect(() => {
    const load = async () => {
      const [orders, products, contacts] = await Promise.all([
        orderRepository.getAll(),
        productRepository.getAll(),
        contactRepository.getAll(),
      ]);
      const paidOrders = orders.filter((o) => o.status === 'Paid');
      setStats({
        totalSales: paidOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        totalOrders: paidOrders.length,
        totalProducts: products.length,
        totalCustomers: contacts.filter((c) => c.type === 'Customer').length,
      });
    };
    load();
  }, []);

  const cards = [
    { label: 'Total Sales', value: `Rp ${stats.totalSales.toLocaleString()}`, color: 'bg-blue-600' },
    { label: 'Orders', value: stats.totalOrders.toString(), color: 'bg-indigo-600' },
    { label: 'Products', value: stats.totalProducts.toString(), color: 'bg-purple-600' },
    { label: 'Customers', value: stats.totalCustomers.toString(), color: 'bg-pink-600' },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your store's performance." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            </div>
            <div className={`text-xs font-bold text-white px-2 py-1 rounded-full ${card.color}`}>Live</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Sales chart coming soon</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Recent activity coming soon</p>
        </div>
      </div>
    </div>
  );
}
