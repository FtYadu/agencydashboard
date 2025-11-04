'use client';

import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Invoices</h2>
      <div className="grid gap-4">
        {invoices?.map((invoice: any) => (
          <Card key={invoice.id} className="p-6">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                <p className="text-sm text-muted-foreground">
                  {invoice.client.name}
                </p>
                <p className="text-sm">Due: {formatDate(invoice.dueDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatCurrency(invoice.total)}
                </p>
                <Badge>{invoice.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
