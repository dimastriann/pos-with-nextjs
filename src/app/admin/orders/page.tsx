'use client';
import { useState, useEffect } from 'react';
import { PosOrder, PosOrderLine, PosPayment } from '@/models/PosModels';
import { storageService, STORAGE_KEYS } from '@/services/storage';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';

export default function OrdersPage() {
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PosOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Nested Data for Display
  const [orderLines, setOrderLines] = useState<PosOrderLine[]>([]);
  const [orderPayments, setOrderPayments] = useState<PosPayment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const items = storageService.getAll<PosOrder>(STORAGE_KEYS.POS_ORDERS);
    setOrders(items);
  };

  const handleView = (order: PosOrder) => {
    // Determine related lines and payments
    const allLines = storageService.getAll<PosOrderLine>(
      STORAGE_KEYS.POS_ORDER_LINES,
    );
    const allPayments = storageService.getAll<PosPayment>(
      STORAGE_KEYS.POS_PAYMENTS,
    );

    const relatedLines = allLines.filter((l) => l.orderId === order.id);
    const relatedPayments = allPayments.filter((p) => p.orderId === order.id);

    setSelectedOrder(order);
    setOrderLines(relatedLines);
    setOrderPayments(relatedPayments);
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'Order Ref',
      accessor: 'id' as keyof PosOrder,
      className: 'font-mono',
    },
    {
      header: 'Customer',
      accessor: (o: PosOrder) => o.customerName || 'Guest',
    },
    {
      header: 'Date',
      accessor: (o: PosOrder) => new Date(o.date).toLocaleDateString(),
    },
    {
      header: 'Total',
      accessor: (o: PosOrder) => `$${o.totalAmount.toFixed(2)}`,
    },
    {
      header: 'Status',
      accessor: (o: PosOrder) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            o.status === 'Paid'
              ? 'bg-green-100 text-green-700'
              : o.status === 'Draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
          }`}
        >
          {o.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Orders" description="View and manage sales orders." />

      <DataTable
        data={orders}
        columns={columns}
        actions={(item) => (
          <button
            onClick={() => handleView(item)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </button>
        )}
      />

      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Order #${selectedOrder.id}`}
        >
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase">Customer</p>
                <p className="font-medium text-gray-900">
                  {selectedOrder.customerName || 'Guest'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedOrder.date).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Session</p>
                <p className="font-medium text-gray-900">
                  {selectedOrder.sessionId}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Total</p>
                <p className="font-bold text-xl text-blue-600">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Lines Table */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 border-b pb-1">
                Order Lines
              </h4>
              <table className="w-full text-sm">
                <thead className="text-gray-500 text-left">
                  <tr>
                    <th className="py-2">Product</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orderLines.map((line) => (
                    <tr key={line.id}>
                      <td className="py-2">{line.productName}</td>
                      <td className="py-2 text-right">{line.qty}</td>
                      <td className="py-2 text-right">
                        ${line.price.toFixed(2)}
                      </td>
                      <td className="py-2 text-right font-medium">
                        ${line.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payments Table */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 border-b pb-1">
                Payments
              </h4>
              <table className="w-full text-sm">
                <thead className="text-gray-500 text-left">
                  <tr>
                    <th className="py-2">Method</th>
                    <th className="py-2">Date</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orderPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-2">{payment.methodName}</td>
                      <td className="py-2">
                        {new Date(payment.date).toLocaleTimeString()}
                      </td>
                      <td className="py-2 text-right font-medium">
                        ${payment.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
