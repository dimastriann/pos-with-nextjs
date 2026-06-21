'use client';
import { useEffect, useState } from 'react';
import { orderRepository } from '@/repositories/orderRepository';
import { PosOrder, PosOrderLine, PosPayment } from '@/models/PosModels';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Range = 'today' | 'week' | 'month' | 'all';
type Tab = 'summary' | 'products' | 'payments';

function filterByRange(orders: PosOrder[], range: Range): PosOrder[] {
  const now = new Date();
  return orders.filter((o) => {
    const d = new Date(o.date);
    if (range === 'today') return d.toDateString() === now.toDateString();
    if (range === 'week') return now.getTime() - d.getTime() <= 7 * 86400000;
    if (range === 'month')
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    return true;
  });
}

interface ProductStat {
  name: string;
  qtySold: number;
  revenue: number;
  totalDiscount: number;
  lineCount: number;
}

interface PaymentStat {
  methodName: string;
  transactions: number;
  total: number;
}

export default function ReportPage() {
  const [allOrders, setAllOrders] = useState<PosOrder[]>([]);
  const [allLines, setAllLines] = useState<PosOrderLine[]>([]);
  const [allPayments, setAllPayments] = useState<PosPayment[]>([]);
  const [range, setRange] = useState<Range>('today');
  const [tab, setTab] = useState<Tab>('summary');

  useEffect(() => {
    const load = async () => {
      const [orders, lines, payments] = await Promise.all([
        orderRepository.getAll(),
        orderRepository.getAllLines(),
        orderRepository.getAllPayments(),
      ]);
      setAllOrders(orders.filter((o) => o.status === 'Paid'));
      setAllLines(lines);
      setAllPayments(payments);
    };
    load();
  }, []);

  const filteredOrders = filterByRange(allOrders, range);
  const filteredOrderIds = new Set(filteredOrders.map((o) => o.id));

  const filteredLines = allLines.filter((l) => filteredOrderIds.has(l.orderId));
  const filteredPayments = allPayments.filter((p) => filteredOrderIds.has(p.orderId));

  // Summary stats
  const totalRevenue = filteredOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalDiscounts = filteredLines.reduce(
    (s, l) => s + l.price * l.qty * (l.discount / 100),
    0,
  );

  // Products tab: group filteredLines by productName
  const productMap: Record<string, ProductStat> = {};
  for (const l of filteredLines) {
    if (!productMap[l.productName]) {
      productMap[l.productName] = {
        name: l.productName,
        qtySold: 0,
        revenue: 0,
        totalDiscount: 0,
        lineCount: 0,
      };
    }
    productMap[l.productName].qtySold += l.qty;
    productMap[l.productName].revenue += l.subtotal;
    productMap[l.productName].totalDiscount += l.discount;
    productMap[l.productName].lineCount += 1;
  }
  const productStats: ProductStat[] = Object.values(productMap).sort(
    (a, b) => b.revenue - a.revenue,
  );

  // Payments tab: group filteredPayments by methodName
  const paymentMap: Record<string, PaymentStat> = {};
  for (const p of filteredPayments) {
    if (!paymentMap[p.methodName]) {
      paymentMap[p.methodName] = { methodName: p.methodName, transactions: 0, total: 0 };
    }
    paymentMap[p.methodName].transactions += 1;
    paymentMap[p.methodName].total += p.amount;
  }
  const paymentStats: PaymentStat[] = Object.values(paymentMap).sort(
    (a, b) => b.total - a.total,
  );
  const maxPaymentTotal = paymentStats.length > 0 ? paymentStats[0].total : 1;

  const ranges: { label: string; value: Range }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'All Time', value: 'all' },
  ];

  const tabs: { label: string; value: Tab }[] = [
    { label: 'Summary', value: 'summary' },
    { label: 'Products', value: 'products' },
    { label: 'Payments', value: 'payments' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Sales Report</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Overview of completed transactions
        </p>

        {/* Range selector */}
        <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg w-fit mb-4">
          {ranges.map((r) => (
            <Button
              key={r.value}
              variant={range === r.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRange(r.value)}
              className="text-sm"
            >
              {r.label}
            </Button>
          ))}
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 mb-6">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Summary Tab */}
        {tab === 'summary' && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    Rp {totalRevenue.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {totalOrders}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    Rp {Math.round(avgOrderValue).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Total Discounts</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    Rp {Math.round(totalDiscounts).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Orders table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Discount %</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredOrders.map((o) => {
                    const orderLines = allLines.filter((l) => l.orderId === o.id);
                    const discountAmt = orderLines.reduce(
                      (s, l) => s + l.price * l.qty * (l.discount / 100),
                      0,
                    );
                    const grossAmt = orderLines.reduce(
                      (s, l) => s + l.price * l.qty,
                      0,
                    );
                    const discountPct =
                      grossAmt > 0 ? Math.round((discountAmt / grossAmt) * 100) : 0;
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>{o.customerName || 'Guest'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(o.date).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {discountPct > 0 ? (
                            <span className="text-warning-600 dark:text-warning-500 font-medium">
                              {discountPct}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          Rp {o.totalAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Qty Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg Discount %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productStats.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No product data for this period
                    </TableCell>
                  </TableRow>
                )}
                {productStats.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium text-foreground">
                      {p.name}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {p.qtySold}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {p.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.lineCount > 0 ? (
                        <span
                          className={
                            Math.round(p.totalDiscount / p.lineCount) > 0
                              ? 'text-warning-600 dark:text-warning-500 font-medium'
                              : 'text-muted-foreground'
                          }
                        >
                          {Math.round(p.totalDiscount / p.lineCount)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Payments Tab */}
        {tab === 'payments' && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead>Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentStats.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No payment data for this period
                    </TableCell>
                  </TableRow>
                )}
                {paymentStats.map((p) => (
                  <TableRow key={p.methodName}>
                    <TableCell className="font-medium text-foreground">
                      {p.methodName}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {p.transactions}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-medium text-foreground flex-shrink-0">
                          Rp {p.total.toLocaleString()}
                        </span>
                        <div className="flex-1 max-w-32">
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                            <div
                              className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
                              style={{
                                width: `${(p.total / maxPaymentTotal) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
