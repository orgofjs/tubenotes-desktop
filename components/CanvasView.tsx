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
  
  // Ref ile güncel nodes ve edges'i tut
  const nodesRef = React.useRef(internalNodes);
  const edgesRef = React.useRef(internalEdges);
  
  // internalNodes/internalEdges değişince ref'i güncelle (drag, resize, vb. için)
  React.useEffect(() => {
    nodesRef.current = internalNodes;
    console.log('[NODES SYNCED] Ref updated, count:', internalNodes.length);
  }, [internalNodes]);
  
  React.useEffect(() => {
    edgesRef.current = internalEdges;
  }, [internalEdges]);
  
  // Wrapper: setNodes çağrıldığında ref'i de güncelle
  const setNodes = React.useCallback((update: any) => {
    setInternalNodes((prevNodes) => {
      const newNodes = typeof update === 'function' ? update(prevNodes) : update;
      nodesRef.current = newNodes; // Ref'i ANINDA güncelle
      console.log('[SET NODES] Updated ref, count:', newNodes.length);
      return newNodes;
    });
  }, [setInternalNodes]);
  
  // Wrapper: setEdges çağrıldığında ref'i de güncelle
  const setEdges = React.useCallback((update: any) => {
    setInternalEdges((prevEdges) => {
      const newEdges = typeof update === 'function' ? update(prevEdges) : update;
      edgesRef.current = newEdges; // Ref'i ANINDA güncelle
      return newEdges;
    });
  }, [setInternalEdges]);
  
  // nodes ve edges alias'ları (backward compatibility)
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

  // Component mount olduğunda log
  React.useEffect(() => {
    console.log(`Canvas ${canvasId} mounted with ${initialNodes?.length || 0} nodes`);
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Manual save - Ctrl+S ile çalışır
  const handleManualSave = useCallback(() => {
    if (onSave) {
      // Ref'ten güncel değerleri al (stale closure sorununu önler)
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;
      
      console.log(`Manual save: ${canvasId} with ${currentNodes.length} nodes, ${currentEdges.length} edges`);
      onSave(currentNodes, currentEdges, canvasId);
      onUnsavedChanges?.(false);
    }
  }, [onSave, canvasId, onUnsavedChanges]);

  // Manuel kayıt - değişiklikleri takip et
  React.useEffect(() => {
    // İlk mount'ta saved olarak başla
    if (internalNodes.length === initialNodes.length && internalEdges.length === initialEdges.length) {
      return; // İlk render, değişiklik yok
    }
    onUnsavedChanges?.(true);
  }, [internalNodes, internalEdges, onUnsavedChanges, initialNodes.length, initialEdges.length]);

  // Ctrl+S keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

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
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const addMarkdownNode = useCallback(() => {
    console.log('[ADD MARKDOWN] Creating new markdown node');
    const newNode = {
      id: `markdown-${Date.now()}`,
      type: 'markdown',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { content: '# New Note\n\nStart writing...' },
    };
    console.log('[ADD MARKDOWN] New node:', newNode);
    setNodes((nds) => {
      console.log('[ADD MARKDOWN] Current nodes:', nds.length);
      const updatedNodes = [...nds, newNode];
      console.log('[ADD MARKDOWN] Updated nodes:', updatedNodes.length);
      return updatedNodes;
    });
    onAddNode?.(newNode);
  }, [setNodes, onAddNode]);

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
      setNodes(data.nodes);
      setEdges(data.edges);
      if (onSave) {
        onSave(data.nodes, data.edges, canvasId);
      }
    }
  }, [setNodes, setEdges, onSave, canvasId]);

  // Expose methods to parent via ref
  React.useImperativeHandle(canvasRef, () => ({
    addMarkdownNode,
    exportCanvas,
    importCanvas,
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
        setNodes((nds) => {
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
  }, [isDragging, dragStart, dragEnd, setNodes, reactFlowInstance, onUnsavedChanges]);

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
              setNodes((nds) => {
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
            className="!border-0 !bg-transparent !shadow-none"
            showInteractive={false}
            position="bottom-left"
          />
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
