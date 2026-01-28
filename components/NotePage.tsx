'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Calendar, User, Save, Download } from 'lucide-react';
import { VideoNote } from '@/types';
import { getYouTubeThumbnail } from '@/lib/youtube';
import { format } from 'date-fns';
import Editor from '@/components/Editor';
import { downloadFile } from '@/lib/fileSystem';

interface NotePageProps {
  note: VideoNote;
  onUpdate: (content: string) => void;
  onBack: () => void;
}

export default function NotePage({ note, onUpdate, onBack }: NotePageProps) {
  const { t } = useTranslation('common');
  const [content, setContent] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (content !== note.content) {
        handleAutoSave();
      }
    }, 3000); // Auto-save every 3 seconds

    return () => clearInterval(saveInterval);
  }, [content, note.content]);

  const handleAutoSave = async () => {
    setSaveStatus('saving');
    onUpdate(content);
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  const handleManualSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    onUpdate(content);
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('saved');
    }, 500);
  };

  const handleExport = () => {
    const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_note.md`;
    downloadFile(content, filename, 'text/markdown');
  };

  return (
    <div className="flex-1 h-screen flex flex-col bg-[var(--background)]">
      {/* Header with Thumbnail */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Background Thumbnail with Parallax Effect */}
        <div className="relative h-[300px] overflow-hidden border-b-3 border-[var(--border)]">
          {!imageError ? (
            <Image
              src={getYouTubeThumbnail(note.url)}
              alt={note.title}
              fill
              className="object-cover opacity-20"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-[var(--surface)]" />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/80 to-[var(--background)]" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="max-w-[1200px] w-full mx-auto">
              {/* Back Button */}
              <motion.button
                whileHover={{ x: -4 }}
                onClick={onBack}
                className="flex items-center gap-2 mb-6 text-[var(--foreground-muted)] hover:text-[var(--accent-primary)] transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-mono text-sm">{t('backToLibrary')}</span>
              </motion.button>

              {/* Title */}
              <h1 className="text-display text-5xl mb-4 text-[var(--foreground)]">
                {note.title}
              </h1>

              {/* Metadata */}
              <div className="flex items-center gap-6 text-sm font-mono text-[var(--foreground-muted)]">
                {note.channelName && (
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{note.channelName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{format(new Date(note.createdAt), 'dd MMM yyyy')}</span>
                </div>
                <a
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition-colors"
                >
                  <ExternalLink size={16} />
                  <span>{t('watchOnYouTube')}</span>
                </a>
                <div className="flex-1" />
                {/* Save Status & Controls */}
                <div className="flex items-center gap-3">
                  <span className={`save-status ${saveStatus} text-xs`}>
                    {saveStatus === 'saved' && t('saved')}
                    {saveStatus === 'saving' && t('saving')}
                    {saveStatus === 'unsaved' && t('unsaved')}
                  </span>
                  <button
                    onClick={handleManualSave}
                    disabled={isSaving}
                    className="btn-brutal flex items-center gap-2 text-xs px-2 py-1 disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{t('save')}</span>
                  </button>
                  <button
                    onClick={handleExport}
                    className="btn-brutal-secondary flex items-center gap-2 text-xs px-2 py-1"
                  >
                    <Download size={14} />
                    <span>{t('export')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Editor Container */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-[1200px] w-full mx-auto h-full">
          <Editor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
