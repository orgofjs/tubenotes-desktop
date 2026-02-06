'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { Folder } from '@/types';
import { foldersAPI } from '@/lib/electronAPI';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState('root');
  const [totalNotes, setTotalNotes] = useState(0);

  // Load folders on mount
  useEffect(() => {
    loadFolders();
  }, []);

  // Listen for notes count updates
  useEffect(() => {
    const handleNotesUpdate = (e: CustomEvent) => {
      setTotalNotes(e.detail.count);
    };

    window.addEventListener('updateNotesCount', handleNotesUpdate as EventListener);
    return () => {
      window.removeEventListener('updateNotesCount', handleNotesUpdate as EventListener);
    };
  }, []);

  const loadFolders = async () => {
    try {
      const data = await foldersAPI.getAll();
      // Always add root folder at the beginning
      const rootFolder: Folder = {
        id: 'root',
        name: 'Tüm Notlar',
        parentId: null,
        createdAt: new Date().toISOString(),
      };
      // Check if root folder already exists
      const hasRoot = data.some((f: Folder) => f.id === 'root');
      setFolders(hasRoot ? data : [rootFolder, ...data]);
    } catch (error) {
      console.error('Failed to load folders:', error);
      // If error, at least show root folder
      setFolders([{
        id: 'root',
        name: 'Tüm Notlar',
        parentId: null,
        createdAt: new Date().toISOString(),
      }]);
    }
  };

  const handleAddFolder = async (name: string, parentId: string | null) => {
    try {
      await foldersAPI.create({ name, parentId });
      loadFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await foldersAPI.delete(folderId);
      loadFolders();
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const handleCanvasSelect = (canvasId: string) => {
    // Check current path (use window.location for static export reliability)
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
    
    // Navigate to main page if not there
    if (currentPath !== '/' && currentPath !== '/index.html') {
      // Use Electron IPC navigation in production
      if (typeof window !== 'undefined' && (window as any).electronAPI?.navigation) {
        (window as any).electronAPI.navigation.goto('/');
        // After navigation, the page reloads, so we can't dispatch event here
        // Store in localStorage and read on mount
        return;
      } else {
        router.push('/');
        return;
      }
    }
    // Already on main page - just dispatch event immediately
    window.dispatchEvent(new CustomEvent('selectCanvas', { detail: { canvasId } }));
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
    
    // Check current path (use window.location for static export reliability)
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
    
    // Navigate to main page if not there
    if (currentPath !== '/' && currentPath !== '/index.html') {
      // Use Electron IPC navigation in production
      if (typeof window !== 'undefined' && (window as any).electronAPI?.navigation) {
        (window as any).electronAPI.navigation.goto('/');
        // After navigation, the page reloads
        return;
      } else {
        router.push('/');
        return;
      }
    }
    // Already on main page - just dispatch event immediately
    window.dispatchEvent(new CustomEvent('selectFolder', { detail: { folderId } }));
  };

  const handleQuickFilter = (filter: 'all' | 'important' | 'completed') => {
    // Check current path (use window.location for static export reliability)
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
    
    // Navigate to main page if not there
    if (currentPath !== '/' && currentPath !== '/index.html') {
      // Use Electron IPC navigation in production
      if (typeof window !== 'undefined' && (window as any).electronAPI?.navigation) {
        (window as any).electronAPI.navigation.goto('/');
        return;
      } else {
        router.push('/');
        return;
      }
    }
    // Already on main page - just dispatch event immediately
    window.dispatchEvent(new CustomEvent('quickFilter', { detail: { filter } }));
  };

  const handleSearch = (query: string) => {
    // Check current path (use window.location for static export reliability)
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
    
    // Navigate to main page if not there
    if (currentPath !== '/' && currentPath !== '/index.html') {
      // Use Electron IPC navigation in production
      if (typeof window !== 'undefined' && (window as any).electronAPI?.navigation) {
        (window as any).electronAPI.navigation.goto('/');
        return;
      } else {
        router.push('/');
        return;
      }
    }
    // Already on main page - just dispatch event immediately
    window.dispatchEvent(new CustomEvent('search', { detail: { query } }));
  };

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onFolderSelect={handleFolderSelect}
        onAddFolder={handleAddFolder}
        onDeleteFolder={handleDeleteFolder}
        totalNotes={totalNotes}
        onQuickFilter={handleQuickFilter}
        onSearch={handleSearch}
        onCanvasSelect={handleCanvasSelect}
      />
      {children}
    </div>
  );
}
