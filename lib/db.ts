import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Folder operations
export async function getFolders() {
  return await prisma.folder.findMany({
    include: {
      children: true,
      notes: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

export async function createFolder(name: string, parentId?: string) {
  return await prisma.folder.create({
    data: {
      name,
      parentId: parentId || null,
    },
  });
}

export async function updateFolder(id: string, name: string) {
  return await prisma.folder.update({
    where: { id },
    data: { name },
  });
}

export async function deleteFolder(id: string) {
  return await prisma.folder.delete({
    where: { id },
  });
}

// VideoNote operations
export async function getNotes(folderId?: string) {
  return await prisma.videoNote.findMany({
    where: folderId ? { folderId } : {},
    include: {
      folder: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getNoteById(id: string) {
  return await prisma.videoNote.findUnique({
    where: { id },
    include: {
      folder: true,
    },
  });
}

export async function createNote(data: {
  title: string;
  videoUrl: string;
  channelName?: string;
  thumbnail?: string;
  folderId?: string;
}) {
  return await prisma.videoNote.create({
    data: {
      title: data.title,
      videoUrl: data.videoUrl,
      channelName: data.channelName,
      thumbnail: data.thumbnail,
      folderId: data.folderId || null,
    },
  });
}

export async function updateNote(
  id: string,
  data: {
    title?: string;
    content?: string;
    status?: string;
    important?: boolean;
    completed?: boolean;
    folderId?: string;
  }
) {
  return await prisma.videoNote.update({
    where: { id },
    data,
  });
}

export async function deleteNote(id: string) {
  return await prisma.videoNote.delete({
    where: { id },
  });
}

// Canvas operations
export async function getCanvases() {
  return await prisma.canvas.findMany({
    include: {
      nodes: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getCanvasById(id: string) {
  return await prisma.canvas.findUnique({
    where: { id },
    include: {
      nodes: true,
    },
  });
}

export async function createCanvas(params: { name: string; folderId?: string | null; data?: string }) {
  return await prisma.canvas.create({
    data: {
      name: params.name,
      data: params.data || JSON.stringify({ nodes: [], edges: [] }),
    },
  });
}

export async function updateCanvas(id: string, data: { name?: string; data?: string }) {
  return await prisma.canvas.update({
    where: { id },
    data,
  });
}

export async function deleteCanvas(id: string) {
  return await prisma.canvas.delete({
    where: { id },
  });
}

// CanvasNode operations
export async function createCanvasNode(data: {
  canvasId: string;
  type: string;
  positionX: number;
  positionY: number;
  width?: number;
  height?: number;
  content?: string;
  style?: string;
}) {
  return await prisma.canvasNode.create({
    data,
  });
}

export async function updateCanvasNode(
  id: string,
  data: {
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
    content?: string;
    style?: string;
  }
) {
  return await prisma.canvasNode.update({
    where: { id },
    data,
  });
}

export async function deleteCanvasNode(id: string) {
  return await prisma.canvasNode.delete({
    where: { id },
  });
}

// Migration helper: Import from old JSON system
export async function migrateFromJSON(jsonData: any) {
  try {
    // Migrate folders
    const folderMap = new Map<string, string>(); // old ID -> new ID

    for (const oldFolder of jsonData.folders || []) {
      const newFolder = await createFolder(oldFolder.name, folderMap.get(oldFolder.parentId || ''));
      folderMap.set(oldFolder.id, newFolder.id);
    }

    // Migrate notes
    for (const oldNote of jsonData.notes || []) {
      const newFolderId = oldNote.folderId ? folderMap.get(oldNote.folderId) : undefined;
      
      const newNote = await createNote({
        title: oldNote.title,
        videoUrl: oldNote.videoUrl,
        channelName: oldNote.channelName,
        thumbnail: oldNote.thumbnail,
        folderId: newFolderId,
      });

      // Update with additional fields
      await updateNote(newNote.id, {
        content: oldNote.content || '',
        status: oldNote.status || 'unwatched',
        important: oldNote.important || false,
        completed: oldNote.completed || false,
      });
    }

    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error };
  }
}
