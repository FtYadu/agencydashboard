'use client';

import { TaskCard } from './task-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, PlayCircle, XCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  estimatedHours?: number | null;
  project: {
    id: string;
    name: string;
    client: {
      name: string;
    };
  };
  assignedTo?: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  } | null;
  _count?: {
    comments: number;
    timeEntries: number;
  };
}

interface KanbanBoardProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

const columns = [
  {
    id: 'TODO',
    title: 'To Do',
    icon: Circle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    icon: PlayCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'IN_REVIEW',
    title: 'In Review',
    icon: Circle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
  },
  {
    id: 'COMPLETED',
    title: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
  },
];

export function KanbanBoard({
  tasks,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanBoardProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        const Icon = column.icon;

        return (
          <Card key={column.id} className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className={`rounded-full p-1.5 ${column.bgColor}`}>
                  <Icon className={`h-4 w-4 ${column.color}`} />
                </div>
                {column.title}
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {columnTasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 pb-4">
              {columnTasks.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
                  <p className="text-sm text-muted-foreground">No tasks</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
