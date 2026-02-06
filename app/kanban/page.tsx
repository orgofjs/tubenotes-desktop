'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import KanbanBoard from '@/components/KanbanBoard';

export default function KanbanPage() {
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="border-b-2 border-[var(--border)] p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  // Get return selection from localStorage
                  const returnSelection = localStorage.getItem('kanbanReturnSelection');
                  
                  // Store pending event for after navigation
                  if (returnSelection) {
                    localStorage.setItem('pendingNavigationEvent', returnSelection);
                  }
                  
                  // Use Electron IPC navigation in production (bypasses Next.js Router)
                  if (typeof window !== 'undefined' && (window as any).electronAPI?.navigation) {
                    (window as any).electronAPI.navigation.goto('/');
                  } else {
                    // Fallback for dev mode
                    router.push('/');
                  }
                }}
                className="p-2 hover:bg-[var(--surface-hover)] transition-colors"
                title={t('back')}
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-display font-bold uppercase tracking-wider">
                  {t('kanbanBoard')}
                </h1>
                <p className="text-sm font-mono text-[var(--foreground-muted)] mt-1">
                  {t('kanbanBoardDescription')}
                </p>
              </div>
            </div>
          </div>
        </motion.header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-[var(--background)]">
        <KanbanBoard />
      </main>
    </div>
  );
}
