// Electron IPC Helper for Canvas Operations

interface ElectronAPI {
  canvas: {
    getAll: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (data: { name: string; folderId?: string | null; data?: string }) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<{ success: boolean }>;
  };
  kanban: {
    getAll: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<{ success: boolean }>;
  };
  folders: {
    getAll: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (data: { name: string; parentId?: string | null }) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<{ success: boolean }>;
  };
  navigation: {
    goto: (path: string) => Promise<void>;
  };
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// Helper: Electron'da mı çalışıyoruz?
export const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron === true;

// Canvas API wrapper: Hem Electron hem Web için çalışır
export const canvasAPI = {
  async getAll() {
    if (isElectron) {
      return window.electronAPI!.canvas.getAll();
    } else {
      const response = await fetch('/api/canvas');
      if (!response.ok) throw new Error('Failed to fetch canvases');
      return response.json();
    }
  },

  async getById(id: string) {
    if (isElectron) {
      return window.electronAPI!.canvas.getById(id);
    } else {
      const response = await fetch(`/api/canvas?id=${id}`);
      if (!response.ok) throw new Error('Failed to fetch canvas');
      return response.json();
    }
  },

  async create(data: { name: string; folderId?: string | null; data?: string }) {
    if (isElectron) {
      return window.electronAPI!.canvas.create(data);
    } else {
      const response = await fetch('/api/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create canvas');
      return response.json();
    }
  },

  async update(id: string, data: any) {
    if (isElectron) {
      return window.electronAPI!.canvas.update(id, data);
    } else {
      const response = await fetch('/api/canvas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!response.ok) throw new Error('Failed to update canvas');
      return response.json();
    }
  },

  async delete(id: string) {
    if (isElectron) {
      return window.electronAPI!.canvas.delete(id);
    } else {
      const response = await fetch(`/api/canvas?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete canvas');
      return response.json();
    }
  },
};

// Kanban API wrapper
export const kanbanAPI = {
  async getAll() {
    if (isElectron) {
      return window.electronAPI!.kanban.getAll();
    } else {
      const response = await fetch('/api/kanban');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    }
  },

  async getById(id: string) {
    if (isElectron) {
      return window.electronAPI!.kanban.getById(id);
    } else {
      const response = await fetch(`/api/kanban?id=${id}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      return response.json();
    }
  },

  async create(data: any) {
    if (isElectron) {
      return window.electronAPI!.kanban.create(data);
    } else {
      const response = await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    }
  },

  async update(id: string, data: any) {
    if (isElectron) {
      return window.electronAPI!.kanban.update(id, data);
    } else {
      const response = await fetch('/api/kanban', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    }
  },

  async delete(id: string) {
    if (isElectron) {
      return window.electronAPI!.kanban.delete(id);
    } else {
      const response = await fetch(`/api/kanban?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return response.json();
    }
  },
};

// Folders API wrapper
export const foldersAPI = {
  async getAll() {
    if (isElectron) {
      return window.electronAPI!.folders.getAll();
    } else {
      const response = await fetch('/api/folders');
      if (!response.ok) throw new Error('Failed to fetch folders');
      return response.json();
    }
  },

  async create(data: { name: string; parentId?: string | null }) {
    if (isElectron) {
      return window.electronAPI!.folders.create(data);
    } else {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create folder');
      return response.json();
    }
  },

  async update(id: string, data: any) {
    if (isElectron) {
      return window.electronAPI!.folders.update(id, data);
    } else {
      const response = await fetch('/api/folders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!response.ok) throw new Error('Failed to update folder');
      return response.json();
    }
  },

  async delete(id: string) {
    if (isElectron) {
      return window.electronAPI!.folders.delete(id);
    } else {
      const response = await fetch(`/api/folders?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete folder');
      return response.json();
    }
  },
};
