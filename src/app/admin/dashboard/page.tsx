'use client';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { PageHeader } from '@/components/admin/PageHeader';
import { orderRepository } from '@/repositories/orderRepository';
import { productRepository } from '@/repositories/productRepository';
import { contactRepository } from '@/repositories/contactRepository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { PosOrder } from '@/models/PosModels';

interface DaySales {
  day: string;
  sales: number;
}

interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

const BRAND = '#465fff';
const BRAND_LIGHT = '#9cb9ff';

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function pct(current: number, prior: number) {
  if (prior === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prior) / prior) * 100);
}

function StatusBadge({ status }: { status: PosOrder['status'] }) {
  const styles = {
    Paid: 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400',
    Draft:
      'bg-warning-50 text-warning-600 dark:bg-warning-500/[0.12] dark:text-warning-500',
    Cancelled:
      'bg-error-50 text-error-600 dark:bg-error-500/[0.12] dark:text-error-400',
    Refunded: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [dailySales, setDailySales] = useState<DaySales[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<PosOrder[]>([]);

  const [statCards, setStatCards] = useState([
    {
      label: 'Total Revenue',
      value: 'Rp 0',
      change: 0,
      icon: DollarSign,
      iconBg: 'bg-success-50 dark:bg-success-500/[0.12]',
      iconColor: 'text-success-600',
    },
    {
      label: 'Total Orders',
      value: '0',
      change: 0,
      icon: ShoppingCart,
      iconBg: 'bg-error-50 dark:bg-error-500/[0.12]',
      iconColor: 'text-error-500',
    },
    {
      label: 'Products',
      value: '0',
      change: 0,
      icon: Package,
      iconBg: 'bg-brand-50 dark:bg-brand-500/[0.12]',
      iconColor: 'text-brand-500',
    },
    {
      label: 'Customers',
      value: '0',
      change: 0,
      icon: Users,
      iconBg: 'bg-warning-50 dark:bg-warning-500/[0.12]',
      iconColor: 'text-warning-500',
    },
  ]);

  useEffect(() => {
    const load = async () => {
      const [orders, products, contacts, lines] = await Promise.all([
        orderRepository.getAll(),
        productRepository.getAll(),
        contactRepository.getAll(),
        orderRepository.getAllLines(),
      ]);

      const paid = orders.filter((o) => o.status === 'Paid');
      const now = new Date();
      const msDay = 86_400_000;

      const thisWeek = paid.filter(
        (o) => now.getTime() - new Date(o.date).getTime() < 7 * msDay,
      );
      const lastWeek = paid.filter((o) => {
        const age = now.getTime() - new Date(o.date).getTime();
        return age >= 7 * msDay && age < 14 * msDay;
      });

      const thisRevenue = thisWeek.reduce((s, o) => s + o.totalAmount, 0);
      const lastRevenue = lastWeek.reduce((s, o) => s + o.totalAmount, 0);
      const totalRevenue = paid.reduce((s, o) => s + o.totalAmount, 0);
      const customers = contacts.filter((c) => c.type === 'Customer');

      setStatCards([
        {
          label: 'Total Revenue',
          value: `Rp ${totalRevenue.toLocaleString()}`,
          change: pct(thisRevenue, lastRevenue),
          icon: DollarSign,
          iconBg: 'bg-success-50 dark:bg-success-500/[0.12]',
          iconColor: 'text-success-600',
        },
        {
          label: 'Total Orders',
          value: paid.length.toString(),
          change: pct(thisWeek.length, lastWeek.length),
          icon: ShoppingCart,
          iconBg: 'bg-error-50 dark:bg-error-500/[0.12]',
          iconColor: 'text-error-500',
        },
        {
          label: 'Products',
          value: products.length.toString(),
          change: 0,
          icon: Package,
          iconBg: 'bg-brand-50 dark:bg-brand-500/[0.12]',
          iconColor: 'text-brand-500',
        },
        {
          label: 'Customers',
          value: customers.length.toString(),
          change: 0,
          icon: Users,
          iconBg: 'bg-warning-50 dark:bg-warning-500/[0.12]',
          iconColor: 'text-warning-500',
        },
      ]);

      const days: DaySales[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
        });
        const dayStr = d.toDateString();
        const sales = paid
          .filter((o) => new Date(o.date).toDateString() === dayStr)
          .reduce((s, o) => s + o.totalAmount, 0);
        return { day: key, sales };
      });
      setDailySales(days);

      const qtyMap: Record<string, TopProduct> = {};
      for (const l of lines) {
        if (!qtyMap[l.productId]) {
          qtyMap[l.productId] = { name: l.productName, qty: 0, revenue: 0 };
        }
        qtyMap[l.productId].qty += l.qty;
        qtyMap[l.productId].revenue += l.subtotal;
      }
      setTopProducts(
        Object.values(qtyMap)
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5),
      );

      setRecentOrders(
        [...paid]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, 8),
      );

      setIsLoaded(true);
    };
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your store's performance."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const isUp = card.change >= 0;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.07 }}
            >
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    {card.change !== 0 && (
                      <div
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isUp ? 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-500' : 'bg-error-50 text-error-500 dark:bg-error-500/[0.12] dark:text-error-400'}`}
                      >
                        {isUp ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {isUp ? '+' : ''}
                        {card.change}%
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-1">
                    {card.value}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {card.label}
                  </p>
                  {card.change === 0 && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      All time
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Revenue — Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56 pr-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailySales}
                margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(100,116,139,0.1)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#98a2b3' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={fmt}
                  tick={{ fontSize: 11, fill: '#98a2b3' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(v: unknown) => [
                    `Rp ${Number(v).toLocaleString()}`,
                    'Revenue',
                  ]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid #e4e7ec',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke={BRAND}
                  strokeWidth={2}
                  fill="url(#salesGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: BRAND }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Top Products by Qty Sold
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No sales data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#98a2b3' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 11, fill: '#98a2b3' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v: unknown) => [Number(v), 'Qty']}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: '1px solid #e4e7ec',
                    }}
                  />
                  <Bar dataKey="qty" radius={[0, 4, 4, 0]}>
                    {topProducts.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? BRAND : BRAND_LIGHT} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 && isLoaded ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No orders yet
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.05] text-gray-500 dark:text-gray-400">
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Customer
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800 dark:text-white/90">
                          {o.customerName || 'Guest'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(o.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                        Rp {o.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length === 0 && isLoaded ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No sales data yet
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.05] text-gray-500 dark:text-gray-400">
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      #
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Product
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide">
                      Qty
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {topProducts.map((p, i) => (
                    <tr
                      key={p.name}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span
                          className={`font-bold text-sm ${i === 0 ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'}`}
                        >
                          #{i + 1}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                        {p.name}
                      </td>
                      <td className="px-5 py-4 text-right text-gray-500 dark:text-gray-400">
                        {p.qty}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                        Rp {fmt(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
