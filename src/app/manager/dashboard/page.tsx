import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ManagerDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-foreground">
        Shop Manager Dashboard
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Shop Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage your shop settings and staff access here.
          </p>
          <div className="mt-6 border-t border-border pt-4 space-y-1">
            <p className="text-sm text-muted-foreground">Shop ID: shop_1</p>
            <p className="text-sm text-muted-foreground">Status: Active</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
