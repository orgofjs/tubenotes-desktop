'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import { motion } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Code, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered,
  Quote,
  Undo,
  Redo
} from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start typing... Use / for commands or ## for headings',
      }),
      Link.configure({
        openOnClick: false,
      }),
      CharacterCount,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-125 font-mono text-foreground',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    icon: Icon,
    label 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any;
    label: string;
  }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        p-2 border-2 transition-all
        ${isActive 
          ? 'bg-accent-primary border-accent-primary text-background' 
          : 'border-border-color hover:border-accent-primary'
        }
      `}
      title={label}
    >
      <Icon size={16} />
    </motion.button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-surface border-b-3 border-border-color p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              icon={Bold}
              label="Bold"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              icon={Italic}
              label="Italic"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              icon={Code}
              label="Code"
            />
          </div>

          <div className="w-px h-6 bg-border-color" />

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              icon={Heading1}
              label="Heading 1"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              icon={Heading2}
              label="Heading 2"
            />
          </div>

          <div className="w-px h-6 bg-border-color" />

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              icon={List}
              label="Bullet List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              icon={ListOrdered}
              label="Ordered List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              icon={Quote}
              label="Blockquote"
            />
          </div>

          <div className="w-px h-6 bg-border-color" />

          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              icon={Undo}
              label="Undo"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              icon={Redo}
              label="Redo"
            />
          </div>

          <div className="ml-auto text-xs font-mono text-foreground-muted">
            {editor.storage.characterCount?.characters() || 0} CHARS
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <EditorContent editor={editor} />
      </div>

      {/* Editor Styles */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--foreground-muted);
          pointer-events: none;
          height: 0;
        }

        .ProseMirror h1 {
          font-family: var(--font-display);
          font-size: 2.5rem;
          color: var(--accent-primary);
          text-transform: uppercase;
          margin: 1.5rem 0 1rem 0;
          letter-spacing: 0.02em;
        }

        .ProseMirror h2 {
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--accent-secondary);
          text-transform: uppercase;
          margin: 1.25rem 0 0.75rem 0;
          letter-spacing: 0.02em;
        }

        .ProseMirror h3 {
          font-size: 1.5rem;
          color: var(--foreground);
          margin: 1rem 0 0.5rem 0;
        }

        .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.7;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }

        .ProseMirror li {
          margin: 0.25rem 0;
        }

        .ProseMirror ul li::marker {
          color: var(--accent-primary);
        }

        .ProseMirror ol li::marker {
          color: var(--accent-secondary);
          font-weight: bold;
        }

        .ProseMirror code {
          background: var(--surface);
          color: var(--accent-secondary);
          padding: 0.2rem 0.4rem;
          border-radius: 0;
          border: 1px solid var(--border);
          font-family: var(--font-mono);
        }

        .ProseMirror pre {
          background: var(--surface);
          border: 3px solid var(--border);
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background: none;
          border: none;
          padding: 0;
        }

        .ProseMirror blockquote {
          border-left: 4px solid var(--accent-primary);
          padding-left: 1rem;
          margin: 1rem 0;
          color: var(--foreground-muted);
          font-style: italic;
        }

        .ProseMirror a {
          color: var(--accent-blue);
          text-decoration: underline;
          text-decoration-color: var(--accent-primary);
          text-decoration-thickness: 2px;
        }

        .ProseMirror a:hover {
          color: var(--accent-primary);
        }

        .ProseMirror strong {
          color: var(--accent-primary);
          font-weight: bold;
        }

        .ProseMirror em {
          color: var(--accent-secondary);
        }
      `}</style>
    </div>
  );
}
