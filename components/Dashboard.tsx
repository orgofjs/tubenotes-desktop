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
    <div className="flex-1 h-screen overflow-y-auto bg-background grid-noise">
      <div className="max-w-400 mx-auto" 
        style={{ 
          padding: 'calc(var(--spacing-unit) * 4)',
          paddingLeft: 'calc(var(--spacing-unit) * 6)'
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-display text-6xl text-foreground mb-2 tracking-wider">
                {t('videoLibrary')}
              </h1>
              <div className="flex items-center gap-4 text-sm font-mono text-foreground-muted">
                <span>{notes.length} {notes.length !== 1 ? t('videos') : t('video')}</span>
                <span className="text-accent-primary">•</span>
                <span>{notes.filter(n => n.status === 'watched').length} {t('watched')}</span>
                <span className="text-accent-primary">•</span>
                <span>{notes.filter(n => n.status === 'important').length} {t('important')}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddingNote(true)}
              className="
                px-6 py-3 
                bg-accent-primary 
                text-background
                theme-border
                text-display text-xl
                hover:brightness-110
                transition-all duration-200
                flex items-center gap-2
              "
              style={{
                borderColor: 'var(--border)',
                borderStyle: 'solid',
                boxShadow: 'var(--shadow-brutal)'
              }}
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
              className="p-6 bg-surface border-3 border-accent-primary shadow-[6px_6px_0px_var(--accent-primary)]"
            >
              <div className="flex items-center gap-4">
                <LinkIcon className="text-accent-primary" size={24} />
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
                    bg-background
                    border-2 border-border-color
                    text-mono text-sm
                    focus:border-accent-secondary focus:outline-none
                    disabled:opacity-50
                    transition-colors
                  "
                />
                <button
                  onClick={handleAddNote}
                  disabled={isLoading}
                  className="
                    px-6 py-3
                    bg-accent-secondary
                    text-background
                    text-display text-lg
                    hover:bg-accent-primary
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
                    border-2 border-border-color
                    text-display text-lg
                    hover:border-accent-primary hover:text-accent-primary
                    disabled:opacity-50
                    transition-colors
                  "
                >
                  {t('cancel')}
                </button>
              </div>
              <p className="mt-3 text-xs font-mono text-foreground-muted">
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
            <div className="text-8xl mb-6">??</div>
            <h2 className="text-display text-4xl mb-3">{t('noVideosYet')}</h2>
            <p className="text-mono text-sm text-foreground-muted mb-8">
              {t('startBuildingKnowledgeBase')}
            </p>
            <button
              onClick={() => setIsAddingNote(true)}
              className="
                px-8 py-4
                bg-accent-primary
                text-background
                border-3 border-background
                text-display text-2xl
                shadow-[4px_4px_0px_var(--accent-secondary)]
                hover:shadow-[6px_6px_0px_var(--accent-secondary)]
                hover:-translate-x-0.5 hover:-translate-y-0.5
                transition-all duration-200
              "
            >
              {t('addYourFirstVideo')}
            </button>
          </motion.div>
        ) : (
          <div className="theme-aware-grid">
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
