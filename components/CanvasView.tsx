'use client';

import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  NodeTypes,
  useReactFlow,
  ReactFlowProvider,
  useViewport,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ShapeNode from '@/components/ShapeNode';
import CodeMirrorNode from '@/components/CodeMirrorNode';
import TextNode from '@/components/TextNode';

interface CanvasViewProps {
  canvasId: string;
  canvasName?: string;
  initialNodes?: any[];
  initialEdges?: any[];
  onSave?: (nodes: any[], edges: any[], targetCanvasId?: string) => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
  onExport?: () => void;
  onImport?: () => void;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
  selectedTool?: 'selection' | 'text' | null;
  onToolChange?: (tool: 'selection' | 'text' | null) => void;
  onAddMarkdown?: () => void;
  onAddNode?: (node: any) => void;
  canvasRef?: React.RefObject<CanvasViewHandle | null>;
}

export interface CanvasViewHandle {
  addMarkdownNode: () => void;
  exportCanvas: () => void;
  importCanvas: () => void;
  getCurrentData: () => { nodes: any[]; edges: any[] };
}

const nodeTypes: NodeTypes = {
  shape: ShapeNode,
  markdown: CodeMirrorNode,
  text: TextNode,
};

function CanvasViewInner({
  canvasId,
  canvasName = 'Canvas',
  initialNodes = [],
  initialEdges = [],
  onSave,
  onUnsavedChanges,
  onExport,
  onImport,
  saveStatus: externalSaveStatus,
  selectedTool: externalSelectedTool,
  onToolChange,
  onAddMarkdown,
  onAddNode,
  canvasRef,
}: CanvasViewProps) {
  const [internalNodes, setInternalNodes, onNodesChange] = useNodesState(initialNodes);
  const [internalEdges, setInternalEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // SORUN 1-3 FIX: Latest Ref Pattern - Render sırasında güncellenen ref'ler
  // Ref'leri useEffect yerine render gövdesinde güncelle (race condition önlenir)
  const nodesRef = React.useRef(internalNodes);
  const edgesRef = React.useRef(internalEdges);
  nodesRef.current = internalNodes;
  edgesRef.current = internalEdges;
  
  // SORUN 1-2 FIX: Props'ları ref'lerde tut (stale closure önlenir)
  const onSaveRef = React.useRef(onSave);
  const canvasIdRef = React.useRef(canvasId);
  const onUnsavedChangesRef = React.useRef(onUnsavedChanges);
  onSaveRef.current = onSave;
  canvasIdRef.current = canvasId;
  onUnsavedChangesRef.current = onUnsavedChanges;
  
  // nodes ve edges alias'ları
  const nodes = internalNodes;
  const edges = internalEdges;
  
  const saveStatus = externalSaveStatus || 'saved';
  const selectedTool = externalSelectedTool || null;
  const setSelectedTool = onToolChange || (() => {});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
  const reactFlowInstance = useReactFlow();
  const viewport = useViewport();
  const { t } = useTranslation('common');

  // Track selected nodes for delete button visibility
  const selectedNodeCount = nodes.filter(n => n.selected).length;

  // SORUN 5-6 FIX: InitialDataRef - canvas başlangıç durumunu saklar (tüm useEffect'lerden ÖNCE tanımlanmalı)
  // React Flow'un internal field'larını temizleyen helper
  const cleanNodeData = (node: any) => {
    const { measured, selected, dragging, ...cleanNode } = node;
    return cleanNode;
  };
  
  const cleanEdgeData = (edge: any) => {
    const { selected, ...cleanEdge } = edge;
    return cleanEdge;
  };
  
  const getCleanDataString = (nodes: any[], edges: any[]) => {
    const cleanNodes = nodes.map(cleanNodeData);
    const cleanEdges = edges.map(cleanEdgeData);
    return JSON.stringify({ nodes: cleanNodes, edges: cleanEdges });
  };
  
  const initialDataRef = React.useRef<string>(getCleanDataString(initialNodes, initialEdges));

  // Component mount olduğunda log
  React.useEffect(() => {
    console.log(`Canvas ${canvasId} mounted with ${initialNodes?.length || 0} nodes`);
  }, []);
  
  // SORUN 5-6 FIX: Canvas switch'te state ve initialDataRef'i senkronize güncelle
  React.useEffect(() => {
    if (initialNodes && initialEdges) {
      console.log(`[CANVAS UPDATE] Updating canvas ${canvasId} with new data:`, initialNodes.length, 'nodes');
      setInternalNodes(initialNodes);
      setInternalEdges(initialEdges);
      // Initial data ref'i de senkronize güncelle - canvas değiştiğinde yeni başlangıç noktası
      const newInitialData = getCleanDataString(initialNodes, initialEdges);
      initialDataRef.current = newInitialData;
      console.log('[CANVAS SWITCH] InitialDataRef synchronized (clean data)');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId]); // Sadece canvasId değişince - initialNodes/initialEdges dependency eklenirse double mount olur!

  const onConnect = useCallback(
    (params: Connection | Edge) => setInternalEdges((eds) => addEdge(params, eds)),
    [setInternalEdges]
  );

  // SORUN 1-2 FIX: handleManualSave Latest Ref Pattern - hiç değişmeyen stabil fonksiyon
  const handleManualSave = useCallback(() => {
    console.log('[MANUAL SAVE] Starting save process...');
    
    // KRİTİK FIX: Aktif elementi blur et - node içindeki input/textarea değişikliklerini commit et
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      console.log('[MANUAL SAVE] Blurring active element:', activeElement.tagName, activeElement.className);
      activeElement.blur();
      
      // Blur işleminin tamamlanması ve React Flow state'inin güncellenmesi için kısa gecikme
      // CodeMirror gibi ağır editor'lar için 100ms yeterli
      setTimeout(() => {
        performSave();
      }, 100);
    } else {
      performSave();
    }
  }, []); // ✅ Empty dependency - fonksiyon asla yeniden oluşturulmaz
  
  // Asıl kaydetme işlemi - blur sonrası çağrılır
  const performSave = useCallback(() => {
    if (onSaveRef.current) {
      // Ref'ten güncel değerleri al (stale closure sorununu önler)
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;
      const currentCanvasId = canvasIdRef.current;
      
      console.log(`[MANUAL SAVE] Canvas ${currentCanvasId}: ${currentNodes.length} nodes, ${currentEdges.length} edges`);
      console.log('[MANUAL SAVE] Current nodes:', JSON.stringify(currentNodes).substring(0, 150));
      
      // onSave çağır - bu async olabilir, await edemeyiz ama Promise döndürebilir
      const saveResult = onSaveRef.current(currentNodes, currentEdges, currentCanvasId);
      
      // Kayıt başlatıldı - initialDataRef'i hemen güncelle (temiz veri ile)
      const savedData = getCleanDataString(currentNodes, currentEdges);
      initialDataRef.current = savedData;
      console.log('[MANUAL SAVE] InitialDataRef updated after save (clean data)');
      
      // Unsaved changes'i kapat
      onUnsavedChangesRef.current?.(false);
      console.log('[MANUAL SAVE] Save completed');
    } else {
      console.warn('[MANUAL SAVE] onSaveRef.current is null or undefined');
    }
  }, []);
  
  React.useEffect(() => {
    // Derin karşılaştırma: JSON string karşılaştırması (React Flow internal field'ları olmadan)
    const currentDataStr = getCleanDataString(internalNodes, internalEdges);
    const hasChanges = currentDataStr !== initialDataRef.current;
    
    if (hasChanges) {
      console.log('[CHANGE DETECTION] Data changed detected via deep comparison');
      console.log('[CHANGE DETECTION] Current:', currentDataStr.substring(0, 100));
      console.log('[CHANGE DETECTION] Initial:', initialDataRef.current.substring(0, 100));
      onUnsavedChangesRef.current?.(true);
    }
  }, [internalNodes, internalEdges]);

  // SORUN 1 FIX: Ctrl+S keyboard shortcut - event listener artık asla yeniden takılmaz
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        console.log('[KEYBOARD] Ctrl+S pressed');
        handleManualSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    console.log('[KEYBOARD] Event listener attached');
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      console.log('[KEYBOARD] Event listener removed');
    };
  }, [handleManualSave]); // ✅ handleManualSave artık asla değişmez

  // Expose addMarkdownNode to parent
  React.useEffect(() => {
    if (onAddMarkdown) {
      // Create a ref or use a different mechanism
      // For now, we'll handle it through header button directly
    }
  }, [onAddMarkdown]);

  const addShapeNode = useCallback(
    (type: 'circle' | 'rectangle' | 'diamond') => {
      const newNode = {
        id: `shape-${Date.now()}`,
        type: 'shape',
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: { 
          label: 'New Shape', 
          shapeType: type,
          content: '' 
        },
        style: {
          width: '150px',
          height: '120px',
        },
      };
      setInternalNodes((nds) => [...nds, newNode]);
    },
    [setInternalNodes]
  );

  // Delete selected nodes and their connected edges
  const deleteSelectedNodes = useCallback(() => {
    const selectedIds = new Set(nodesRef.current.filter(n => n.selected).map(n => n.id));
    console.log('[DELETE] Deleting selected nodes:', Array.from(selectedIds));
    setInternalNodes((nds) => nds.filter((n) => !n.selected));
    setInternalEdges((eds) => eds.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)));
    onUnsavedChangesRef.current?.(true);
  }, [setInternalNodes, setInternalEdges]);

  const addMarkdownNode = useCallback(() => {
    console.log('[ADD MARKDOWN] Creating new markdown node');
    const newNode = {
      id: `markdown-${Date.now()}`,
      type: 'markdown',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { content: '# New Note\n\nStart writing...' },
    };
    console.log('[ADD MARKDOWN] New node:', newNode);
    setInternalNodes((nds) => {
      console.log('[ADD MARKDOWN] Current nodes:', nds.length);
      const updatedNodes = [...nds, newNode];
      console.log('[ADD MARKDOWN] Updated nodes:', updatedNodes.length);
      return updatedNodes;
    });
    onAddNode?.(newNode);
  }, [setInternalNodes, onAddNode]);

  // Export/Import with file system
  const exportCanvas = useCallback(async () => {
    const { saveCanvasToFile } = await import('@/lib/fileSystem');
    // Ref'ten güncel değerleri al
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    await saveCanvasToFile(canvasName, { nodes: currentNodes, edges: currentEdges });
  }, [canvasName]);

  const importCanvas = useCallback(async () => {
    const { openCanvasFromFile } = await import('@/lib/fileSystem');
    const data = await openCanvasFromFile();
    if (data) {
      // SORUN 6 FIX: Önce UI'yı güncelle (top-down data flow)
      setInternalNodes(data.nodes);
      setInternalEdges(data.edges);
      
      // Sonra onAddNode ile parent'a bildir (eğer varsa)
      if (onAddNode && data.nodes.length > 0) {
        data.nodes.forEach((node: any) => onAddNode(node));
      }
      
      // En son veritabanına kaydet (asenkron)
      if (onSave) {
        console.log('[IMPORT] Saving imported data to database');
        onSave(data.nodes, data.edges, canvasId);
      }
    }
  }, [setInternalNodes, setInternalEdges, onSave, onAddNode, canvasId]);

  // Expose methods to parent via ref
  React.useImperativeHandle(canvasRef, () => ({
    addMarkdownNode,
    exportCanvas,
    importCanvas,
    getCurrentData: () => ({
      nodes: nodesRef.current,
      edges: edgesRef.current,
    }),
  }), [addMarkdownNode, exportCanvas, importCanvas]);

  // Drag-to-create functionality - Flow koordinatlarında çalışır
  const handlePaneMouseDown = useCallback((event: React.MouseEvent) => {
    if (selectedTool === 'selection' && event.button === 0) {
      const position = reactFlowInstance.screenToFlowPosition({ 
        x: event.clientX, 
        y: event.clientY 
      });
      setIsDragging(true);
      setDragStart(position);
      setDragEnd(position);
    }
  }, [selectedTool, reactFlowInstance]);

  const handlePaneMouseMove = useCallback((event: React.MouseEvent) => {
    if (isDragging && dragStart && selectedTool === 'selection') {
      const position = reactFlowInstance.screenToFlowPosition({ 
        x: event.clientX, 
        y: event.clientY 
      });
      setDragEnd(position);
      event.stopPropagation();
    }
  }, [isDragging, dragStart, selectedTool, reactFlowInstance]);

  const handlePaneMouseUp = useCallback((event: React.MouseEvent) => {
    if (isDragging && dragStart && dragEnd) {
      const width = Math.abs(dragEnd.x - dragStart.x);
      const height = Math.abs(dragEnd.y - dragStart.y);
      
      console.log('[DRAG CREATE] Mouse up - width:', width, 'height:', height);
      
      if (width > 30 && height > 30) {
        const finalWidth = Math.max(width, 100);
        const finalHeight = Math.max(height, 80);
        
        const newNode = {
          id: `shape-${Date.now()}`,
          type: 'shape',
          position: {
            x: Math.min(dragStart.x, dragEnd.x),
            y: Math.min(dragStart.y, dragEnd.y)
          },
          data: { 
            label: 'New Shape', 
            shapeType: 'rectangle' as const,
            content: '' 
          },
          style: {
            width: `${finalWidth}px`,
            height: `${finalHeight}px`,
          }
        };
        
        console.log('[DRAG CREATE] Creating shape node:', newNode);
        setInternalNodes((nds) => {
          console.log('[DRAG CREATE] Current nodes:', nds.length);
          const updated = [...nds, newNode];
          console.log('[DRAG CREATE] Updated nodes:', updated.length);
          return updated;
        });
        setSelectedTool(null);
        onUnsavedChanges?.(true);
      }
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, setInternalNodes, setSelectedTool, reactFlowInstance, onUnsavedChanges]);

  return (
    <div className="h-full w-full relative">
      {/* React Flow Canvas */}
      <div 
        onMouseDown={handlePaneMouseDown}
        onMouseMove={handlePaneMouseMove}
        onMouseUp={handlePaneMouseUp}
        className="h-full w-full relative"
        style={{ cursor: selectedTool === 'selection' ? 'crosshair' : selectedTool === 'text' ? 'text' : 'default' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          style={{ background: 'var(--color-bg)' }}
          proOptions={{ hideAttribution: true }}
          onPaneClick={(event) => {
            if (selectedTool === 'text') {
              console.log('[TEXT CREATE] Text tool clicked');
              // Screen koordinatlarını flow koordinatlarına çevir
              const position = reactFlowInstance.screenToFlowPosition({ 
                x: event.clientX, 
                y: event.clientY 
              });
              
              const newNode = {
                id: `text-${Date.now()}`,
                type: 'text',
                position: { 
                  x: position.x - 50, 
                  y: position.y - 30 
                },
                data: { 
                  label: ''
                },
                style: {
                  width: '150px',
                  height: '60px',
                }
              };
              console.log('[TEXT CREATE] Creating text node:', newNode);
              setInternalNodes((nds) => {
                console.log('[TEXT CREATE] Current nodes:', nds.length);
                const updated = [...nds, newNode];
                console.log('[TEXT CREATE] Updated nodes:', updated.length);
                return updated;
              });
              setSelectedTool(null);
              onUnsavedChanges?.(true);
            }
          }}
          selectionOnDrag={selectedTool !== 'selection'}
          panOnDrag={selectedTool !== 'selection' && selectedTool !== 'text'}
        >
          <Controls 
            className="border-0! bg-transparent! shadow-none!"
            showInteractive={false}
            position="bottom-left"
          >
            {selectedNodeCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSelectedNodes();
                }}
                className="react-flow__controls-button"
                style={{ order: -1, color: '#ef4444' }}
                title={t('deleteSelectedNode')}
              >
                <Trash2 size={16} />
              </button>
            )}
          </Controls>
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1}
            color="var(--color-border)"
          />
        </ReactFlow>
        
        {/* Drag Preview - Viewport transform ile */}
        {isDragging && dragStart && dragEnd && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: Math.min(dragStart.x, dragEnd.x) * viewport.zoom + viewport.x,
                top: Math.min(dragStart.y, dragEnd.y) * viewport.zoom + viewport.y,
                width: Math.abs(dragEnd.x - dragStart.x) * viewport.zoom,
                height: Math.abs(dragEnd.y - dragStart.y) * viewport.zoom,
                border: '3px dashed #ff3366',
                background: 'rgba(255, 51, 102, 0.15)',
                boxShadow: '0 0 0 1px rgba(255, 51, 102, 0.3)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CanvasView(props: CanvasViewProps) {
  return (
    <ReactFlowProvider>
      <CanvasViewInner {...props} />
    </ReactFlowProvider>
  );
}
