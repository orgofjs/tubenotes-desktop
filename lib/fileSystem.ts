// File System API utilities for Save As and Open File functionality

export interface FileSystemSupport {
  supported: boolean;
  message?: string;
}

/**
 * Check if File System Access API is supported
 */
export function checkFileSystemSupport(): FileSystemSupport {
  if (typeof window === 'undefined') {
    return { supported: false, message: 'Not running in browser' };
  }

  if (!('showSaveFilePicker' in window) || !('showOpenFilePicker' in window)) {
    return { 
      supported: false, 
      message: 'File System Access API not supported. Use Chrome, Edge, or Opera.' 
    };
  }

  return { supported: true };
}

/**
 * Save data to a file using File System Access API
 */
export async function saveToFile(
  data: string,
  suggestedName: string,
  fileType: { description: string; accept: Record<string, string[]> }
): Promise<boolean> {
  try {
    const support = checkFileSystemSupport();
    if (!support.supported) {
      console.error(support.message);
      return false;
    }

    // @ts-ignore - File System Access API types
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [fileType],
    });

    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();

    return true;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // User cancelled
      return false;
    }
    console.error('Error saving file:', err);
    return false;
  }
}

/**
 * Open and read a file using File System Access API
 */
export async function openFile(
  fileType: { description: string; accept: Record<string, string[]> }
): Promise<string | null> {
  try {
    const support = checkFileSystemSupport();
    if (!support.supported) {
      console.error(support.message);
      return null;
    }

    // @ts-ignore - File System Access API types
    const [handle] = await window.showOpenFilePicker({
      types: [fileType],
      multiple: false,
    });

    const file = await handle.getFile();
    const contents = await file.text();
    return contents;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // User cancelled
      return null;
    }
    console.error('Error opening file:', err);
    return null;
  }
}

/**
 * Download fallback for browsers without File System Access API
 */
export function downloadFile(data: string, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Save canvas data to JSON file
 */
export async function saveCanvasToFile(
  canvasName: string,
  flowData: { nodes: any[]; edges: any[] }
): Promise<boolean> {
  const data = JSON.stringify(flowData, null, 2);
  const filename = `${canvasName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_canvas.json`;
  
  const support = checkFileSystemSupport();
  if (support.supported) {
    return await saveToFile(data, filename, {
      description: 'Canvas JSON',
      accept: { 'application/json': ['.json'] },
    });
  } else {
    // Fallback to download
    downloadFile(data, filename, 'application/json');
    return true;
  }
}

/**
 * Open canvas data from JSON file
 */
export async function openCanvasFromFile(): Promise<{ nodes: any[]; edges: any[] } | null> {
  const support = checkFileSystemSupport();
  
  let contents: string | null = null;
  
  if (support.supported) {
    contents = await openFile({
      description: 'Canvas JSON',
      accept: { 'application/json': ['.json'] },
    });
  } else {
    // Fallback to file input
    contents = await new Promise<string | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const text = await file.text();
          resolve(text);
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }

  if (!contents) return null;

  try {
    const data = JSON.parse(contents);
    if (data.nodes && data.edges) {
      return data;
    }
    console.error('Invalid canvas file format');
    return null;
  } catch (err) {
    console.error('Error parsing canvas file:', err);
    return null;
  }
}

/**
 * Export all app data to JSON file
 */
export async function exportAppData(
  folders: any[],
  notes: any[],
  canvases: any[]
): Promise<boolean> {
  const data = JSON.stringify(
    { folders, notes, canvases },
    null,
    2
  );
  
  const filename = `tubenotes_backup_${new Date().toISOString().split('T')[0]}.json`;
  
  const support = checkFileSystemSupport();
  if (support.supported) {
    return await saveToFile(data, filename, {
      description: 'TubeNotes Backup',
      accept: { 'application/json': ['.json'] },
    });
  } else {
    downloadFile(data, filename, 'application/json');
    return true;
  }
}

/**
 * Import app data from JSON file
 */
export async function importAppData(): Promise<{
  folders: any[];
  notes: any[];
  canvases: any[];
} | null> {
  const support = checkFileSystemSupport();
  
  let contents: string | null = null;
  
  if (support.supported) {
    contents = await openFile({
      description: 'TubeNotes Backup',
      accept: { 'application/json': ['.json'] },
    });
  } else {
    // Fallback to file input
    contents = await new Promise<string | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const text = await file.text();
          resolve(text);
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }

  if (!contents) return null;

  try {
    const data = JSON.parse(contents);
    if (data.folders && data.notes && data.canvases) {
      return data;
    }
    console.error('Invalid backup file format');
    return null;
  } catch (err) {
    console.error('Error parsing backup file:', err);
    return null;
  }
}
