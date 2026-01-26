'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

type CodeMirrorNodeData = {
  content: string;
};

interface CodeMirrorNodeProps {
  id: string;
  data: CodeMirrorNodeData;
  selected?: boolean;
}

export default function CodeMirrorNode({ id, data, selected }: CodeMirrorNodeProps) {
  const [content, setContent] = useState(data.content || '');

  const handleChange = (value: string) => {
    setContent(value);
    data.content = value; // Immediate update for React Flow
  };

  return (
    <>
      {/* NodeResizer - Köşelerden boyutlandırma */}
      <NodeResizer
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        lineClassName="border-[var(--color-accent)]"
        handleClassName="h-3 w-3 bg-[var(--color-accent)] border-2 border-[var(--color-bg)] rounded-full"
      />

      <div
        className={`
          canvas-markdown-node
          relative
          bg-[var(--color-bg)]/90
          backdrop-blur-md
          border-4 
          ${selected ? 'border-[var(--color-accent)] ring-4 ring-[var(--color-accent)]/30' : 'border-[var(--color-primary)]'}
          shadow-[8px_8px_0px_0px_var(--color-primary)]
          transition-all duration-200
          rounded-lg
          overflow-hidden
        `}
        style={{
          minWidth: '400px',
          minHeight: '300px',
        }}
      >
        {/* Floating Handles - 8 yönden bağlantı */}
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

        {/* Header */}
        <div className="bg-[var(--color-primary)]/90 backdrop-blur-sm px-4 py-2 border-b-4 border-[var(--color-text)]">
          <span className="font-mono text-sm font-bold text-[var(--color-bg)]">
            📝 Markdown Note
          </span>
        </div>

        {/* CodeMirror Editor */}
        <div className="p-2">
          <CodeMirror
            value={content}
            height="250px"
            extensions={[markdown()]}
            theme={oneDark}
            onChange={handleChange}
            className="border-2 border-[var(--color-border)] font-mono text-sm rounded overflow-hidden"
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              foldGutter: true,
            }}
          />
        </div>
      </div>
    </>
  );
}
