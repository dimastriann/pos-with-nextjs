'use client';
import { useState, useEffect } from 'react';
import { PosOrder, PosOrderLine, PosPayment } from '@/models/PosModels';
import { orderRepository } from '@/repositories/orderRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';

export default function OrdersPage() {
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PosOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderLines, setOrderLines] = useState<PosOrderLine[]>([]);
  const [orderPayments, setOrderPayments] = useState<PosPayment[]>([]);

  useEffect(() => { loadData(); }, []);

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

  const columns = [
    { header: 'Order Ref', accessor: 'id' as keyof PosOrder, className: 'font-mono text-xs' },
    { header: 'Customer', accessor: (o: PosOrder) => o.customerName || 'Guest' },
    { header: 'Date', accessor: (o: PosOrder) => new Date(o.date).toLocaleDateString() },
    { header: 'Total', accessor: (o: PosOrder) => `Rp ${o.totalAmount.toLocaleString()}` },
    {
      header: 'Status',
      accessor: (o: PosOrder) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${o.status === 'Paid' ? 'bg-green-100 text-green-700' : o.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {o.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Orders" description="View and manage sales orders." />
      <DataTable data={orders} columns={columns} actions={(item) => (
        <Button variant="link" size="sm" className="text-primary" onClick={() => handleView(item)}>View Details</Button>
      )} />

      {selectedOrder && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Order #${selectedOrder.id}`}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div><p className="text-xs text-gray-500 uppercase">Customer</p><p className="font-medium text-gray-900">{selectedOrder.customerName || 'Guest'}</p></div>
              <div><p className="text-xs text-gray-500 uppercase">Date</p><p className="font-medium text-gray-900">{new Date(selectedOrder.date).toLocaleString()}</p></div>
              <div><p className="text-xs text-gray-500 uppercase">Session</p><p className="font-medium text-gray-900 text-xs font-mono">{selectedOrder.sessionId}</p></div>
              <div><p className="text-xs text-gray-500 uppercase">Total</p><p className="font-bold text-xl text-blue-600">Rp {selectedOrder.totalAmount.toLocaleString()}</p></div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 border-b pb-1">Order Lines</h4>
              <table className="w-full text-sm">
                <thead className="text-gray-500 text-left"><tr><th className="py-2">Product</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Subtotal</th></tr></thead>
                <tbody className="divide-y">
                  {orderLines.map((line) => (
                    <tr key={line.id}>
                      <td className="py-2">{line.productName}</td>
                      <td className="py-2 text-right">{line.qty}</td>
                      <td className="py-2 text-right">Rp {line.price.toLocaleString()}</td>
                      <td className="py-2 text-right font-medium">Rp {line.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 border-b pb-1">Payments</h4>
              <table className="w-full text-sm">
                <thead className="text-gray-500 text-left"><tr><th className="py-2">Method</th><th className="py-2">Date</th><th className="py-2 text-right">Amount</th></tr></thead>
                <tbody className="divide-y">
                  {orderPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-2">{payment.methodName}</td>
                      <td className="py-2">{new Date(payment.date).toLocaleTimeString()}</td>
                      <td className="py-2 text-right font-medium">Rp {payment.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
