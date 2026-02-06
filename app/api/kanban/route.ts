import { NextRequest, NextResponse } from 'next/server';
import {
  getAllTasks,
  createTask,
  updateTask,
  updateTaskPosition,
  deleteTask,
} from '@/lib/kanban';

// Required for Next.js static export (output: 'export')
export const dynamic = 'force-static';

// Kanban data is saved via Electron IPC -> Prisma -> SQLite in production

export async function GET() {
  try {
    const tasks = await getAllTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to get tasks:', error);
    return NextResponse.json({ error: 'Failed to get tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = await createTask(body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, position, status, ...updateData } = body;

    // If position or status is being updated, use updateTaskPosition
    if (position !== undefined || (status && updateData.status === undefined)) {
      const task = await updateTaskPosition(id, status || body.oldStatus, position);
      return NextResponse.json(task);
    }

    // Otherwise, use regular update
    const task = await updateTask(id, updateData);
    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    await deleteTask(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
