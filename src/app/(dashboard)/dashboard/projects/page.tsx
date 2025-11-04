'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Projects</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {projects?.map((project: any) => (
          <Card key={project.id} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.client.name}
                  </p>
                </div>
                <Badge>{project.status}</Badge>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-medium">
                    {project.budget ? formatCurrency(project.budget) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deadline</p>
                  <p className="font-medium">
                    {project.deadline ? formatDate(project.deadline) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tasks</p>
                  <p className="font-medium">{project._count?.tasks || 0}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
