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
  
  // Check if running in Electron
  isElectron: true,
});
