import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Required for Next.js static export (output: 'export')
export const dynamic = 'force-static';

// Canvas data is saved via Electron IPC -> Prisma -> SQLite in production

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const canvas = await prisma.canvas.findUnique({ where: { id } });
      if (!canvas) {
        return NextResponse.json({ error: 'Canvas not found' }, { status: 404 });
      }
      return NextResponse.json(canvas);
    }

    const canvases = await prisma.canvas.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(canvases);
  } catch (error) {
    console.error('Failed to get canvas:', error);
    return NextResponse.json({ error: 'Failed to get canvas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, folderId, data } = body;

    if (!name) {
      return NextResponse.json({ error: 'Canvas name is required' }, { status: 400 });
    }

    const canvas = await prisma.canvas.create({
      data: {
        name,
        data: data || '{}',
      },
    });
    return NextResponse.json(canvas, { status: 201 });
  } catch (error) {
    console.error('Failed to create canvas:', error);
    return NextResponse.json({ error: 'Failed to create canvas' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Canvas ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (data !== undefined) updateData.data = data;

    const canvas = await prisma.canvas.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(canvas);
  } catch (error) {
    console.error('Failed to update canvas:', error);
    return NextResponse.json({ error: 'Failed to update canvas' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Canvas ID is required' }, { status: 400 });
    }

    await prisma.canvas.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete canvas:', error);
    return NextResponse.json({ error: 'Failed to delete canvas' }, { status: 500 });
  }
}
