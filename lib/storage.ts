import { AppData, VideoNote, Folder } from '@/types';

const DATA_KEY = 'tubenotes_data';

export const storage = {
  getData: (): AppData => {
    if (typeof window === 'undefined') {
      return { notes: [], folders: [] };
    }
    
    try {
      const data = localStorage.getItem(DATA_KEY);
      if (!data) {
        const initialData: AppData = {
          notes: [],
          folders: [
            {
              id: 'root',
              name: 'Tüm Notlar',
              parentId: null,
              createdAt: new Date().toISOString(),
            },
          ],
        };
        localStorage.setItem(DATA_KEY, JSON.stringify(initialData));
        return initialData;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('localStorage error:', error);
      // Return minimal data instead of crashing
      return { notes: [], folders: [{ id: 'root', name: 'Tüm Notlar', parentId: null, createdAt: new Date().toISOString() }] };
    }
  },

  saveData: (data: AppData): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('localStorage save error:', error);
    }
  },

  addNote: (note: Omit<VideoNote, 'id' | 'createdAt' | 'updatedAt'>): VideoNote => {
    const data = storage.getData();
    const newNote: VideoNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.notes.push(newNote);
    storage.saveData(data);
    return newNote;
  },

  updateNote: (id: string, updates: Partial<VideoNote>): void => {
    const data = storage.getData();
    const noteIndex = data.notes.findIndex((n) => n.id === id);
    if (noteIndex !== -1) {
      data.notes[noteIndex] = {
        ...data.notes[noteIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      storage.saveData(data);
    }
  },

  deleteNote: (id: string): void => {
    const data = storage.getData();
    data.notes = data.notes.filter((n) => n.id !== id);
    storage.saveData(data);
  },

  addFolder: (folder: Omit<Folder, 'id' | 'createdAt'>): Folder => {
    const data = storage.getData();
    const newFolder: Folder = {
      ...folder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    data.folders.push(newFolder);
    storage.saveData(data);
    return newFolder;
  },

  updateFolder: (id: string, updates: Partial<Folder>): void => {
    const data = storage.getData();
    const folderIndex = data.folders.findIndex((f) => f.id === id);
    if (folderIndex !== -1) {
      data.folders[folderIndex] = {
        ...data.folders[folderIndex],
        ...updates,
      };
      storage.saveData(data);
    }
  },

  deleteFolder: (id: string): void => {
    const data = storage.getData();
    // Delete all notes in this folder
    data.notes = data.notes.filter((n) => n.folderId !== id);
    // Delete the folder
    data.folders = data.folders.filter((f) => f.id !== id);
    // Move child folders to parent
    data.folders.forEach((f) => {
      if (f.parentId === id) {
        f.parentId = null;
      }
    });
    storage.saveData(data);
  },

  getNotesByFolder: (folderId: string): VideoNote[] => {
    const data = storage.getData();
    return data.notes.filter((n) => n.folderId === folderId);
  },
};
