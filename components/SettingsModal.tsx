'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Globe, Palette } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation('common');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
              w-full max-w-md bg-[var(--surface)] border-3 border-[var(--border)]
              shadow-[8px_8px_0px_var(--accent-primary)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-3 border-[var(--border)]">
              <h2 className="text-display text-2xl text-[var(--accent-primary)]">
                {t('settings')}
              </h2>
              <button
                onClick={onClose}
                className="text-[var(--foreground-muted)] hover:text-[var(--accent-primary)] 
                  transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Theme Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                  <Palette size={18} />
                  <h3 className="text-sm font-mono uppercase">
                    {t('themeSettings')}
                  </h3>
                </div>
                <div className="pl-7">
                  <ThemeSwitcher inline />
                </div>
              </div>

              {/* Language Section */}
              <div className="space-y-3 border-t-2 border-[var(--border)] pt-6">
                <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                  <Globe size={18} />
                  <h3 className="text-sm font-mono uppercase">
                    {t('languageSettings')}
                  </h3>
                </div>
                <div className="pl-7">
                  <LanguageSwitcher inline />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t-3 border-[var(--border)] bg-[var(--background)]">
              <button
                onClick={onClose}
                className="w-full py-3 bg-[var(--accent-primary)] text-[var(--background)] 
                  text-sm font-mono uppercase hover:bg-[var(--accent-secondary)] 
                  transition-colors shadow-[4px_4px_0px_var(--border)]
                  hover:shadow-[6px_6px_0px_var(--border)]
                  active:shadow-[2px_2px_0px_var(--border)]
                  active:translate-x-[2px] active:translate-y-[2px]
                  transition-all duration-150"
              >
                {t('close')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
