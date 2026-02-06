import { prisma } from './db';
import { KanbanTask } from '@/types';

// Type assertion for kanbanTask - fixes TypeScript not recognizing the model
const db = prisma as any;

// Get all tasks - Fetch all kanban tasks from database
export async function getAllTasks() {
  return await db.kanbanTask.findMany({
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
  });
}

// Get tasks by status (column)
export async function getTasksByStatus(status: string) {
  return await db.kanbanTask.findMany({
    where: { status },
    orderBy: { position: 'asc' },
  });
}

// Create a new task
export async function createTask(data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: Date;
}) {
  // Get max position in the target column
  const maxPosition = await db.kanbanTask.aggregate({
    where: { status: data.status || 'todo' },
    _max: { position: true },
  });

  return await db.kanbanTask.create({
    data: {
      title: data.title,
      description: data.description || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate,
      position: (maxPosition._max.position || 0) + 1,
    },
  });
}

// Update task
export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: Date | null;
  }
) {
  return await db.kanbanTask.update({
    where: { id },
    data,
  });
}

// Update task position and status (for drag & drop)
export async function updateTaskPosition(
  id: string,
  newStatus: string,
  newPosition: number
) {
  const task = await db.kanbanTask.findUnique({ where: { id } });
  if (!task) throw new Error('Task not found');

  const oldStatus = task.status;
  const oldPosition = task.position;

  // Start transaction
  return await prisma.$transaction(async (tx: any) => {
    // If moving to a different column
    if (oldStatus !== newStatus) {
      // Decrease position of tasks after the old position in old column
      await tx.kanbanTask.updateMany({
        where: {
          status: oldStatus,
          position: { gt: oldPosition },
        },
        data: {
          position: { decrement: 1 },
        },
      });

      // Increase position of tasks at or after new position in new column
      await tx.kanbanTask.updateMany({
        where: {
          status: newStatus,
          position: { gte: newPosition },
        },
        data: {
          position: { increment: 1 },
        },
      });

      // Update the task
      return await tx.kanbanTask.update({
        where: { id },
        data: {
          status: newStatus,
          position: newPosition,
        },
      });
    } else {
      // Moving within the same column
      if (newPosition < oldPosition) {
        // Moving up
        await tx.kanbanTask.updateMany({
          where: {
            status: oldStatus,
            position: {
              gte: newPosition,
              lt: oldPosition,
            },
          },
          data: {
            position: { increment: 1 },
          },
        });
      } else if (newPosition > oldPosition) {
        // Moving down
        await tx.kanbanTask.updateMany({
          where: {
            status: oldStatus,
            position: {
              gt: oldPosition,
              lte: newPosition,
            },
          },
          data: {
            position: { decrement: 1 },
          },
        });
      }

      // Update the task
      return await tx.kanbanTask.update({
        where: { id },
        data: { position: newPosition },
      });
    }
  });
}

// Delete task
export async function deleteTask(id: string) {
  const task = await db.kanbanTask.findUnique({ where: { id } });
  if (!task) throw new Error('Task not found');

  // Decrease position of tasks after this one
  await db.kanbanTask.updateMany({
    where: {
      status: task.status,
      position: { gt: task.position },
    },
    data: {
      position: { decrement: 1 },
    },
  });

  return await db.kanbanTask.delete({
    where: { id },
  });
}
