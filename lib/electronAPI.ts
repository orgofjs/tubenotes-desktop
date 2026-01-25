// Electron IPC Helper for Canvas Operations

interface ElectronAPI {
  canvas: {
    getAll: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (data: { name: string; folderId?: string | null; data?: string }) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<{ success: boolean }>;
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
