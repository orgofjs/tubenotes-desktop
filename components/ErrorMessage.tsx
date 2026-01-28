'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  const { t } = useTranslation('common');
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 z-50 max-w-md"
    >
      <div className="bg-[var(--surface)] border-3 border-[var(--accent-primary)] shadow-[6px_6px_0px_var(--accent-primary)] p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-[var(--accent-primary)] flex-shrink-0" size={24} />
          <div className="flex-1">
            <h3 className="text-display text-lg text-[var(--accent-primary)] mb-1">{t('error')}</h3>
            <p className="text-mono text-sm text-[var(--foreground-muted)]">{message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-[var(--foreground-muted)] hover:text-[var(--accent-primary)] transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
