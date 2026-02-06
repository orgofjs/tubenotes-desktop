'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KanbanTask } from '@/types';
import { Calendar, Trash2, Edit2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';

interface TaskCardProps {
  task: KanbanTask;
  onEdit: (task: KanbanTask) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { t } = useTranslation('common');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: 'var(--accent-blue)',
    medium: 'var(--accent-tertiary)',
    high: 'var(--accent-primary)',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative bg-[var(--surface)] border-2 border-[var(--border)] hover:border-[var(--accent-primary)] transition-all duration-200 w-full"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-3 top-3 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical size={16} className="text-[var(--foreground-muted)]" />
      </div>

      {/* Priority Indicator - İnce ve zarif */}
      <div
        className="absolute top-0 left-0 h-full"
        style={{ 
          backgroundColor: priorityColors[task.priority],
          width: '4px'
        }}
      />

      {/* Content - Dengeli padding */}
      <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '16px', paddingBottom: '16px' }}>
        {/* Title - Daha küçük ve şeffaf */}
        <h3 className="text-xs font-mono font-medium text-[var(--foreground-muted)] opacity-70 mb-2 pr-12 break-words">
          {task.title}
        </h3>

        {/* Description - Normal boyut ve okunabilir */}
        {task.description && (
          <p className="text-sm font-mono text-[var(--foreground)] mb-3 break-words whitespace-pre-wrap leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--foreground-muted)]">
          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
          )}

          {/* Priority Badge */}
          <span
            className="px-2 py-0.5 text-[10px] uppercase font-bold"
            style={{
              backgroundColor: priorityColors[task.priority],
              color: 'var(--background)',
            }}
          >
            {t(`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 hover:bg-[var(--surface-hover)] text-[var(--accent-secondary)] transition-colors"
            title={t('editTask')}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 hover:bg-[var(--surface-hover)] text-[var(--accent-primary)] transition-colors"
            title={t('deleteTask')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
