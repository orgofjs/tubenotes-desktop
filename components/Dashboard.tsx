'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Link as LinkIcon } from 'lucide-react';
import { VideoNote } from '@/types';
import VideoCard from './VideoCard';

interface DashboardProps {
  notes: VideoNote[];
  onAddNote: (url: string) => void;
  onNoteClick: (noteId: string) => void;
  onStatusChange: (noteId: string, status: VideoNote['status']) => void;
  onDeleteNote?: (noteId: string) => void;
}

export default function Dashboard({ notes, onAddNote, onNoteClick, onStatusChange, onDeleteNote }: DashboardProps) {
  const { t } = useTranslation('common');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteUrl, setNewNoteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddNote = async () => {
    if (newNoteUrl.trim()) {
      setIsLoading(true);
      await onAddNote(newNoteUrl.trim());
      setNewNoteUrl('');
      setIsAddingNote(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[var(--background)] grid-noise">
      <div className="max-w-[1600px] mx-auto p-8 pl-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-display text-6xl text-[var(--foreground)] mb-2 tracking-wider">
                {t('videoLibrary')}
              </h1>
              <div className="flex items-center gap-4 text-sm font-mono text-[var(--foreground-muted)]">
                <span>{notes.length} {notes.length !== 1 ? t('videos') : t('video')}</span>
                <span className="text-[var(--accent-primary)]">•</span>
                <span>{notes.filter(n => n.status === 'watched').length} {t('watched')}</span>
                <span className="text-[var(--accent-primary)]">•</span>
                <span>{notes.filter(n => n.status === 'important').length} {t('important')}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddingNote(true)}
              className="
                px-6 py-3 
                bg-[var(--accent-primary)] 
                text-[var(--background)]
                border-3 border-[var(--background)]
                text-display text-xl
                shadow-[4px_4px_0px_var(--accent-secondary)]
                hover:shadow-[6px_6px_0px_var(--accent-secondary)]
                hover:translate-x-[-2px] hover:translate-y-[-2px]
                transition-all duration-200
                flex items-center gap-2
              "
            >
              <Plus size={24} />
              {t('addVideo')}
            </motion.button>
          </div>

          {/* Add Note Input */}
          {isAddingNote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 bg-[var(--surface)] border-3 border-[var(--accent-primary)] shadow-[6px_6px_0px_var(--accent-primary)]"
            >
              <div className="flex items-center gap-4">
                <LinkIcon className="text-[var(--accent-primary)]" size={24} />
                <input
                  type="text"
                  placeholder={t('pasteYouTubeUrl')}
                  value={newNoteUrl}
                  onChange={(e) => setNewNoteUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNote();
                    if (e.key === 'Escape') {
                      setIsAddingNote(false);
                      setNewNoteUrl('');
                    }
                  }}
                  autoFocus
                  disabled={isLoading}
                  className="
                    flex-1 px-4 py-3
                    bg-[var(--background)]
                    border-2 border-[var(--border)]
                    text-mono text-sm
                    focus:border-[var(--accent-secondary)] focus:outline-none
                    disabled:opacity-50
                    transition-colors
                  "
                />
                <button
                  onClick={handleAddNote}
                  disabled={isLoading}
                  className="
                    px-6 py-3
                    bg-[var(--accent-secondary)]
                    text-[var(--background)]
                    text-display text-lg
                    hover:bg-[var(--accent-primary)]
                    disabled:opacity-50
                    transition-colors
                  "
                >
                  {isLoading ? t('loading') : t('add')}
                </button>
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNoteUrl('');
                  }}
                  disabled={isLoading}
                  className="
                    px-6 py-3
                    border-2 border-[var(--border)]
                    text-display text-lg
                    hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]
                    disabled:opacity-50
                    transition-colors
                  "
                >
                  {t('cancel')}
                </button>
              </div>
              <p className="mt-3 text-xs font-mono text-[var(--foreground-muted)]">
                {t('supportedUrls')}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Video Grid */}
        {notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="text-8xl mb-6">📹</div>
            <h2 className="text-display text-4xl mb-3">{t('noVideosYet')}</h2>
            <p className="text-mono text-sm text-[var(--foreground-muted)] mb-8">
              {t('startBuildingKnowledgeBase')}
            </p>
            <button
              onClick={() => setIsAddingNote(true)}
              className="
                px-8 py-4
                bg-[var(--accent-primary)]
                text-[var(--background)]
                border-3 border-[var(--background)]
                text-display text-2xl
                shadow-[4px_4px_0px_var(--accent-secondary)]
                hover:shadow-[6px_6px_0px_var(--accent-secondary)]
                hover:translate-x-[-2px] hover:translate-y-[-2px]
                transition-all duration-200
              "
            >
              {t('addYourFirstVideo')}
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <VideoCard
                  note={note}
                  onClick={() => onNoteClick(note.id)}
                  onStatusChange={onStatusChange}
                  onDelete={onDeleteNote}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
