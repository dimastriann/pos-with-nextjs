'use client';
import { useState, useEffect } from 'react';
import { PosOrder, PosOrderLine, PosPayment } from '@/models/PosModels';
import { orderRepository } from '@/repositories/orderRepository';
import { productRepository } from '@/repositories/productRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';

function StatusBadge({ status }: { status: PosOrder['status'] }) {
  const cls: Record<string, string> = {
    Paid: 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400',
    Draft:
      'bg-warning-50 text-warning-600 dark:bg-warning-500/[0.12] dark:text-warning-600',
    Cancelled:
      'bg-error-50 text-error-600 dark:bg-error-500/[0.12] dark:text-error-400',
    Refunded: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls[status] ?? cls.Refunded}`}
    >
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PosOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderLines, setOrderLines] = useState<PosOrderLine[]>([]);
  const [orderPayments, setOrderPayments] = useState<PosPayment[]>([]);

  // Refund state
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundOrder, setRefundOrder] = useState<PosOrder | null>(null);
  const [refundLines, setRefundLines] = useState<PosOrderLine[]>([]);
  const [refundQtys, setRefundQtys] = useState<Record<string, number>>({});
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => setOrders(await orderRepository.getAll());

  const handleView = async (order: PosOrder) => {
    const [lines, payments] = await Promise.all([
      orderRepository.getLinesByOrderId(order.id),
      orderRepository.getPaymentsByOrderId(order.id),
    ]);
    setSelectedOrder(order);
    setOrderLines(lines);
    setOrderPayments(payments);
    setIsModalOpen(true);
  };

  const handleOpenRefund = async (order: PosOrder) => {
    const lines = await orderRepository.getLinesByOrderId(order.id);
    setRefundOrder(order);
    setRefundLines(lines);
    const defaultQtys: Record<string, number> = {};
    lines.forEach((l) => { defaultQtys[l.id] = l.qty; });
    setRefundQtys(defaultQtys);
    setIsRefundModalOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!refundOrder) return;
    setIsRefunding(true);
    try {
      for (const line of refundLines) {
        const qty = refundQtys[line.id] ?? 0;
        if (qty > 0) {
          await productRepository.incrementStock(line.productId, qty);
        }
      }
      await orderRepository.updateStatus(refundOrder.id, 'Refunded');
      await loadData();
      setIsRefundModalOpen(false);
      setRefundOrder(null);
    } finally {
      setIsRefunding(false);
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: (o: PosOrder) => (
        <div>
          <div className="font-medium">{o.customerName || 'Guest'}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {o.id.slice(0, 8).toUpperCase()}
          </div>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: (o: PosOrder) => (
        <div>
          <div>{new Date(o.date).toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(o.date).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Total',
      accessor: (o: PosOrder) => (
        <div>
          <div className="font-medium">Rp {o.totalAmount.toLocaleString()}</div>
          {(o.orderDiscount ?? 0) > 0 && (
            <div className="text-xs text-green-600 dark:text-green-400">
              −{o.orderDiscount}% disc
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Notes',
      accessor: (o: PosOrder) =>
        o.notes ? (
          <span className="text-xs text-muted-foreground truncate max-w-[120px] block">
            {o.notes}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: 'Status',
      accessor: (o: PosOrder) => <StatusBadge status={o.status} />,
    },
  ];

  return (
    <div>
      <PageHeader title="Orders" description="View and manage sales orders." />
      <DataTable
        data={orders}
        columns={columns}
        actions={(item) => (
          <div className="flex gap-1">
            <Button
              variant="link"
              size="sm"
              className="text-primary"
              onClick={() => handleView(item)}
            >
              View
            </Button>
            {item.status === 'Paid' && (
              <Button
                variant="link"
                size="sm"
                className="text-error-500 dark:text-error-400"
                onClick={() => handleOpenRefund(item)}
              >
                Refund
              </Button>
            )}
          </div>
        )}
      />

      {/* View Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Order #${selectedOrder.id.slice(0, 8).toUpperCase()}`}
        >
          <div className="space-y-5">
            {/* Summary grid */}
            <div className="grid grid-cols-2 gap-3 bg-muted/40 rounded-xl p-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                  Customer
                </p>
                <p className="text-sm font-medium">
                  {selectedOrder.customerName || 'Guest'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                  Date
                </p>
                <p className="text-sm font-medium">
                  {new Date(selectedOrder.date).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                  Status
                </p>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                  Total
                </p>
                <p className="text-lg font-bold text-primary">
                  Rp {selectedOrder.totalAmount.toLocaleString()}
                </p>
              </div>
              {(selectedOrder.orderDiscount ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                    Discount
                  </p>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {selectedOrder.orderDiscount}%
                  </p>
                </div>
              )}
              {selectedOrder.notes && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                    Notes
                  </p>
                  <p className="text-sm font-medium">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Order Lines */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Order Lines
              </h4>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Product
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        Qty
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orderLines.map((line) => (
                      <tr
                        key={line.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2 text-foreground">
                          {line.productName}
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground">
                          {line.qty}
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground">
                          Rp {line.price.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-foreground">
                          Rp {line.subtotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Payments
              </h4>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Method
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Time
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orderPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2 font-medium text-foreground">
                          {payment.methodName}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {new Date(payment.date).toLocaleTimeString()}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-foreground">
                          Rp {payment.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-1 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Refund Modal */}
      {refundOrder && (
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          title={`Refund Order #${refundOrder.id.slice(0, 8).toUpperCase()}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select quantities to return. Stock will be restored automatically.
            </p>

            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                      Sold
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                      Return Qty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {refundLines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-3 py-2 text-foreground">
                        {line.productName}
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {line.qty}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          max={line.qty}
                          value={refundQtys[line.id] ?? line.qty}
                          onChange={(e) =>
                            setRefundQtys((prev) => ({
                              ...prev,
                              [line.id]: Math.min(
                                line.qty,
                                Math.max(0, parseInt(e.target.value) || 0),
                              ),
                            }))
                          }
                          className="w-16 text-right border border-border rounded px-2 py-1 text-sm bg-background text-foreground [appearance:textfield]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 rounded-xl p-3 text-sm text-error-700 dark:text-error-400">
              This action will mark the order as <strong>Refunded</strong> and
              restore stock for returned items. This cannot be undone.
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setIsRefundModalOpen(false)}
                disabled={isRefunding}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmRefund}
                disabled={isRefunding}
              >
                {isRefunding ? 'Processing…' : 'Confirm Refund'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
