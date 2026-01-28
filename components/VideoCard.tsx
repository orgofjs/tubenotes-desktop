'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { Clock, Eye, EyeOff, Star, Trash2 } from 'lucide-react';
import { VideoNote } from '@/types';
import { getYouTubeThumbnail } from '@/lib/youtube';
import { format } from 'date-fns';

interface VideoCardProps {
  note: VideoNote;
  onClick: () => void;
  onStatusChange: (noteId: string, status: VideoNote['status']) => void;
  onDelete?: (noteId: string) => void;
}

export default function VideoCard({ note, onClick, onStatusChange, onDelete }: VideoCardProps) {
  const { t } = useTranslation('common');
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = {
    unwatched: 'var(--foreground-muted)',
    watching: 'var(--status-watching)',
    watched: 'var(--status-watched)',
    important: 'var(--status-important)',
  };

  const statusIcons = {
    unwatched: EyeOff,
    watching: Eye,
    watched: Eye,
    important: Star,
  };

  const StatusIcon = statusIcons[note.status];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(t('confirmDeleteNote'))) {
      onDelete(note.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-[var(--surface)] border-3 border-[var(--border)] overflow-hidden">
        {!imageError ? (
          <Image
            src={getYouTubeThumbnail(note.url)}
            alt={note.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--foreground-muted)]">
            <div className="text-center">
              <div className="text-4xl mb-2">📹</div>
              <div className="text-xs font-mono">{t('noThumbnail')}</div>
            </div>
          </div>
        )}

        {/* Overlay on Hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent flex items-end justify-between p-4"
        >
          <div className="flex gap-2">
            {(['unwatched', 'watching', 'watched', 'important'] as const).map((status) => {
              const Icon = statusIcons[status];
              return (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(note.id, status);
                  }}
                  className="p-2 bg-[var(--background)] border-2 border-[var(--border)] hover:border-[var(--accent-primary)] transition-colors"
                  style={{
                    color: note.status === status ? statusColors[status] : 'var(--foreground-muted)',
                  }}
                >
                  <Icon size={16} />
                </motion.button>
              );
            })}
          </div>
          
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              className="p-2 bg-[var(--background)] border-2 border-[var(--border)] hover:border-[var(--accent-primary)] text-[var(--foreground-muted)] hover:text-[var(--accent-primary)] transition-colors"
            >
              <Trash2 size={16} />
            </motion.button>
          )}
        </motion.div>

        {/* Status Badge */}
        <div
          className="absolute top-2 right-2 px-2 py-1 text-xs font-mono bg-[var(--background)] border-2"
          style={{
            borderColor: statusColors[note.status],
            color: statusColors[note.status],
          }}
        >
          {t(note.status + 'Status').toUpperCase()}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-3 space-y-2">
        <h3 className="text-sm font-mono leading-tight line-clamp-2 group-hover:text-[var(--accent-primary)] transition-colors">
          {note.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] font-mono">
          <span>{note.channelName || t('unknownChannel')}</span>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{format(new Date(note.createdAt), 'dd MMM')}</span>
          </div>
        </div>
      </div>

      {/* Brutal Bottom Border */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        className="h-1 bg-[var(--accent-primary)] mt-2 origin-left"
      />
    </motion.div>
  );
}
