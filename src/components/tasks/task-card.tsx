'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  MessageSquare,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  task: any;
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'default';
      case 'LOW':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const isOverdue =
    task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED';

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <h4 className="font-medium leading-tight line-clamp-2">
                {task.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {task.project.client.name} • {task.project.name}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Move to
                </DropdownMenuLabel>
                {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED']
                  .filter((status) => status !== task.status)
                  .map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onStatusChange(task.id, status)}
                    >
                      {status.replace('_', ' ')}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Priority & Due Date */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
              {task.priority}
            </Badge>
            {task.dueDate && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  isOverdue ? 'text-red-600' : 'text-muted-foreground'
                }`}
              >
                {isOverdue && <AlertCircle className="h-3 w-3" />}
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {task._count && task._count.comments > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{task._count.comments}</span>
                </div>
              )}
              {task.estimatedHours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimatedHours}h</span>
                </div>
              )}
            </div>

            {/* Assignee */}
            {task.assignedTo && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignedTo.image || ''} />
                <AvatarFallback className="text-xs">
                  {getInitials(task.assignedTo.name || 'U')}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
