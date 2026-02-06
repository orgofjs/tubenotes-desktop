'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Dashboard from '@/components/Dashboard';
import NotePage from '@/components/NotePage';
import CanvasView, { CanvasViewHandle } from '@/components/CanvasView';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { storage } from '@/lib/storage';
import { fetchYouTubeMetadata } from '@/lib/youtube';
import { VideoNote } from '@/types';
import { canvasAPI } from '@/lib/electronAPI';
import { Layers, Grid3x3, Download, Upload, ArrowLeft } from 'lucide-react';
import KanbanBoard from '@/components/KanbanBoard';

export default function Home() {
  const { t } = useTranslation('common');
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState('root');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<'all' | 'important' | 'completed' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New canvas state
  const [viewMode, setViewMode] = useState<'notes' | 'canvas' | 'kanban'>('notes');
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<{ canvasId: string; nodes: any[]; edges: any[] } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [selectedTool, setSelectedTool] = useState<'selection' | 'text' | null>(null);
  const canvasViewRef = useRef<CanvasViewHandle>(null);
  const [hasDataLoadError, setHasDataLoadError] = useState(false);

  // Track unsaved changes effect
  useEffect(() => {
    if (hasUnsavedChanges) {
      setSaveStatus('unsaved');
    }
  }, [hasUnsavedChanges]);
  
  // Handle unsaved changes - useCallback ile sarmalanmalı ki ref'ler stabil kalsın
  const handleUnsavedChanges = useCallback((hasChanges: boolean) => {
    console.log('[UNSAVED CHANGES] Setting unsaved changes to:', hasChanges);
    setHasUnsavedChanges(hasChanges);
  }, []);
  
  // SORUN 4 FIX: Node eklenince parent state'i güncelle
  const handleAddNode = (node: any) => {
    if (canvasData) {
      const updatedNodes = [...canvasData.nodes, node];
      setCanvasData({
        ...canvasData,
        nodes: updatedNodes,
      });
      setHasUnsavedChanges(true);
      console.log('[ADD NODE] Parent state updated, new count:', updatedNodes.length);
    }
  };

  // Load initial data
  useEffect(() => {
    try {
      const data = storage.getData();
      setNotes(data.notes);
      // Emit notes count to MainLayout
      window.dispatchEvent(new CustomEvent('updateNotesCount', { detail: { count: data.notes.length } }));
    } catch (err) {
      setError(t('failedToLoadData'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update notes count whenever notes change
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('updateNotesCount', { detail: { count: notes.length } }));
  }, [notes.length]);

  // Listen for sidebar events
  useEffect(() => {
    const handleSelectCanvas = (e: CustomEvent) => {
      const { canvasId } = e.detail;
      handleCanvasSelect(canvasId);
    };

    const handleSelectFolder = (e: CustomEvent) => {
      const { folderId } = e.detail;
      setSelectedFolderId(folderId);
      setQuickFilter(null);
      setViewMode('notes');
      setSelectedCanvasId(null);
    };

    const handleQuickFilterEvent = (e: CustomEvent) => {
      const { filter } = e.detail;
      handleQuickFilter(filter);
    };

    const handleSearchEvent = (e: CustomEvent) => {
      const { query } = e.detail;
      handleSearch(query);
    };

    const handleKanbanOpen = () => {
      setViewMode('kanban');
    };

    window.addEventListener('selectCanvas', handleSelectCanvas as EventListener);
    window.addEventListener('selectFolder', handleSelectFolder as EventListener);
    window.addEventListener('quickFilter', handleQuickFilterEvent as EventListener);
    window.addEventListener('search', handleSearchEvent as EventListener);
    window.addEventListener('openKanban', handleKanbanOpen as EventListener);

    return () => {
      window.removeEventListener('selectCanvas', handleSelectCanvas as EventListener);
      window.removeEventListener('selectFolder', handleSelectFolder as EventListener);
      window.removeEventListener('quickFilter', handleQuickFilterEvent as EventListener);
      window.removeEventListener('search', handleSearchEvent as EventListener);
      window.removeEventListener('openKanban', handleKanbanOpen as EventListener);
    };
  }, []);

  // Add new note
  const handleAddNote = async (url: string) => {
    try {
      const metadata = await fetchYouTubeMetadata(url);
      if (!metadata) {
        setError(t('failedToFetchMetadata'));
        return;
      }

      const newNote = storage.addNote({
        url,
        title: metadata.title,
        channelName: metadata.channelName,
        folderId: selectedFolderId,
        content: '',
        status: 'unwatched',
      });

      setNotes([...notes, newNote]);
    } catch (err) {
      setError(t('failedToAddVideo'));
      console.error('Error adding note:', err);
    }
  };

  // Update note
  const handleUpdateNote = (noteId: string, updates: Partial<VideoNote>) => {
    try {
      storage.updateNote(noteId, updates);
      setNotes(notes.map(n => n.id === noteId ? { ...n, ...updates } : n));
    } catch (err) {
      setError(t('failedToUpdateNote'));
    }
  };

  // Update note status
  const handleStatusChange = (noteId: string, status: VideoNote['status']) => {
    handleUpdateNote(noteId, { status });
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    try {
      storage.deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      setError(t('failedToDeleteNote'));
    }
  };

  // Handle quick filter
  const handleQuickFilter = (filter: 'all' | 'important' | 'completed') => {
    setQuickFilter(filter);
    setSelectedFolderId('root'); // Switch to root for filtered view
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle canvas selection
  const handleCanvasSelect = async (canvasId: string) => {
    try {
      console.log(`[LOAD] Switching to canvas ${canvasId}`);
      
      // Önce eski state'i temizle
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      setCanvasData(null);
      
      setViewMode('canvas');
      setSelectedCanvasId(canvasId);
      setSelectedNoteId(null); // Clear note selection
      setHasDataLoadError(false); // Reset error state
      
      const canvas = await canvasAPI.getById(canvasId);
      console.log(`[LOAD] Canvas data from DB:`, canvas);
      
      if (canvas) {
        console.log(`[LOAD] Raw data field:`, canvas.data?.substring(0, 200));
        
        // SORUN 3 FIX: Güvenli JSON parse - hata durumunda kullanıcıyı uyar, boş veri kaydetmeyi engelle
        let flowData;
        try {
          flowData = JSON.parse(canvas.data || '{"nodes":[],"edges":[]}');
          
          // Parse başarılı olsa bile verinin geçerliliğini kontrol et
          if (!flowData || typeof flowData !== 'object' || !Array.isArray(flowData.nodes) || !Array.isArray(flowData.edges)) {
            throw new Error('Invalid canvas data structure');
          }
          
        } catch (parseError) {
          console.error('[LOAD ERROR] JSON parse failed:', parseError);
          setError(t('canvasDataCorrupted'));
          setHasDataLoadError(true);
          // Boş veri yerine hata durumunu göster - kullanıcı bozuk verinin üstüne yazmasın
          flowData = { nodes: [], edges: [] };
        }
        
        console.log(`[LOAD] Parsed: ${flowData.nodes?.length || 0} nodes, ${flowData.edges?.length || 0} edges`);
        
        setCanvasData({ 
          canvasId: canvasId, 
          nodes: flowData.nodes || [], 
          edges: flowData.edges || [] 
        });
      } else {
        // Canvas silinmiş, dashboard'a dön
        console.warn('[LOAD] Canvas not found, returning to dashboard');
        setViewMode('notes');
        setSelectedCanvasId(null);
        setCanvasData(null);
      }
    } catch (err) {
      setError(t('failedToLoadCanvas'));
      console.error('[LOAD ERROR] Error loading canvas:', err);
      setHasDataLoadError(true);
      // Hata durumunda da dashboard'a dön
      setViewMode('notes');
      setSelectedCanvasId(null);
      setCanvasData(null);
    }
  };

  // Handle canvas save - useCallback ile sarmalanmalı ki ref'ler stabil kalsın
  const handleCanvasSave = useCallback(async (nodes: any[], edges: any[], targetCanvasId?: string) => {
    const canvasIdToSave = targetCanvasId || selectedCanvasId;
    if (!canvasIdToSave) {
      console.warn('[SAVE] No canvas ID to save');
      return;
    }
    
    try {
      setSaveStatus('saving');
      
      // Canvas hala var mı kontrol et (silinmiş olabilir)
      const canvas = await canvasAPI.getById(canvasIdToSave);
      if (!canvas) {
        console.warn(`[SAVE] Canvas ${canvasIdToSave} not found, skipping save`);
        setSaveStatus('saved');
        return;
      }

      const flowData = JSON.stringify({ nodes, edges });
      
      // SORUN 4 FIX: Boş canvas geçerli bir durumdur - sadece null/undefined/bozuk veriyi engelle
      if (!flowData || flowData === '' || flowData === '{}') {
        console.warn('[SAVE] Invalid data format - cannot save malformed data');
        setSaveStatus('unsaved');
        setError(t('cannotSaveEmptyCanvas'));
        return;
      }
      
      // ✅ Boş array'ler artık kaydedilebilir: {"nodes":[],"edges":[]}
      console.log(`[SAVE] Canvas ${canvasIdToSave}: ${nodes.length} nodes, ${edges.length} edges`);
      console.log(`[SAVE] Data to save:`, flowData.substring(0, 200)); // İlk 200 karakter log
      
      const result = await canvasAPI.update(canvasIdToSave, { data: flowData });
      console.log(`[SAVE] Update result:`, result ? 'success' : 'failed');
      
      if (!result) {
        throw new Error('Canvas update returned false');
      }
      
      // Başarılı kaydetme sonrası - parent state'i GÜNCELLEME!
      // CanvasView zaten doğru state'e sahip, parent'ı güncellemek gereksiz re-render yaratır
      if (canvasIdToSave === selectedCanvasId) {
        console.log('[SAVE] Save successful, not updating parent state (child already has correct data)');
        setHasUnsavedChanges(false);
        setSaveStatus('saved');
      }
    } catch (err) {
      // Canvas silinmişse hata verme, sadece log yaz
      console.error(`[SAVE ERROR] Failed to save canvas ${canvasIdToSave}:`, err);
      setError(t('failedToSaveCanvas'));
      setSaveStatus('unsaved');
    }
  }, [selectedCanvasId, t]);

  // Get notes for selected folder with filters
  const getFilteredNotes = () => {
    let filtered = notes;

    // Apply folder filter - if root, show all notes
    if (selectedFolderId !== 'root') {
      filtered = filtered.filter(n => n.folderId === selectedFolderId);
    }

    // Apply quick filter
    if (quickFilter === 'important') {
      filtered = filtered.filter(n => n.status === 'important');
    } else if (quickFilter === 'completed') {
      filtered = filtered.filter(n => n.status === 'watched');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.channelName?.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredNotes = getFilteredNotes();
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <LoadingSpinner size="lg" text={t('loadingTubeNotes')} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden theme-aware-layout">
      <AnimatePresence>
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {viewMode === 'kanban' ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Kanban Header */}
            <motion.header
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              className="border-b-2 border-[var(--border)] p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setViewMode('notes')}
                    className="p-2 hover:bg-[var(--surface-hover)] transition-colors"
                    title={t('back')}
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div>
                    <h1 className="text-3xl font-display font-bold uppercase tracking-wider">
                      {t('kanbanBoard')}
                    </h1>
                    <p className="text-sm font-mono text-[var(--foreground-muted)] mt-1">
                      {t('kanbanBoardDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.header>

            {/* Kanban Content */}
            <main className="flex-1 overflow-hidden bg-[var(--background)]">
              <KanbanBoard />
            </main>
          </motion.div>
        ) : viewMode === 'canvas' && selectedCanvasId && canvasData ? (
          <motion.div
            key="canvas"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="flex-1 flex flex-col"
          >
            {/* Canvas Header */}
            <div className="h-18 border-b-3 border-[var(--border)] bg-[var(--surface)] px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setViewMode('notes');
                    setSelectedCanvasId(null);
                    setCanvasData(null);
                    setSaveStatus('saved');
                    setSelectedTool(null);
                  }}
                  className="px-4 py-2 bg-[var(--surface-hover)] hover:bg-[var(--accent-primary)] hover:text-[var(--background)] border-2 border-[var(--border)] transition-all font-mono text-sm flex items-center gap-2"
                >
                  <Layers size={16} />
                  {t('back')}
                </button>
                
                <div className="h-10 w-px bg-[var(--border)]" />
                
                {/* Toolbar */}
                <div className="flex items-center gap-2">
                  {/* Selection Tool - Drag to Create */}
                  <button
                    onClick={() => setSelectedTool(selectedTool === 'selection' ? null : 'selection')}
                    className={`group p-3 rounded-xl transition-all ${
                      selectedTool === 'selection'
                        ? 'bg-[var(--color-accent)]/30 ring-2 ring-[var(--color-accent)]'
                        : 'hover:bg-[var(--surface-hover)]'
                    }`}
                    title={t('dragToCreateRectangle')}
                  >
                    <svg className={`w-6 h-6 stroke-2 fill-none ${selectedTool === 'selection' ? 'stroke-[var(--color-accent)]' : 'stroke-[var(--foreground)]'}`} viewBox="0 0 24 24">
                      <path d="M3 3 L3 21 L21 21" strokeLinecap="round"/>
                      <path d="M7 7 L7 17 L17 17 L17 7 Z" strokeDasharray="4 2"/>
                    </svg>
                  </button>

                  {/* Text Tool - Click to Add Text */}
                  <button
                    onClick={() => setSelectedTool(selectedTool === 'text' ? null : 'text')}
                    className={`group p-3 rounded-xl transition-all ${
                      selectedTool === 'text'
                        ? 'bg-[var(--color-accent)]/30 ring-2 ring-[var(--color-accent)]'
                        : 'hover:bg-[var(--surface-hover)]'
                    }`}
                    title={t('clickToAddText')}
                  >
                    <svg className={`w-6 h-6 stroke-2 fill-none ${selectedTool === 'text' ? 'stroke-[var(--color-accent)]' : 'stroke-[var(--foreground)]'}`} viewBox="0 0 24 24">
                      <path d="M17 4 L17 2 L7 2 L7 4" strokeLinecap="round"/>
                      <path d="M12 2 L12 22" strokeLinecap="round"/>
                      <path d="M9 22 L15 22" strokeLinecap="round"/>
                    </svg>
                  </button>

                  <div className="w-px h-8 bg-[var(--border)]" />

                  {/* Markdown Note Button */}
                  <button
                    onClick={() => canvasViewRef.current?.addMarkdownNode()}
                    className="group p-3 hover:bg-[var(--surface-hover)] rounded-xl transition-all"
                    title={t('addMarkdownNote')}
                  >
                    <svg className="w-6 h-6 stroke-[var(--color-accent)] stroke-2 fill-none group-hover:fill-[var(--color-accent)]/10" viewBox="0 0 24 24">
                      <path d="M3 8 L3 16 L6 16 L6 11 L8 13 L10 11 L10 16 L13 16 L13 8 Z M15 8 L15 16 L18 16 L21 13 M18 16 L18 8"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Right Side - Save Controls */}
              <div className="flex items-center gap-3">
                {/* Save Status Indicator */}
                <div className={`px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2
                  ${saveStatus === 'saved' ? 'bg-green-500/10 text-green-500 border-2 border-green-500/30' : ''}
                  ${saveStatus === 'saving' ? 'bg-yellow-500/10 text-yellow-500 border-2 border-yellow-500/30' : ''}
                  ${saveStatus === 'unsaved' ? 'bg-red-500/10 text-red-500 border-2 border-red-500/30' : ''}
                `}>
                  {saveStatus === 'saved' && t('saved')}
                  {saveStatus === 'saving' && t('saving')}
                  {saveStatus === 'unsaved' && t('unsaved')}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (canvasViewRef.current && selectedCanvasId) {
                        // Ref üzerinden güncel veriyi al (stale closure sorununu önler)
                        const currentData = canvasViewRef.current.getCurrentData();
                        console.log('[MANUAL SAVE] Getting data from ref:', currentData.nodes.length, 'nodes');
                        handleCanvasSave(currentData.nodes, currentData.edges, selectedCanvasId);
                      }
                    }}
                    disabled={hasDataLoadError}
                    title={hasDataLoadError ? t('cannotSaveCorruptedData') : t('saveNow')}
                    className={`group p-3 hover:bg-[var(--surface-hover)] rounded-xl transition-all border-2 border-[var(--border)] ${
                      hasDataLoadError ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </button>
                  
                  <div className="w-px h-6 bg-[var(--border)]" />
                  
                  <button
                    onClick={() => canvasViewRef.current?.exportCanvas()}
                    title={t('exportToFile')}
                    className="group p-3 hover:bg-[var(--surface-hover)] rounded-xl transition-all border-2 border-[var(--border)]"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => canvasViewRef.current?.importCanvas()}
                    title={t('importFromFile')}
                    className="group p-3 hover:bg-[var(--surface-hover)] rounded-xl transition-all border-2 border-[var(--border)]"
                  >
                    <Upload size={18} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                  <Grid3x3 size={20} />
                  <span className="font-mono text-sm">{t('canvasMode')}</span>
                </div>
              </div>
            </div>
            
            {/* Canvas View */}
            <div className="flex-1">
              <CanvasView
                key={canvasData.canvasId}
                canvasId={canvasData.canvasId}
                canvasName={`Canvas ${canvasData.canvasId.slice(0, 8)}`}
                initialNodes={canvasData.nodes}
                initialEdges={canvasData.edges}
                onSave={handleCanvasSave}
                onUnsavedChanges={handleUnsavedChanges}
                onAddNode={handleAddNode}
                saveStatus={saveStatus}
                selectedTool={selectedTool}
                onToolChange={setSelectedTool}
                canvasRef={canvasViewRef}
              />
            </div>
          </motion.div>
        ) : selectedNoteId && selectedNote ? (
          <motion.div
            key="note"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="flex-1"
          >
            <NotePage
              note={selectedNote}
              onUpdate={(content) => handleUpdateNote(selectedNote.id, { content })}
              onBack={() => setSelectedNoteId(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <Dashboard
              notes={filteredNotes}
              onAddNote={handleAddNote}
              onNoteClick={setSelectedNoteId}
              onStatusChange={handleStatusChange}
              onDeleteNote={handleDeleteNote}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
