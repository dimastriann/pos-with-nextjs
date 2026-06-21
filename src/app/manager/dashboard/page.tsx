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
import { sessionRepository } from '@/repositories/sessionRepository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
} from 'lucide-react';
import { PosOrder, PosSession, PosOrderLine } from '@/models/PosModels';

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

interface DaySales {
  day: string;
  sales: number;
}

interface CashierRevenue {
  userId: string;
  revenue: number;
}

interface TopProduct {
  name: string;
  revenue: number;
}

interface SessionRow {
  id: string;
  startAt: string;
  status: 'Open' | 'Closed';
  orderCount: number;
  totalCash: number;
  userId: string;
}

interface StatCard {
  label: string;
  value: string;
  change: number | null;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function ChangeChip({ change }: { change: number }) {
  const isUp = change >= 0;
  return (
    <div
      className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        isUp
          ? 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-500'
          : 'bg-error-50 text-error-500 dark:bg-error-500/[0.12] dark:text-error-400'
      }`}
    >
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isUp ? '+' : ''}
      {change}%
    </div>
  );
}

function SessionStatusBadge({ status }: { status: 'Open' | 'Closed' }) {
  return status === 'Open' ? (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400">
      Open
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      Closed
    </span>
  );
}

export default function ManagerDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [statCards, setStatCards] = useState<StatCard[]>([
    {
      label: "Today's Revenue",
      value: 'Rp 0',
      change: 0,
      icon: DollarSign,
      iconBg: 'bg-success-50 dark:bg-success-500/[0.12]',
      iconColor: 'text-success-600',
    },
    {
      label: 'This Week Revenue',
      value: 'Rp 0',
      change: 0,
      icon: TrendingUp,
      iconBg: 'bg-brand-50 dark:bg-brand-500/[0.12]',
      iconColor: 'text-brand-500',
    },
    {
      label: 'Total Sessions',
      value: '0',
      change: null,
      icon: Calendar,
      iconBg: 'bg-warning-50 dark:bg-warning-500/[0.12]',
      iconColor: 'text-warning-600',
    },
    {
      label: 'Active Sessions',
      value: '0',
      change: null,
      icon: Activity,
      iconBg: 'bg-error-50 dark:bg-error-500/[0.12]',
      iconColor: 'text-error-500',
    },
  ]);
  const [dailySales, setDailySales] = useState<DaySales[]>([]);
  const [cashierRevenue, setCashierRevenue] = useState<CashierRevenue[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    const load = async () => {
      const [orders, sessions, lines] = await Promise.all([
        orderRepository.getAll(),
        sessionRepository.getAll(),
        orderRepository.getAllLines(),
      ]);

      const paid = orders.filter((o: PosOrder) => o.status === 'Paid');
      const now = new Date();
      const msDay = 86_400_000;

      // Today's revenue
      const todayOrders = paid.filter(
        (o: PosOrder) => new Date(o.date).toDateString() === now.toDateString(),
      );
      const yesterdayStr = new Date(now.getTime() - msDay).toDateString();
      const yesterdayOrders = paid.filter(
        (o: PosOrder) => new Date(o.date).toDateString() === yesterdayStr,
      );
      const todayRevenue = todayOrders.reduce((s: number, o: PosOrder) => s + o.totalAmount, 0);
      const yesterdayRevenue = yesterdayOrders.reduce((s: number, o: PosOrder) => s + o.totalAmount, 0);

      // This week revenue vs prior week
      const thisWeekOrders = paid.filter(
        (o: PosOrder) => now.getTime() - new Date(o.date).getTime() < 7 * msDay,
      );
      const priorWeekOrders = paid.filter((o: PosOrder) => {
        const age = now.getTime() - new Date(o.date).getTime();
        return age >= 7 * msDay && age < 14 * msDay;
      });
      const thisWeekRevenue = thisWeekOrders.reduce((s: number, o: PosOrder) => s + o.totalAmount, 0);
      const priorWeekRevenue = priorWeekOrders.reduce((s: number, o: PosOrder) => s + o.totalAmount, 0);

      // Sessions
      const totalSessions = sessions.length;
      const activeSessions = sessions.filter((s: PosSession) => s.status === 'Open').length;

      setStatCards([
        {
          label: "Today's Revenue",
          value: `Rp ${todayRevenue.toLocaleString()}`,
          change: pct(todayRevenue, yesterdayRevenue),
          icon: DollarSign,
          iconBg: 'bg-success-50 dark:bg-success-500/[0.12]',
          iconColor: 'text-success-600',
        },
        {
          label: 'This Week Revenue',
          value: `Rp ${thisWeekRevenue.toLocaleString()}`,
          change: pct(thisWeekRevenue, priorWeekRevenue),
          icon: TrendingUp,
          iconBg: 'bg-brand-50 dark:bg-brand-500/[0.12]',
          iconColor: 'text-brand-500',
        },
        {
          label: 'Total Sessions',
          value: totalSessions.toString(),
          change: null,
          icon: Calendar,
          iconBg: 'bg-warning-50 dark:bg-warning-500/[0.12]',
          iconColor: 'text-warning-600',
        },
        {
          label: 'Active Sessions',
          value: activeSessions.toString(),
          change: null,
          icon: Activity,
          iconBg: 'bg-error-50 dark:bg-error-500/[0.12]',
          iconColor: 'text-error-500',
        },
      ]);

      // Daily sales — last 7 days
      const days: DaySales[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        const dayStr = d.toDateString();
        const sales = paid
          .filter((o: PosOrder) => new Date(o.date).toDateString() === dayStr)
          .reduce((s: number, o: PosOrder) => s + o.totalAmount, 0);
        return { day: key, sales };
      });
      setDailySales(days);

      // Cashier revenue: group paid orders by sessionId, look up session.userId
      const sessionMap: Record<string, string> = {};
      for (const s of sessions) {
        sessionMap[s.id] = s.userId;
      }
      const cashierMap: Record<string, number> = {};
      for (const o of paid) {
        const userId = sessionMap[o.sessionId] ?? o.sessionId;
        cashierMap[userId] = (cashierMap[userId] ?? 0) + o.totalAmount;
      }
      const cashierData: CashierRevenue[] = Object.entries(cashierMap)
        .map(([userId, revenue]) => ({ userId, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8);
      setCashierRevenue(cashierData);

      // Recent sessions (last 8 sorted by startAt desc)
      const ordersPerSession: Record<string, number> = {};
      for (const o of paid) {
        ordersPerSession[o.sessionId] = (ordersPerSession[o.sessionId] ?? 0) + 1;
      }
      const sortedSessions = [...sessions]
        .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
        .slice(0, 8)
        .map((s: PosSession) => ({
          id: s.id,
          startAt: s.startAt,
          status: s.status,
          orderCount: ordersPerSession[s.id] ?? 0,
          totalCash: s.totalCash,
          userId: s.userId,
        }));
      setRecentSessions(sortedSessions);

      // Top 5 products by revenue (from all paid order lines)
      const paidOrderIds = new Set(paid.map((o: PosOrder) => o.id));
      const productMap: Record<string, number> = {};
      for (const l of lines as PosOrderLine[]) {
        if (!paidOrderIds.has(l.orderId)) continue;
        productMap[l.productName] = (productMap[l.productName] ?? 0) + l.subtotal;
      }
      const top5: TopProduct[] = Object.entries(productMap)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      setTopProducts(top5);

      setIsLoaded(true);
    };
    load();
  }, []);

  const maxProductRevenue = topProducts.length > 0 ? topProducts[0].revenue : 1;

  return (
    <div>
      <PageHeader
        title="Manager Dashboard"
        description="Shop performance overview and session analytics."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
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
                    {card.change !== null && card.change !== 0 && (
                      <ChangeChip change={card.change} />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-1">
                    {card.value}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  {card.change === null && (
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue Last 7 Days */}
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
                  <linearGradient id="mgr-salesGrad" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#mgr-salesGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: BRAND }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions by Cashier (Revenue) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Revenue by Cashier
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {cashierRevenue.length === 0 && isLoaded ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No sales data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cashierRevenue}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={fmt}
                    tick={{ fontSize: 11, fill: '#98a2b3' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="userId"
                    width={90}
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
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {cashierRevenue.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? BRAND : BRAND_LIGHT} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Sessions Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentSessions.length === 0 && isLoaded ? (
              <p className="text-sm text-gray-400 text-center py-8">No sessions yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.05] text-gray-500 dark:text-gray-400">
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Started
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide">
                      Orders
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide">
                      Cash Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {recentSessions.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="text-gray-800 dark:text-white/90 text-xs font-medium">
                          {new Date(s.startAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(s.startAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <SessionStatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700 dark:text-gray-300 font-medium">
                        {s.orderCount}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700 dark:text-gray-300 font-medium">
                        Rp {s.totalCash.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Products by Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Top 5 Products by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length === 0 && isLoaded ? (
              <p className="text-sm text-gray-400 text-center py-8">No sales data yet</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`font-bold text-xs flex-shrink-0 ${
                            i === 0 ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          #{i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0 ml-2">
                        Rp {fmt(p.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(p.revenue / maxProductRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
