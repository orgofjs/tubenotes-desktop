// Load environment variables first
require('dotenv').config();

const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const isDev = process.env.NODE_ENV === 'development';

// CRITICAL: Register protocol as privileged BEFORE app.whenReady
// This must be done synchronously at startup, not in async callback
if (!isDev) {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: false,
        stream: true,
        allowServiceWorkers: false,
        bypassCSP: false
      }
    }
  ]);
}

// Prisma ve Database değişkenlerini global tanımla
let prisma;
let mainWindow;

// DATABASE_URL'i app.whenReady'den ÖNCE ayarlayalım (boş bir değerle başlayalım)
// Bu, require sırasında adaptörün çökmesini engelleyecek
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./temp.db'; // Geçici değer
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: !isDev, // Disable only in dev for hot reload
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#0a0a0a',
    title: 'TubeNotes',
    icon: path.join(__dirname, 'public', 'icon-512x512.png'),
    autoHideMenuBar: true,
    show: false,
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Development modunda localhost'u, production'da static dosyaları yükle
  if (isDev) {
    console.log('Development mode - Loading URL: http://localhost:3000');
    
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
    
    mainWindow.loadURL('http://localhost:3000').then(() => {
      console.log('LoadURL successful');
    }).catch(err => {
      console.error('LoadURL error:', err);
    });
  } else {
    // Production mode - use custom app:// protocol
    console.log('Production mode - Loading via app:// protocol');
    
    mainWindow.loadURL('app://./index.html').then(() => {
      console.log('App loaded successfully via app:// protocol');
      // Open DevTools only if debugging
      // mainWindow.webContents.openDevTools();
    }).catch(err => {
      console.error('Failed to load app:', err);
    });
  }

  // Debug: Log console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer: ${message}`);
  });

  // Production: Handle external links only, allow internal navigation via IPC
  if (!isDev) {
    // Handle new window requests (e.g., target="_blank")
    mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
      // Open external links in default browser
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        require('electron').shell.openExternal(targetUrl);
      }
      return { action: 'deny' }; // Prevent new Electron windows
    });
  }

  // Pencere kapatıldığında
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============================================
// IPC HANDLERS: Navigation (Production only)
// ============================================

// Navigation: Go to page (bypasses Next.js Router in static export)
ipcMain.handle('navigation:goto', async (event, path) => {
  if (!mainWindow) return;
  
  // Map paths to HTML files (trailingSlash: true structure)
  const pathMap = {
    '/': 'app://./index.html',
    '/kanban': 'app://./kanban/index.html',
  };
  
  const targetUrl = pathMap[path] || `app://.${path}/index.html`;
  console.log(`[Navigation] Loading: ${path} -> ${targetUrl}`);
  
  try {
    await mainWindow.loadURL(targetUrl);
  } catch (error) {
    console.error(`[Navigation] Failed to load ${targetUrl}:`, error);
  }
});

// ============================================
// IPC HANDLERS: Prisma ile Canvas CRUD İşlemleri
// ============================================

// Canvas: Tüm canvas'ları getir
ipcMain.handle('canvas:getAll', async () => {
  try {
    const canvases = await prisma.canvas.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    // data -> flowData mapping
    return canvases.map(c => ({
      id: c.id,
      name: c.name,
      flowData: c.data,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));
  } catch (error) {
    console.error('canvas:getAll error:', error);
    throw error;
  }
});

// Canvas: ID'ye göre canvas getir
ipcMain.handle('canvas:getById', async (event, id) => {
  try {
    console.log(`[IPC GETBYID] Fetching canvas: ${id}`);
    const canvas = await prisma.canvas.findUnique({
      where: { id },
    });
    if (!canvas) {
      console.warn(`[IPC GETBYID] Canvas not found: ${id}`);
      return null;
    }
    console.log(`[IPC GETBYID] Found: ${canvas.name}`);
    console.log(`[IPC GETBYID] Data length:`, canvas.data?.length || 0);
    console.log(`[IPC GETBYID] Data preview:`, canvas.data?.substring(0, 200));
    return canvas;
  } catch (error) {
    console.error(`[IPC GETBYID ERROR] Canvas ${id}:`, error);
    throw error;
  }
});

// Canvas: Yeni canvas oluştur
ipcMain.handle('canvas:create', async (event, canvasData) => {
  try {
    console.log('IPC: Creating canvas:', canvasData.name);
    const canvas = await prisma.canvas.create({
      data: {
        name: canvasData.name,
        data: canvasData.data || JSON.stringify({ nodes: [], edges: [] }),
      },
    });
    console.log('IPC: Canvas created with id:', canvas.id);
    return canvas;
  } catch (error) {
    console.error('IPC Error - canvas:create:', error);
    throw error;
  }
});

// Canvas: Canvas güncelle
ipcMain.handle('canvas:update', async (event, id, updates) => {
  try {
    console.log(`[IPC UPDATE] Canvas ${id}`);
    console.log(`[IPC UPDATE] Updates:`, JSON.stringify(updates).substring(0, 300));
    
    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.data !== undefined) updateData.data = updates.data;
    
    const canvas = await prisma.canvas.update({
      where: { id },
      data: updateData,
    });
    
    if (!canvas) {
      console.warn(`[IPC UPDATE] Canvas not found: ${id}`);
      return null;
    }
    
    console.log(`[IPC UPDATE] Success - Canvas ${canvas.id} updated`);
    console.log(`[IPC UPDATE] Saved data length:`, canvas.data?.length || 0);
    return canvas;
  } catch (error) {
    // Canvas silinmişse sessizce geç
    if (error.code === 'P2025' || error.message.includes('not found')) {
      console.warn(`[IPC UPDATE] Canvas ${id} does not exist (probably deleted)`);
      return null;
    }
    console.error(`[IPC UPDATE ERROR] Canvas ${id}:`, error);
    throw error;
  }
});

// Canvas: Canvas sil
ipcMain.handle('canvas:delete', async (event, id) => {
  try {
    console.log(`IPC: Deleting canvas: ${id}`);
    await prisma.canvas.delete({
      where: { id },
    });
    console.log(`IPC: Canvas deleted: ${id}`);
    return { success: true };
  } catch (error) {
    console.error(`IPC Error - canvas:delete(${id}):`, error);
    throw error;
  }
});

// ============================================
// KANBAN IPC HANDLERS
// ============================================

// Kanban: Tüm task'ları getir
ipcMain.handle('kanban:getAll', async () => {
  try {
    const tasks = await prisma.kanbanTask.findMany({
      orderBy: { position: 'asc' },
    });
    return tasks;
  } catch (error) {
    console.error('kanban:getAll error:', error);
    throw error;
  }
});

// Kanban: ID'ye göre task getir
ipcMain.handle('kanban:getById', async (event, id) => {
  try {
    const task = await prisma.kanbanTask.findUnique({
      where: { id },
    });
    return task || null;
  } catch (error) {
    console.error(`kanban:getById error (${id}):`, error);
    throw error;
  }
});

// Kanban: Yeni task oluştur
ipcMain.handle('kanban:create', async (event, taskData) => {
  try {
    console.log('IPC: Creating kanban task:', taskData);
    const task = await prisma.kanbanTask.create({
      data: taskData,
    });
    console.log('IPC: Kanban task created with id:', task.id);
    return task;
  } catch (error) {
    console.error('IPC Error - kanban:create:', error);
    throw error;
  }
});

// Kanban: Task güncelle
ipcMain.handle('kanban:update', async (event, id, updates) => {
  try {
    console.log(`IPC: Updating kanban task ${id}`, updates);
    const task = await prisma.kanbanTask.update({
      where: { id },
      data: updates,
    });
    console.log(`IPC: Kanban task updated: ${task.id}`);
    return task;
  } catch (error) {
    console.error(`IPC Error - kanban:update(${id}):`, error);
    throw error;
  }
});

// Kanban: Task sil
ipcMain.handle('kanban:delete', async (event, id) => {
  try {
    console.log(`IPC: Deleting kanban task: ${id}`);
    await prisma.kanbanTask.delete({
      where: { id },
    });
    console.log(`IPC: Kanban task deleted: ${id}`);
    return { success: true };
  } catch (error) {
    console.error(`IPC Error - kanban:delete(${id}):`, error);
    throw error;
  }
});

// ============================================
// FOLDERS IPC HANDLERS
// ============================================

// Folders: Tüm folder'ları getir
ipcMain.handle('folders:getAll', async () => {
  try {
    const folders = await prisma.folder.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return folders;
  } catch (error) {
    console.error('folders:getAll error:', error);
    throw error;
  }
});

// Folders: ID'ye göre folder getir
ipcMain.handle('folders:getById', async (event, id) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id },
    });
    return folder || null;
  } catch (error) {
    console.error(`folders:getById error (${id}):`, error);
    throw error;
  }
});

// Folders: Yeni folder oluştur
ipcMain.handle('folders:create', async (event, folderData) => {
  try {
    console.log('IPC: Creating folder:', folderData);
    const folder = await prisma.folder.create({
      data: folderData,
    });
    console.log('IPC: Folder created with id:', folder.id);
    return folder;
  } catch (error) {
    console.error('IPC Error - folders:create:', error);
    throw error;
  }
});

// Folders: Folder güncelle
ipcMain.handle('folders:update', async (event, id, updates) => {
  try {
    console.log(`IPC: Updating folder ${id}`, updates);
    const folder = await prisma.folder.update({
      where: { id },
      data: updates,
    });
    console.log(`IPC: Folder updated: ${folder.id}`);
    return folder;
  } catch (error) {
    console.error(`IPC Error - folders:update(${id}):`, error);
    throw error;
  }
});

// Folders: Folder sil
ipcMain.handle('folders:delete', async (event, id) => {
  try {
    console.log(`IPC: Deleting folder: ${id}`);
    await prisma.folder.delete({
      where: { id },
    });
    console.log(`IPC: Folder deleted: ${id}`);
    return { success: true };
  } catch (error) {
    console.error(`IPC Error - folders:delete(${id}):`, error);
    throw error;
  }
});

// ============================================
// APP LIFECYCLE
// ============================================

// Electron hazır olduğunda pencereyi oluştur
app.whenReady().then(async () => {
  try {
    // Register custom protocol BEFORE creating window (production only)
    if (!isDev) {
      protocol.registerFileProtocol('app', (request, callback) => {
      // Tell Windows this app handles app:// protocol
      if (process.defaultApp) {
        if (process.argv.length >= 2) {
          app.setAsDefaultProtocolClient('app', process.execPath, [path.resolve(process.argv[1])]);
        }
      } else {
        app.setAsDefaultProtocolClient('app');
      }

      // Register file protocol handler
        let requestedUrl = request.url.replace('app://', '');
        // Remove leading ./ if present
        requestedUrl = requestedUrl.replace(/^\.\//, '');
        
        // Resolve path relative to out directory
        const filePath = path.normalize(path.join(__dirname, 'out', requestedUrl));
        
        console.log(`[Protocol] Requested: ${request.url} -> Resolved: ${filePath}`);
        
        callback({ path: filePath });
      });
    }

    // SQLite veritabanını kullanıcının AppData klasöründe saklayalım
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'tubenotes.db');
    
    console.log('🔗 Veritabanı yolu:', dbPath);
    
    // better-sqlite3 ile doğrudan bağlantı (Prisma adapter olmadan)
    const Database = require('better-sqlite3');
    const db = new Database(dbPath);
    
    // Tabloları oluştur (eğer yoksa)
    db.exec(`
      CREATE TABLE IF NOT EXISTS Canvas (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT DEFAULT '{}',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      );
      
      CREATE TABLE IF NOT EXISTS Folder (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parentId TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (parentId) REFERENCES Folder(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS KanbanTask (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'todo',
        position INTEGER NOT NULL DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        dueDate TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      );
    `);
    
    // Root folder'ı ekle (yoksa)
    const checkRoot = db.prepare('SELECT * FROM Folder WHERE id = ?').get('root');
    if (!checkRoot) {
      const now = new Date().toISOString();
      db.prepare('INSERT INTO Folder (id, name, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)')
        .run('root', 'Tüm Notlar', null, now, now);
      console.log('✅ Root folder created');
    }
    
    // Global prisma yerine db objesi kullanacağız
    prisma = {
      canvas: {
        findMany: (options = {}) => {
          const stmt = db.prepare('SELECT * FROM Canvas ORDER BY updatedAt DESC');
          return stmt.all();
        },
        findUnique: (options) => {
          const stmt = db.prepare('SELECT * FROM Canvas WHERE id = ?');
          const result = stmt.get(options.where.id);
          return result || null;
        },
        create: (options) => {
          const id = require('crypto').randomUUID();
          const now = new Date().toISOString();
          const stmt = db.prepare(
            'INSERT INTO Canvas (id, name, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
          );
          stmt.run(id, options.data.name, options.data.data, now, now);
          const created = { 
            id, 
            name: options.data.name,
            data: options.data.data,
            createdAt: now, 
            updatedAt: now 
          };
          console.log('Canvas created:', created);
          return created;
        },
        update: (options) => {
          const now = new Date().toISOString();
          const stmt = db.prepare(
            'UPDATE Canvas SET name = COALESCE(?, name), data = COALESCE(?, data), updatedAt = ? WHERE id = ?'
          );
          stmt.run(options.data.name, options.data.data, now, options.where.id);
          // findUnique'i doğrudan çağır
          const selectStmt = db.prepare('SELECT * FROM Canvas WHERE id = ?');
          return selectStmt.get(options.where.id);
        },
        delete: (options) => {
          const stmt = db.prepare('DELETE FROM Canvas WHERE id = ?');
          stmt.run(options.where.id);
          return { id: options.where.id };
        }
      },
      folder: {
        findMany: (options = {}) => {
          const stmt = db.prepare('SELECT * FROM Folder ORDER BY createdAt DESC');
          return stmt.all();
        },
        findUnique: (options) => {
          const stmt = db.prepare('SELECT * FROM Folder WHERE id = ?');
          const result = stmt.get(options.where.id);
          return result || null;
        },
        create: (options) => {
          const id = require('crypto').randomUUID();
          const now = new Date().toISOString();
          const stmt = db.prepare(
            'INSERT INTO Folder (id, name, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
          );
          stmt.run(id, options.data.name, options.data.parentId || null, now, now);
          const created = { 
            id, 
            name: options.data.name,
            parentId: options.data.parentId || null,
            createdAt: now, 
            updatedAt: now 
          };
          console.log('Folder created:', created);
          return created;
        },
        update: (options) => {
          const now = new Date().toISOString();
          const fields = [];
          const values = [];
          if (options.data.name !== undefined) {
            fields.push('name = ?');
            values.push(options.data.name);
          }
          if (options.data.parentId !== undefined) {
            fields.push('parentId = ?');
            values.push(options.data.parentId);
          }
          fields.push('updatedAt = ?');
          values.push(now);
          values.push(options.where.id);
          
          const stmt = db.prepare(`UPDATE Folder SET ${fields.join(', ')} WHERE id = ?`);
          stmt.run(...values);
          const selectStmt = db.prepare('SELECT * FROM Folder WHERE id = ?');
          return selectStmt.get(options.where.id);
        },
        delete: (options) => {
          const stmt = db.prepare('DELETE FROM Folder WHERE id = ?');
          stmt.run(options.where.id);
          return { id: options.where.id };
        }
      },
      kanbanTask: {
        findMany: (options = {}) => {
          const stmt = db.prepare('SELECT * FROM KanbanTask ORDER BY position ASC');
          return stmt.all();
        },
        findUnique: (options) => {
          const stmt = db.prepare('SELECT * FROM KanbanTask WHERE id = ?');
          const result = stmt.get(options.where.id);
          return result || null;
        },
        create: (options) => {
          const id = require('crypto').randomUUID();
          const now = new Date().toISOString();
          const data = options.data;
          const stmt = db.prepare(
            'INSERT INTO KanbanTask (id, title, description, status, position, priority, dueDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
          );
          stmt.run(
            id, 
            data.title, 
            data.description || null, 
            data.status || 'todo', 
            data.position || 0,
            data.priority || 'medium',
            data.dueDate || null,
            now, 
            now
          );
          const created = { 
            id, 
            title: data.title,
            description: data.description || null,
            status: data.status || 'todo',
            position: data.position || 0,
            priority: data.priority || 'medium',
            dueDate: data.dueDate || null,
            createdAt: now, 
            updatedAt: now 
          };
          console.log('KanbanTask created:', created);
          return created;
        },
        update: (options) => {
          const now = new Date().toISOString();
          const fields = [];
          const values = [];
          const data = options.data;
          
          if (data.title !== undefined) {
            fields.push('title = ?');
            values.push(data.title);
          }
          if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
          }
          if (data.status !== undefined) {
            fields.push('status = ?');
            values.push(data.status);
          }
          if (data.position !== undefined) {
            fields.push('position = ?');
            values.push(data.position);
          }
          if (data.priority !== undefined) {
            fields.push('priority = ?');
            values.push(data.priority);
          }
          if (data.dueDate !== undefined) {
            fields.push('dueDate = ?');
            values.push(data.dueDate);
          }
          
          fields.push('updatedAt = ?');
          values.push(now);
          values.push(options.where.id);
          
          const stmt = db.prepare(`UPDATE KanbanTask SET ${fields.join(', ')} WHERE id = ?`);
          stmt.run(...values);
          const selectStmt = db.prepare('SELECT * FROM KanbanTask WHERE id = ?');
          return selectStmt.get(options.where.id);
        },
        delete: (options) => {
          const stmt = db.prepare('DELETE FROM KanbanTask WHERE id = ?');
          stmt.run(options.where.id);
          return { id: options.where.id };
        }
      },
      $connect: async () => {},
      $disconnect: async () => { db.close(); }
    };
    
    console.log('✅ Veritabanı başarıyla bağlandı:', dbPath);
    
    // Eğer veritabanı dosyası yoksa, initialize et
    if (!fs.existsSync(dbPath)) {
      console.log('Database file not found, initializing...');
    }
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error);
  }
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Tüm pencereler kapatıldığında uygulamadan çık (macOS hariç)
app.on('window-all-closed', async () => {
  // Uygulama kapanmadan önce Prisma bağlantısını kapat
  await prisma.$disconnect();
  console.log('✓ Prisma disconnected');
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Güvenlik: External linkleri varsayılan tarayıcıda aç
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // YouTube linklerini tarayıcıda aç
    if (url.startsWith('https://www.youtube.com') || url.startsWith('https://youtu.be')) {
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
});
