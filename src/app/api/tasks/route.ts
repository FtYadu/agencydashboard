import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { db } from '@/lib/db';
import { taskSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const tasks = await db.task.findMany({
      where,
      include: {
        project: {
          include: {
            client: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            timeEntries: true,
          },
        },
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = taskSchema.parse(body);

    const task = await db.task.create({
      data: {
        ...validatedData,
        createdById: session.user.id,
      },
      include: {
        project: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification if task is assigned
    if (task.assignedToId && task.assignedToId !== session.user.id) {
      await db.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned to task: ${task.title}`,
          userId: task.assignedToId,
          link: `/dashboard/tasks/${task.id}`,
        },
      });
    }

    // Create activity log
    await db.activity.create({
      data: {
        type: 'TASK_CREATED',
        description: `Created task: ${task.title}`,
        userId: session.user.id,
        metadata: {
          taskId: task.id,
          projectId: task.projectId,
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
