'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, type Node, useReactFlow } from '@xyflow/react';

type TextNodeData = {
  label: string;
};

interface TextNodeProps {
  id: string;
  data: TextNodeData;
  selected?: boolean;
}

export default function TextNode({ id, data, selected }: TextNodeProps) {
  const [text, setText] = useState(data.label || '');
  const [isEditing, setIsEditing] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNode } = useReactFlow();

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      adjustSize();
    }
  }, [isEditing]);

  const adjustSize = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    // Font ayarlarını textarea'dan al
    const computedStyle = window.getComputedStyle(textarea);
    context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    // Metni satırlara böl
    const lines = textarea.value.split('\n');
    
    // En uzun satırın genişliğini hesapla
    let maxWidth = 100; // Minimum genişlik
    lines.forEach(line => {
      const metrics = context.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width + 40); // Padding için +40
    });

    // Yüksekliği satır sayısına göre ayarla
    const lineHeight = parseInt(computedStyle.lineHeight) || 20;
    const height = Math.max(60, (lines.length * lineHeight) + 40); // Padding için +40

    // Node boyutunu güncelle
    updateNode(id, {
      style: {
        width: `${Math.min(maxWidth, 600)}px`, // Max 600px
        height: `${Math.min(height, 400)}px`, // Max 400px
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    // KRİTİK: Her değişiklikte data'yı güncelle - blur'u bekleme
    data.label = newText;
    adjustSize();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      data.label = text;
    }
  };

  const handleDoubleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <div className="relative w-full h-full">
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

      <div 
        className="w-full h-full flex items-center justify-center p-4"
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              setIsEditing(false);
              data.label = text;
            }}
            className="bg-transparent border-none outline-none text-left font-sans text-sm text-[var(--color-text)] w-full h-full resize-none overflow-hidden leading-relaxed"
            placeholder="Type here... (Shift+Enter for new line, Enter to save)"
          />
        ) : (
          <div className="font-sans text-sm text-[var(--color-text)] break-words w-full h-full overflow-hidden leading-relaxed text-left whitespace-pre-wrap">
            {text || 'Double click to edit'}
          </div>
        )}
      </div>
    </div>
  );
}
