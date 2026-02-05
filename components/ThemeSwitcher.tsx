'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';

type Theme = 'dark' | 'navy' | 'light';

interface ThemeSwitcherProps {
  onThemeChange?: (theme: Theme) => void;
  inline?: boolean; // inline mode for modals - shows list directly without dropdown
}

export default function ThemeSwitcher({ onThemeChange, inline = false }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('tubenotes_theme') as Theme;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tubenotes_theme', theme);
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    if (!inline) {
      setIsOpen(false);
    }
    onThemeChange?.(theme);
  };

  const themes: { id: Theme; name: string; colors: { primary: string; secondary: string; bg: string } }[] = [
    {
      id: 'dark',
      name: 'Karanlık',
      colors: { primary: '#ff3366', secondary: '#00ff88', bg: '#0a0a0a' }
    },
    {
      id: 'navy',
      name: 'Lacivert',
      colors: { primary: '#415a77', secondary: '#00d4ff', bg: '#0d1b2a' }
    },
    {
      id: 'light',
      name: 'Açık',
      colors: { primary: '#d63384', secondary: '#0dcaf0', bg: '#f8f9fa' }
    },
  ];

  // Inline mode - just show the list directly
  if (inline) {
    return (
      <div className="space-y-2">
        {themes.map((theme) => (
          <motion.button
            key={theme.id}
            whileHover={{ x: 4 }}
            onClick={() => handleThemeChange(theme.id)}
            className={`
              w-full p-3 
              border-2 
              ${currentTheme === theme.id 
                ? 'border-[var(--accent-primary)] bg-[var(--surface-hover)]' 
                : 'border-[var(--border)] hover:border-[var(--accent-secondary)]'
              }
              transition-all
              flex items-center justify-between
              group
            `}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div 
                  className="w-3 h-3" 
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div 
                  className="w-3 h-3" 
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <div 
                  className="w-3 h-3 border border-[var(--border)]" 
                  style={{ backgroundColor: theme.colors.bg }}
                />
              </div>
              <span className="text-sm font-mono">
                {theme.name}
              </span>
            </div>
            {currentTheme === theme.id && (
              <Check size={16} className="text-[var(--accent-primary)]" />
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="
          p-3 
          bg-[var(--surface)] 
          border-2 border-[var(--border)]
          hover:border-[var(--accent-primary)]
          transition-colors
          flex items-center gap-2
        "
        title="Tema Değiştir"
      >
        <Palette size={20} className="text-[var(--accent-primary)]" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="
              absolute top-full right-0 mt-2
              bg-[var(--surface)]
              border-3 border-[var(--border)]
              shadow-[6px_6px_0px_var(--accent-primary)]
              p-3
              min-w-[200px]
              z-50
            "
          >
            <div className="text-xs font-mono text-[var(--foreground-muted)] mb-2 uppercase">
              Tema Seç
            </div>
            <div className="space-y-2">
              {themes.map((theme) => (
                <motion.button
                  key={theme.id}
                  whileHover={{ x: 4 }}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`
                    w-full p-3 
                    border-2 
                    ${currentTheme === theme.id 
                      ? 'border-[var(--accent-primary)] bg-[var(--surface-hover)]' 
                      : 'border-[var(--border)] hover:border-[var(--accent-secondary)]'
                    }
                    transition-all
                    flex items-center justify-between
                    group
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div 
                        className="w-3 h-3" 
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="w-3 h-3" 
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-3 h-3 border border-[var(--border)]" 
                        style={{ backgroundColor: theme.colors.bg }}
                      />
                    </div>
                    <span className="text-sm font-mono">
                      {theme.name}
                    </span>
                  </div>
                  {currentTheme === theme.id && (
                    <Check size={16} className="text-[var(--accent-primary)]" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
