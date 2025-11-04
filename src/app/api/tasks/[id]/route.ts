import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { taskSchema } from '@/lib/validations';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await db.task.findUnique({
      where: { id: params.id },
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
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        timeEntries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = taskSchema.partial().parse(body);

    const oldTask = await db.task.findUnique({
      where: { id: params.id },
    });

    const task = await db.task.update({
      where: { id: params.id },
      data: validatedData,
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

    // Create notification if status changed to completed
    if (
      oldTask?.status !== 'COMPLETED' &&
      task.status === 'COMPLETED' &&
      task.assignedToId
    ) {
      await db.notification.create({
        data: {
          type: 'TASK_COMPLETED',
          title: 'Task Completed',
          message: `Task "${task.title}" has been marked as completed`,
          userId: task.assignedToId,
          link: `/dashboard/tasks/${task.id}`,
        },
      });
    }

    // Create activity log
    await db.activity.create({
      data: {
        type: 'TASK_UPDATED',
        description: `Updated task: ${task.title}`,
        userId: session.user.id,
        metadata: {
          taskId: task.id,
          changes: validatedData,
        },
      },
    });

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Error updating task:', error);
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await db.task.findUnique({
      where: { id: params.id },
    });

    await db.task.delete({
      where: { id: params.id },
    });

    // Create activity log
    if (task) {
      await db.activity.create({
        data: {
          type: 'TASK_UPDATED',
          description: `Deleted task: ${task.title}`,
          userId: session.user.id,
          metadata: {
            taskId: params.id,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
