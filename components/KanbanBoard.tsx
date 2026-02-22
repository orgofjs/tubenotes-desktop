'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KanbanTask, KanbanColumn as ColumnType } from '@/types';
import KanbanColumn from './KanbanColumn';
import { X } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { kanbanAPI } from '@/lib/electronAPI';

interface TaskModalData {
  isOpen: boolean;
  mode: 'create' | 'edit';
  status?: ColumnType;
  task?: KanbanTask;
}

export default function KanbanBoard() {
  const { t } = useTranslation('common');
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [modalData, setModalData] = useState<TaskModalData>({
    isOpen: false,
    mode: 'create',
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await kanbanAPI.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleAddTask = (status: ColumnType) => {
    setModalData({ isOpen: true, mode: 'create', status });
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
  };

  const handleEditTask = (task: KanbanTask) => {
    setModalData({ isOpen: true, mode: 'edit', task });
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm(t('confirmDeleteTask'))) return;

    try {
      await kanbanAPI.delete(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert(t('failedToDeleteTask'));
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalData.mode === 'create') {
        const newTask = await kanbanAPI.create({
          ...formData,
          status: modalData.status,
          position: tasks.filter(t => t.status === modalData.status).length,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        });
        setTasks([...tasks, newTask]);
      } else if (modalData.task) {
        const updatedTask = await kanbanAPI.update(modalData.task.id, {
          ...formData,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        });
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      }

      setModalData({ isOpen: false, mode: 'create' });
    } catch (error) {
      console.error('Failed to save task:', error);
      alert(modalData.mode === 'create' ? t('failedToCreateTask') : t('failedToUpdateTask'));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask) return;

    // If dragging over a column
    if (['todo', 'in-progress', 'on-hold', 'done'].includes(overId)) {
      if (activeTask.status !== overId) {
        setTasks(tasks.map(t => 
          t.id === activeId ? { ...t, status: overId as ColumnType } : t
        ));
      }
      return;
    }

    // If dragging over another task
    if (overTask && activeTask.id !== overTask.id) {
      const activeIndex = tasks.findIndex(t => t.id === activeId);
      const overIndex = tasks.findIndex(t => t.id === overId);

      if (activeTask.status !== overTask.status) {
        // Moving to different column
        setTasks(tasks.map(t => 
          t.id === activeId ? { ...t, status: overTask.status } : t
        ));
      } else {
        // Reordering within same column
        setTasks(arrayMove(tasks, activeIndex, overIndex));
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const overId = over.id as string;
    let newStatus = activeTask.status;

    // Determine new status
    if (['todo', 'in-progress', 'on-hold', 'done'].includes(overId)) {
      newStatus = overId as ColumnType;
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Calculate new position
    const columnTasks = tasks.filter(t => t.status === newStatus && t.id !== activeId);
    const overIndex = columnTasks.findIndex(t => t.id === overId);
    const newPosition = overIndex >= 0 ? overIndex : columnTasks.length;

    try {
      await kanbanAPI.update(activeId, {
        status: newStatus,
        position: newPosition,
      });

      // Reload tasks to get updated positions
      await loadTasks();
    } catch (error) {
      console.error('Failed to update task position:', error);
      // Revert optimistic update
      await loadTasks();
    }
  };

  const getTasksByColumn = (status: ColumnType) => {
    return tasks.filter(t => t.status === status).sort((a, b) => a.position - b.position);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full overflow-x-auto p-6">
          <KanbanColumn
            columnId="todo"
            tasks={getTasksByColumn('todo')}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
          <KanbanColumn
            columnId="in-progress"
            tasks={getTasksByColumn('in-progress')}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
          <KanbanColumn
            columnId="on-hold"
            tasks={getTasksByColumn('on-hold')}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
          <KanbanColumn
            columnId="done"
            tasks={getTasksByColumn('done')}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="opacity-80">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      <AnimatePresence>
        {modalData.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setModalData({ isOpen: false, mode: 'create' })}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-surface border-2 border-accent-primary p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-mono font-bold uppercase">
                  {modalData.mode === 'create' ? t('addTask') : t('editTask')}
                </h2>
                <button
                  onClick={() => setModalData({ isOpen: false, mode: 'create' })}
                  className="text-foreground-muted hover:text-accent-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitTask} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-mono uppercase text-foreground-muted mb-2">
                    {t('taskTitle')}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('taskTitlePlaceholder')}
                    required
                    className="w-full bg-background border-2 border-border-color p-3 text-sm font-mono focus:outline-none focus:border-accent-primary"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono uppercase text-foreground-muted mb-2">
                    {t('taskDescription')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('taskDescriptionPlaceholder')}
                    rows={4}
                    className="w-full bg-background border-2 border-border-color p-3 text-sm font-mono focus:outline-none focus:border-accent-primary resize-y min-h-25 max-h-75"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-mono uppercase text-foreground-muted mb-2">
                    {t('priority')}
                  </label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority })}
                        className={`
                          flex-1 py-2 text-xs font-mono uppercase font-bold transition-all
                          ${formData.priority === priority
                            ? 'bg-accent-primary text-background border-2 border-accent-primary'
                            : 'bg-background text-foreground-muted border-2 border-border-color hover:border-accent-primary'
                          }
                        `}
                      >
                        {t(`priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-mono uppercase text-foreground-muted mb-2">
                    {t('dueDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-background border-2 border-border-color p-3 text-sm font-mono focus:outline-none focus:border-accent-primary"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-accent-primary text-background text-sm font-mono font-bold uppercase hover:bg-accent-secondary transition-colors"
                  >
                    {modalData.mode === 'create' ? t('add') : t('save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalData({ isOpen: false, mode: 'create' })}
                    className="flex-1 py-3 border-2 border-border-color text-sm font-mono font-bold uppercase hover:border-accent-primary transition-colors"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
