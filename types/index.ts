export interface VideoNote {
  id: string;
  url: string;
  title: string;
  channelName?: string;
  duration?: string;
  folderId: string;
  content: string;
  status: 'unwatched' | 'watching' | 'watched' | 'important';
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children?: Folder[];
  createdAt: string;
}

export interface AppData {
  notes: VideoNote[];
  folders: Folder[];
}

export interface YouTubeMetadata {
  title: string;
  thumbnailUrl: string;
  channelName?: string;
  duration?: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'on-hold' | 'done';
  position: number;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type KanbanColumn = 'todo' | 'in-progress' | 'on-hold' | 'done';
