import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  FolderKanban,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

async function getDashboardStats(userId: string) {
  const [
    clientsCount,
    projectsCount,
    tasksCount,
    invoicesCount,
    activeProjects,
    recentTasks,
  ] = await Promise.all([
    db.client.count(),
    db.project.count(),
    db.task.count(),
    db.invoice.count(),
    db.project.count({
      where: {
        status: {
          in: ['IN_PROGRESS', 'PLANNING'],
        },
      },
    }),
    db.task.findMany({
      where: {
        assignedToId: userId,
        status: {
          not: 'COMPLETED',
        },
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        project: true,
      },
    }),
  ]);

  const totalRevenue = await db.invoice.aggregate({
    where: {
      status: 'PAID',
    },
    _sum: {
      total: true,
    },
  });

  return {
    clientsCount,
    projectsCount,
    tasksCount,
    invoicesCount,
    activeProjects,
    recentTasks,
    totalRevenue: totalRevenue._sum.total || 0,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const stats = await getDashboardStats(session.user.id);

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.clientsCount,
      icon: Users,
      description: 'Active clients',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: FolderKanban,
      description: `${stats.projectsCount} total projects`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Tasks',
      value: stats.tasksCount,
      icon: CheckCircle2,
      description: 'Across all projects',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      description: `${stats.invoicesCount} invoices`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Tasks</CardTitle>
          <CardDescription>
            Tasks assigned to you that need attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You don&apos;t have any pending tasks at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {task.project.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        task.status === 'TODO'
                          ? 'bg-gray-100 text-gray-800'
                          : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
