// Load environment variables first
require('dotenv').config();

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

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
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'), // Preload script ekledik
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
    // Production mode - load from resources
    console.log('Production mode - Loading from file system');
    console.log('__dirname:', __dirname);
    
    // Try different possible paths for the built app
    const possiblePaths = [
      path.join(__dirname, 'out', 'index.html'),
      path.join(process.resourcesPath, 'app.asar', 'out', 'index.html'),
      path.join(process.resourcesPath, 'out', 'index.html'),
    ];
    
    let indexPath = null;
    for (const p of possiblePaths) {
      console.log('Checking path:', p);
      if (fs.existsSync(p)) {
        indexPath = p;
        console.log('Found index.html at:', indexPath);
        break;
      }
    }
    
    if (indexPath) {
      mainWindow.loadFile(indexPath).then(() => {
        console.log('File loaded successfully');
      }).catch(err => {
        console.error('Failed to load file:', err);
      });
    } else {
      console.error('Could not find index.html in any expected location');
      console.error('Searched paths:', possiblePaths);
    }
  }

  // Debug: Log console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer: ${message}`);
  });

  // Pencere kapatıldığında
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

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
    console.log(`IPC: Getting canvas by id: ${id}`);
    const canvas = await prisma.canvas.findUnique({
      where: { id },
    });
    if (!canvas) {
      console.warn(`IPC: Canvas not found: ${id}`);
      return null;
    }
    console.log(`IPC: Found canvas: ${canvas.name}`);
    return canvas;
  } catch (error) {
    console.error(`IPC Error - canvas:getById(${id}):`, error);
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
    console.log(`IPC: Updating canvas ${id} with:`, updates);
    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.data !== undefined) updateData.data = updates.data;
    
    const canvas = await prisma.canvas.update({
      where: { id },
      data: updateData,
    });
    
    if (!canvas) {
      console.warn(`IPC: Canvas not found during update: ${id}`);
      return null;
    }
    
    console.log(`IPC: Canvas updated: ${canvas.id}`);
    return canvas;
  } catch (error) {
    // Canvas silinmişse sessiçe geç
    if (error.code === 'P2025' || error.message.includes('not found')) {
      console.warn(`IPC: Canvas ${id} does not exist (probably deleted)`);
      return null;
    }
    console.error(`IPC Error - canvas:update(${id}):`, error);
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
// APP LIFECYCLE
// ============================================

// Electron hazır olduğunda pencereyi oluştur
app.whenReady().then(async () => {
  try {
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
    `);
    
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
