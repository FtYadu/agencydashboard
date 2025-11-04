'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TimeEntriesTableProps {
  timeEntries: any[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export function TimeEntriesTable({
  timeEntries,
  isLoading,
  onDelete,
}: TimeEntriesTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading time entries...</p>
      </div>
    );
  }

  if (!timeEntries || timeEntries.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">No time entries found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start logging your time to track productivity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Billable</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeEntries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{formatDate(entry.date)}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{entry.project.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {entry.project.client.name}
                  </div>
                </div>
              </TableCell>
              <TableCell>{entry.task?.title || '-'}</TableCell>
              <TableCell className="max-w-xs truncate">
                {entry.description || '-'}
              </TableCell>
              <TableCell className="font-medium">{entry.hours}h</TableCell>
              <TableCell>
                <Badge
                  variant={entry.billable ? 'success' : 'secondary'}
                >
                  {entry.billable ? 'Billable' : 'Non-billable'}
                </Badge>
              </TableCell>
              <TableCell>{entry.user.name}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(entry.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
