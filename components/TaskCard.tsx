'use client';

import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { KanbanTask } from '@/types';

interface TaskCardProps {
  task: KanbanTask;
  onEdit: (task: KanbanTask) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors: Record<KanbanTask['priority'], string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};

const priorityLabels: Record<KanbanTask['priority'], string> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
};

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
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityColor = priorityColors[task.priority];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group relative bg-surface border border-border-color hover:border-accent-primary transition-all"
      >
        {/* Priority indicator - thin left stripe */}
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: priorityColor }}
        />

        <div className="pl-3 pr-2 py-3">
          {/* Header row: drag handle + title + actions */}
          <div className="flex items-start gap-2">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 shrink-0 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={14} />
            </button>

            {/* Title - smaller and muted */}
            <p className="flex-1 text-sm font-mono text-foreground leading-snug break-all">
              {task.title}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-foreground-muted hover:text-accent-primary transition-colors"
                title={t('edit')}
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-foreground-muted hover:text-red-500 transition-colors"
                title={t('delete')}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="mt-1.5 ml-6 text-xs text-foreground-muted leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Footer: priority badge + due date */}
          <div className="flex items-center gap-2 mt-2 ml-6">
            <span
              className="text-xs font-mono px-1.5 py-0.5 uppercase tracking-wider"
              style={{ color: priorityColor, border: `1px solid ${priorityColor}33` }}
            >
              {priorityLabels[task.priority]}
            </span>

            {task.dueDate && (
              <span
                className={`flex items-center gap-1 text-xs font-mono ${
                  isOverdue ? 'text-red-500' : 'text-foreground-muted'
                }`}
              >
                <Calendar size={10} />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
