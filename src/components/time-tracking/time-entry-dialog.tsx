'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { timeEntrySchema, type TimeEntryInput } from '@/lib/validations';

interface TimeEntryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function TimeEntryDialog({ open, onClose }: TimeEntryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TimeEntryInput>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0] as any,
      billable: true,
    },
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', watch('projectId')],
    queryFn: async () => {
      const projectId = watch('projectId');
      if (!projectId) return [];
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!watch('projectId'),
  });

  const mutation = useMutation({
    mutationFn: async (data: TimeEntryInput) => {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Something went wrong');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast({
        title: 'Success',
        description: 'Time entry logged successfully',
      });
      reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: TimeEntryInput) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Time Entry</DialogTitle>
          <DialogDescription>
            Record time spent on a project or task
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">Project *</Label>
            <Select
              value={watch('projectId')}
              onValueChange={(value) => {
                setValue('projectId', value);
                setValue('taskId', undefined);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project: any) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} - {project.client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && (
              <p className="text-sm text-red-500">{errors.projectId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskId">Task (Optional)</Label>
            <Select
              value={watch('taskId')}
              onValueChange={(value) => setValue('taskId', value)}
              disabled={!watch('projectId')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No task selected</SelectItem>
                {tasks?.map((task: any) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours *</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0.1"
                {...register('hours')}
              />
              {errors.hours && (
                <p className="text-sm text-red-500">{errors.hours.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={3}
              placeholder="What did you work on?"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="billable"
              {...register('billable')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="billable" className="font-normal">
              Billable
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Logging...' : 'Log Time'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
