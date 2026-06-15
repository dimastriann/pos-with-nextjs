'use client';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { PageHeader } from '@/components/admin/PageHeader';
import { orderRepository } from '@/repositories/orderRepository';
import { productRepository } from '@/repositories/productRepository';
import { contactRepository } from '@/repositories/contactRepository';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });

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
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {cards.map((card, idx) => (
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <Card className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Sales chart coming soon
          </p>
        </Card>
        <Card className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Recent activity coming soon
          </p>
        </Card>
      </div>
    </div>
  );
}
