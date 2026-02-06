const { contextBridge, ipcRenderer } = require('electron');

// IPC Köprüsü: Next.js ile Main Process arasında güvenli iletişim
contextBridge.exposeInMainWorld('electronAPI', {
  // Canvas CRUD operations
  canvas: {
    getAll: () => ipcRenderer.invoke('canvas:getAll'),
    getById: (id) => ipcRenderer.invoke('canvas:getById', id),
    create: (data) => ipcRenderer.invoke('canvas:create', data),
    update: (id, data) => ipcRenderer.invoke('canvas:update', id, data),
    delete: (id) => ipcRenderer.invoke('canvas:delete', id),
  },
  
  // Kanban CRUD operations
  kanban: {
    getAll: () => ipcRenderer.invoke('kanban:getAll'),
    getById: (id) => ipcRenderer.invoke('kanban:getById', id),
    create: (data) => ipcRenderer.invoke('kanban:create', data),
    update: (id, data) => ipcRenderer.invoke('kanban:update', id, data),
    delete: (id) => ipcRenderer.invoke('kanban:delete', id),
  },
  
  // Folders CRUD operations
  folders: {
    getAll: () => ipcRenderer.invoke('folders:getAll'),
    getById: (id) => ipcRenderer.invoke('folders:getById', id),
    create: (data) => ipcRenderer.invoke('folders:create', data),
    update: (id, data) => ipcRenderer.invoke('folders:update', id, data),
    delete: (id) => ipcRenderer.invoke('folders:delete', id),
  },
  
  // Navigation in production (bypasses Next.js Router)
  navigation: {
    goto: (path) => ipcRenderer.invoke('navigation:goto', path),
  },
  
  // Check if running in Electron
  isElectron: true,
});
