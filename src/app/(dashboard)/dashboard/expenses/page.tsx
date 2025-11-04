'use client';

import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ExpensesPage() {
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await fetch('/api/expenses');
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Expenses</h2>
      <div className="grid gap-4">
        {expenses?.map((expense: any) => (
          <Card key={expense.id} className="p-6">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{expense.description}</h3>
                <p className="text-sm text-muted-foreground">
                  {expense.category}
                </p>
                <p className="text-sm">{formatDate(expense.date)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatCurrency(expense.amount)}
                </p>
                <Badge variant={expense.billable ? 'success' : 'secondary'}>
                  {expense.billable ? 'Billable' : 'Non-billable'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
