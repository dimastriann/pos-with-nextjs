'use client';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PageHeader } from '@/components/admin/PageHeader';
import { orderRepository } from '@/repositories/orderRepository';
import { productRepository } from '@/repositories/productRepository';
import { contactRepository } from '@/repositories/contactRepository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

interface DaySales {
  day: string;
  sales: number;
}

interface TopProduct {
  name: string;
  qty: number;
}

const INDIGO = 'oklch(0.511 0.262 276.966)';
const INDIGO_LIGHT = 'oklch(0.785 0.115 274.713)';

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [dailySales, setDailySales] = useState<DaySales[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    const load = async () => {
      const [orders, products, contacts, lines] = await Promise.all([
        orderRepository.getAll(),
        productRepository.getAll(),
        contactRepository.getAll(),
        orderRepository.getAllLines(),
      ]);

      const paid = orders.filter((o) => o.status === 'Paid');
      setStats({
        totalSales: paid.reduce((s, o) => s + o.totalAmount, 0),
        totalOrders: paid.length,
        totalProducts: products.length,
        totalCustomers: contacts.filter((c) => c.type === 'Customer').length,
      });

      // Last 7 days
      const days: DaySales[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        const dayStr = d.toDateString();
        const sales = paid
          .filter((o) => new Date(o.date).toDateString() === dayStr)
          .reduce((s, o) => s + o.totalAmount, 0);
        return { day: key, sales };
      });
      setDailySales(days);

      // Top 5 products by qty sold
      const qtyMap: Record<string, { name: string; qty: number }> = {};
      for (const l of lines) {
        if (!qtyMap[l.productId]) {
          qtyMap[l.productId] = { name: l.productName, qty: 0 };
        }
        qtyMap[l.productId].qty += l.qty;
      }
      const top = Object.values(qtyMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
      setTopProducts(top);
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Sales', value: `Rp ${stats.totalSales.toLocaleString()}` },
    { label: 'Orders', value: stats.totalOrders.toString() },
    { label: 'Products', value: stats.totalProducts.toString() },
    { label: 'Customers', value: stats.totalCustomers.toString() },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your store's performance."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.07 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {card.label}
                    </p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {card.value}
                    </h3>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-primary bg-primary/10 text-xs"
                  >
                    Live
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Daily sales bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sales — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailySales}
                margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={fmt}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(v: unknown) => [
                    `Rp ${Number(v).toLocaleString()}`,
                    'Sales',
                  ]}
                  cursor={{ fill: 'oklch(0.511 0.262 276.966 / 0.08)' }}
                />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill={INDIGO} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top products bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Products by Qty Sold</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
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
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v: unknown) => [Number(v), 'Qty']}
                    cursor={{ fill: 'oklch(0.511 0.262 276.966 / 0.08)' }}
                  />
                  <Bar dataKey="qty" radius={[0, 4, 4, 0]}>
                    {topProducts.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === 0 ? INDIGO : INDIGO_LIGHT}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
