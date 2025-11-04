'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeEntryDialog } from '@/components/time-tracking/time-entry-dialog';
import { TimeEntriesTable } from '@/components/time-tracking/time-entries-table';
import { TimeStats } from '@/components/time-tracking/time-stats';
import { useToast } from '@/hooks/use-toast';
import { startOfWeek, endOfWeek } from 'date-fns';

export default function TimeTrackingPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries, isLoading } = useQuery({
    queryKey: ['time-entries', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      });
      const res = await fetch(`/api/time-entries?${params}`);
      if (!res.ok) throw new Error('Failed to fetch time entries');
      return res.json();
    },
  });

  const deleteTimeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/time-entries/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete time entry');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast({
        title: 'Success',
        description: 'Time entry deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete time entry',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      deleteTimeMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Time Tracking</h2>
          <p className="text-muted-foreground">
            Log and manage your time entries
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Log Time
        </Button>
      </div>

      <TimeStats timeEntries={timeEntries || []} />

      <TimeEntriesTable
        timeEntries={timeEntries || []}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      <TimeEntryDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
