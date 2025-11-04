'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign, CheckCircle2 } from 'lucide-react';

interface TimeStatsProps {
  timeEntries: any[];
}

export function TimeStats({ timeEntries }: TimeStatsProps) {
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const billableHours = timeEntries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.hours, 0);
  const nonBillableHours = totalHours - billableHours;

  const stats = [
    {
      title: 'Total Hours',
      value: totalHours.toFixed(2),
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Billable Hours',
      value: billableHours.toFixed(2),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Non-Billable Hours',
      value: nonBillableHours.toFixed(2),
      icon: CheckCircle2,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`rounded-full p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}h</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
