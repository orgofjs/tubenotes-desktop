'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KanbanTask, KanbanColumn as ColumnType } from '@/types';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  columnId: ColumnType;
  tasks: KanbanTask[];
  onAddTask: (status: ColumnType) => void;
  onEditTask: (task: KanbanTask) => void;
  onDeleteTask: (id: string) => void;
}

export default function KanbanColumn({
  columnId,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { t } = useTranslation('common');
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  const columnTitles: Record<ColumnType, string> = {
    'todo': t('columnTodo'),
    'in-progress': t('columnInProgress'),
    'on-hold': t('columnOnHold'),
    'done': t('columnDone'),
  };

  const columnColors: Record<ColumnType, string> = {
    'todo': 'var(--accent-blue)',
    'in-progress': 'var(--accent-tertiary)',
    'on-hold': 'var(--foreground-muted)',
    'done': 'var(--accent-secondary)',
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col h-full w-full min-w-[340px] max-w-[340px] flex-shrink-0
        border-2 transition-all duration-200
        ${isOver 
          ? 'border-[var(--accent-primary)] bg-[var(--surface-hover)]' 
          : 'border-[var(--border)] bg-[var(--background)]'
        }
      `}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3"
            style={{ backgroundColor: columnColors[columnId] }}
          />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider">
            {columnTitles[columnId]}
          </h2>
          <span className="px-2 py-0.5 text-xs font-mono bg-[var(--surface)] text-[var(--foreground-muted)]">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(columnId)}
          className="p-1.5 hover:bg-[var(--surface-hover)] text-[var(--accent-primary)] transition-colors"
          title={t('addTask')}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full min-h-[200px] text-center"
              >
                <p className="text-xs font-mono text-[var(--foreground-muted)] mb-2">
                  {t('noTasksYet')}
                </p>
                <p className="text-xs font-mono text-[var(--foreground-muted)] opacity-60">
                  {t('dragTasksHere')}
                </p>
              </motion.div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </AnimatePresence>
        </SortableContext>
      </div>
    </div>
  );
}
