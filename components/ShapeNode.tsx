'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeResizer, type Node } from '@xyflow/react';

type ShapeType = 'circle' | 'rectangle' | 'diamond';

type ShapeNodeData = {
  label: string;
  shapeType: ShapeType;
  content?: string;
  borderless?: boolean;
};

type ShapeNodeType = Node<ShapeNodeData>;

interface ShapeNodeProps {
  id: string;
  data: ShapeNodeData;
  selected?: boolean;
}

export default function ShapeNode({ id, data, selected }: ShapeNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');

  const shapeStyles: Record<ShapeType, string> = {
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
    diamond: 'rotate-45',
  };

  const currentShapeType = data.shapeType || 'rectangle';

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // KRİTİK: Blur'da data'yı güncelle
    data.label = label;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    // KRİTİK: Her değişiklikte data'yı güncelle - blur'u bekleme
    data.label = newLabel;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      // Data zaten onChange'de güncelleniyor
    }
  };

  return (
    <>
      {/* NodeResizer - Köşelerden boyutlandırma */}
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={80}
        lineClassName="border-[var(--color-accent)]"
        handleClassName="h-3 w-3 bg-[var(--color-accent)] border-2 border-[var(--color-bg)] rounded-full"
      />

      <div
        className={`
          canvas-shape-node
          relative w-full h-full 
          ${shapeStyles[currentShapeType]}
          bg-transparent
          ${data.borderless ? 'border-0' : 'border-2'}
          ${selected ? 'border-[var(--color-accent)]' : 'border-[var(--color-primary)]'}
          flex items-center justify-center
          transition-all duration-200
          cursor-pointer
          overflow-hidden
        `}
        onDoubleClick={handleDoubleClick}
      >
        {/* Floating Handles - 8 yönden bağlantı */}
        <Handle 
          type="source" 
          position={Position.Top}
          id="source-top"
          isConnectable={true}
          style={{ pointerEvents: 'all', zIndex: 10 }}
          className={`w-3 h-3 bg-[var(--color-accent)] border-2 border-[var(--color-bg)] rounded-full transition-opacity ${selected ? 'opacity-60 hover:opacity-100' : 'opacity-0'}`}
        />
        <Handle 
          type="source" 
          position={Position.Right}
          id="source-right"
          isConnectable={true}
          style={{ pointerEvents: 'all', zIndex: 10 }}
          className={`w-3 h-3 bg-[var(--color-accent)] border-2 border-[var(--color-bg)] rounded-full transition-opacity ${selected ? 'opacity-60 hover:opacity-100' : 'opacity-0'}`}
        />
        <Handle 
          type="source" 
          position={Position.Bottom}
          id="source-bottom"
          isConnectable={true}
          style={{ pointerEvents: 'all', zIndex: 10 }}
          className={`w-3 h-3 bg-[var(--color-accent)] border-2 border-[var(--color-bg)] rounded-full transition-opacity ${selected ? 'opacity-60 hover:opacity-100' : 'opacity-0'}`}
        />
        <Handle 
          type="source" 
          position={Position.Left}
          id="source-left"
          isConnectable={true}
          style={{ pointerEvents: 'all', zIndex: 10 }}
          className={`w-3 h-3 bg-[var(--color-accent)] border-2 border-[var(--color-bg)] rounded-full transition-opacity ${selected ? 'opacity-60 hover:opacity-100' : 'opacity-0'}`}
        />

        <Handle 
          type="target" 
          position={Position.Top}
          id="target-top"
          isConnectable={true}
          style={{ pointerEvents: 'all', zIndex: 10 }}
          className={`w-3 h-3 bg-[var(--color-accent)] border-2 border-[var(--color-bg)] rounded-full transition-opacity ${selected ? 'opacity-60 hover:opacity-100' : 'opacity-0'}`}
        />
        <Handle 
          type="target" 
          position={Position.Right}
          id="target-right"
          isConnectable={true}
          style={{ pointerEvents: 'all', zIndex: 10 }}
          className={`w-3 h-3 bg-[var(--color-accent)] border-2 border-[var(--color-bg)] rounded-full transition-opacity ${selected ? 'opacity-60 hover:opacity-100' : 'opacity-0'}`}
        />
        <Handle 
          type="target" 
          position={Position.Bottom}
          id="target-bottom"
          isConnectable={true}
          style={{ pointerEvents: 'all', zIndex: 10 }}
          className={`w-3 h-3 bg-[var(--color-accent)] border-2 border-[var(--color-bg)] rounded-full transition-opacity ${selected ? 'opacity-60 hover:opacity-100' : 'opacity-0'}`}
        />
        <Handle 
          type="target" 
          position={Position.Left}
          id="target-left"
          isConnectable={true}
          style={{ pointerEvents: 'all', zIndex: 10 }}
          className={`w-3 h-3 bg-[var(--color-accent)] border-2 border-[var(--color-bg)] rounded-full transition-opacity ${selected ? 'opacity-60 hover:opacity-100' : 'opacity-0'}`}
        />

        {/* İçerik - Diamond için ters döndür */}
        <div 
          className={`
            ${currentShapeType === 'diamond' ? '-rotate-45' : ''}
            absolute inset-0 flex items-center justify-center p-6
          `}
        >
          {isEditing ? (
            <textarea
              value={label}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="bg-transparent border-none outline-none text-center font-sans text-sm text-[var(--color-text)] w-full h-full resize-none overflow-hidden leading-relaxed"
              placeholder="Type here..."
            />
          ) : (
            <div 
              className="font-sans text-sm text-[var(--color-text)] break-words w-full h-full overflow-hidden leading-relaxed text-center flex items-center justify-center p-2"
            >
              <p className="whitespace-pre-wrap">{label || 'Double click'}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

