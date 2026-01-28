'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Folder, FolderPlus, ChevronRight, ChevronDown, Star, Clock, Trash2, Grid3x3, Plus, Edit2 } from 'lucide-react';
import { Folder as FolderType } from '@/types';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { canvasAPI } from '@/lib/electronAPI';

interface Canvas {
  id: string;
  name: string;
  folderId: string | null;
  data: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SidebarProps {
  folders: FolderType[];
  selectedFolderId: string;
  onFolderSelect: (folderId: string) => void;
  onAddFolder: (name: string, parentId: string | null) => void;
  onDeleteFolder: (folderId: string) => void;
  totalNotes: number;
  onQuickFilter: (filter: 'all' | 'important' | 'completed') => void;
  onSearch: (query: string) => void;
  onCanvasSelect?: (canvasId: string) => void;
}

export default function Sidebar({
  folders,
  selectedFolderId,
  onFolderSelect,
  onAddFolder,
  onDeleteFolder,
  totalNotes,
  onQuickFilter,
  onSearch,
  onCanvasSelect,
}: SidebarProps) {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [isAddingCanvas, setIsAddingCanvas] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [editingCanvasId, setEditingCanvasId] = useState<string | null>(null);
  const [editingCanvasName, setEditingCanvasName] = useState('');
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);

  // Load canvases on mount
  useEffect(() => {
    loadCanvases();
  }, []);

  const loadCanvases = async () => {
    try {
      const loadedCanvases = await canvasAPI.getAll();
      setCanvases(loadedCanvases);
    } catch (error) {
      console.error('Failed to load canvases:', error);
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim(), newFolderParentId);
      setNewFolderName('');
      setIsAddingFolder(false);
      setNewFolderParentId(null);
    }
  };

  const handleAddCanvas = async () => {
    if (newCanvasName.trim()) {
      try {
        await canvasAPI.create({
          name: newCanvasName.trim(),
          folderId: selectedFolderId === 'root' ? null : selectedFolderId,
          data: JSON.stringify({ nodes: [], edges: [] }),
        });
        
        setNewCanvasName('');
        setIsAddingCanvas(false);
        loadCanvases();
      } catch (error) {
        console.error('Failed to create canvas:', error);
      }
    }
  };

  const handleRenameCanvas = async (canvasId: string) => {
    if (editingCanvasName.trim()) {
      try {
        await canvasAPI.update(canvasId, { name: editingCanvasName.trim() });
        
        setEditingCanvasId(null);
        setEditingCanvasName('');
        loadCanvases();
      } catch (error) {
        console.error('Failed to rename canvas:', error);
      }
    }
  };

  const handleDeleteCanvas = async (canvasId: string) => {
    try {
      await canvasAPI.delete(canvasId);
      
      if (selectedCanvasId === canvasId) {
        setSelectedCanvasId(null);
      }
      loadCanvases();
    } catch (error) {
      console.error('Failed to delete canvas:', error);
    }
  };

  const handleCanvasClick = (canvasId: string) => {
    setSelectedCanvasId(canvasId);
    if (onCanvasSelect) {
      onCanvasSelect(canvasId);
    }
  };

  const renderFolderTree = (parentId: string | null, depth: number = 0) => {
    const childFolders = folders.filter((f) => f.parentId === parentId);

    return childFolders.map((folder, index) => {
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedFolderId === folder.id;
      const hasChildren = folders.some((f) => f.parentId === folder.id);

      return (
        <motion.div
          key={folder.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group"
        >
          <div
            className={`
              flex items-center gap-2 px-4 py-3 cursor-pointer
              transition-all duration-200
              ${isSelected
                ? 'bg-[var(--accent-primary)] text-[var(--background)]'
                : 'hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)]'
              }
              border-l-3 ${isSelected ? 'border-[var(--accent-secondary)]' : 'border-transparent'}
            `}
            style={{ paddingLeft: `${depth * 20 + 12}px` }}
            onClick={() => onFolderSelect(folder.id)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="hover:text-[var(--accent-secondary)] transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            
            <Folder size={16} />
            <span className="flex-1 text-sm font-mono truncate">
              {folder.name}
            </span>

            {folder.id !== 'root' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-[var(--accent-primary)] transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {isExpanded && hasChildren && renderFolderTree(folder.id, depth + 1)}
        </motion.div>
      );
    });
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-72 h-screen bg-[var(--surface)] border-r-3 border-[var(--border)] flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b-3 border-[var(--border)]">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h1 className="text-display text-3xl text-[var(--accent-primary)] mb-1">
              {t('tubeNotes')}
            </h1>
            <p className="text-xs text-[var(--foreground-muted)] font-mono">
              {t('visualVideoKnowledgeBase')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)] z-10"
            size={16}
          />
          <input
            type="text"
            placeholder={t('searchNotes')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="
              w-full pl-12 pr-4 py-2
              bg-[var(--background)]
              border-2 border-[var(--border)]
              text-sm font-mono
              focus:border-[var(--accent-primary)] focus:outline-none
              transition-colors
              placeholder:text-[var(--foreground-muted)]
            "
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4 space-y-1">
        <QuickActionButton
          icon={<Star size={16} />}
          label={t('important')}
          onClick={() => onQuickFilter('important')}
        />
        <QuickActionButton
          icon={<Clock size={16} />}
          label={t('completed')}
          onClick={() => onQuickFilter('completed')}
        />
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono text-[var(--foreground-muted)] uppercase">
            {t('folders')}
          </h2>
          <button
            onClick={() => setIsAddingFolder(true)}
            className="text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] transition-colors"
          >
            <FolderPlus size={16} />
          </button>
        </div>

        {isAddingFolder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-2 bg-[var(--background)] border-2 border-[var(--accent-primary)]"
          >
            <input
              type="text"
              placeholder={t('folderNamePlaceholder')}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddFolder();
                if (e.key === 'Escape') {
                  setIsAddingFolder(false);
                  setNewFolderName('');
                }
              }}
              autoFocus
              className="w-full bg-transparent text-sm font-mono focus:outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddFolder}
                className="flex-1 py-1 bg-[var(--accent-primary)] text-[var(--background)] text-xs font-mono hover:bg-[var(--accent-secondary)] transition-colors"
              >
                {t('add')}
              </button>
              <button
                onClick={() => {
                  setIsAddingFolder(false);
                  setNewFolderName('');
                }}
                className="flex-1 py-1 border-2 border-[var(--border)] text-xs font-mono hover:border-[var(--accent-primary)] transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-1">
          {renderFolderTree(null)}
        </div>
      </div>

      {/* Canvases Section */}
      <div className="px-4 pb-4 border-t-3 border-[var(--border)] pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono text-[var(--foreground-muted)] uppercase">
            {t('canvases')}
          </h2>
          <button
            onClick={() => setIsAddingCanvas(true)}
            className="text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {isAddingCanvas && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-2 bg-[var(--background)] border-2 border-[var(--accent-primary)]"
          >
            <input
              type="text"
              placeholder={t('canvasNamePlaceholder')}
              value={newCanvasName}
              onChange={(e) => setNewCanvasName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCanvas();
                if (e.key === 'Escape') {
                  setIsAddingCanvas(false);
                  setNewCanvasName('');
                }
              }}
              autoFocus
              className="w-full bg-transparent text-sm font-mono focus:outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddCanvas}
                className="flex-1 py-1 bg-[var(--accent-primary)] text-[var(--background)] text-xs font-mono hover:bg-[var(--accent-secondary)] transition-colors"
              >
                {t('add')}
              </button>
              <button
                onClick={() => {
                  setIsAddingCanvas(false);
                  setNewCanvasName('');
                }}
                className="flex-1 py-1 border-2 border-[var(--border)] text-xs font-mono hover:border-[var(--accent-primary)] transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto">
          {canvases.map((canvas, index) => (
            <motion.div
              key={canvas.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              {editingCanvasId === canvas.id ? (
                <div className="p-2 bg-[var(--background)] border-2 border-[var(--accent-primary)]">
                  <input
                    type="text"
                    value={editingCanvasName}
                    onChange={(e) => setEditingCanvasName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameCanvas(canvas.id);
                      if (e.key === 'Escape') {
                        setEditingCanvasId(null);
                        setEditingCanvasName('');
                      }
                    }}
                    autoFocus
                    className="w-full bg-transparent text-sm font-mono focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleRenameCanvas(canvas.id)}
                      className="flex-1 py-1 bg-[var(--accent-primary)] text-[var(--background)] text-xs font-mono hover:bg-[var(--accent-secondary)] transition-colors"
                    >
                      {t('save')}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCanvasId(null);
                        setEditingCanvasName('');
                      }}
                      className="flex-1 py-1 border-2 border-[var(--border)] text-xs font-mono hover:border-[var(--accent-primary)] transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`
                    flex items-center gap-2 px-4 py-3 cursor-pointer
                    transition-all duration-200
                    ${selectedCanvasId === canvas.id
                      ? 'bg-[var(--accent-primary)] text-[var(--background)]'
                      : 'hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)]'
                    }
                    border-l-3 ${selectedCanvasId === canvas.id ? 'border-[var(--accent-secondary)]' : 'border-transparent'}
                  `}
                  onClick={() => handleCanvasClick(canvas.id)}
                >
                  <Grid3x3 size={16} />
                  <span className="flex-1 text-sm font-mono truncate">
                    {canvas.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCanvasId(canvas.id);
                      setEditingCanvasName(canvas.name);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-[var(--accent-secondary)] transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCanvas(canvas.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-[var(--accent-primary)] transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t-3 border-[var(--border)] text-xs font-mono text-[var(--foreground-muted)]">
        <div className="flex justify-between">
          <span>{t('totalNotes')}</span>
          <span className="text-[var(--accent-primary)]">{totalNotes}</span>
        </div>
      </div>
    </motion.aside>
  );
}

function QuickActionButton({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center gap-2 px-4 py-3
        text-[var(--foreground-muted)]
        hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]
        transition-all duration-200
        text-sm font-mono
      "
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
