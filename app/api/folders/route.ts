import { NextRequest, NextResponse } from 'next/server';
import { getFolders, createFolder, updateFolder, deleteFolder } from '@/lib/db';

// Required for Next.js static export (output: 'export')
export const dynamic = 'force-static';

// Folders data is saved via Electron IPC -> Prisma -> SQLite in production

export async function GET() {
  try {
    const folders = await getFolders();
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Failed to get folders:', error);
    return NextResponse.json({ error: 'Failed to get folders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, parentId } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const folder = await createFolder(name, parentId);
    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('Failed to create folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'Folder ID and name are required' }, { status: 400 });
    }

    const folder = await updateFolder(id, name);
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Failed to update folder:', error);
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    await deleteFolder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete folder:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
