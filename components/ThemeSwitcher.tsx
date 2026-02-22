'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';

type ThemeFamily = 'cyberpunk' | 'editorial' | 'smooth';
type ThemeVariant = 'dark' | 'navy' | 'light';
type Theme = `${ThemeFamily}-${ThemeVariant}`;

interface ThemeSwitcherProps {
  onThemeChange?: (theme: Theme) => void;
  inline?: boolean; // inline mode for modals - shows list directly without dropdown
}

export default function ThemeSwitcher({ onThemeChange, inline = false }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>('cyberpunk-dark');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('tubenotes_theme') as Theme;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Migrate old themes
      const oldTheme = localStorage.getItem('tubenotes_theme');
      if (oldTheme === 'dark') {
        const newTheme = 'cyberpunk-dark';
        setCurrentTheme(newTheme);
        applyTheme(newTheme);
      } else if (oldTheme === 'navy') {
        const newTheme = 'cyberpunk-navy';
        setCurrentTheme(newTheme);
        applyTheme(newTheme);
      } else if (oldTheme === 'light') {
        const newTheme = 'cyberpunk-light';
        setCurrentTheme(newTheme);
        applyTheme(newTheme);
      }
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

  const themeGroups: {
    id: ThemeFamily;
    name: string;
    description: string;
    variants: {
      id: ThemeVariant;
      name: string;
      colors: { primary: string; secondary: string; bg: string };
    }[];
  }[] = [
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      description: 'Brutalist & Bold',
      variants: [
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
      ]
    },
    {
      id: 'editorial',
      name: 'Editorial',
      description: 'Minimal & Sophisticated',
      variants: [
        {
          id: 'dark',
          name: 'Karanlık',
          colors: { primary: '#c9a77c', secondary: '#7c9cb5', bg: '#0f0f0f' }
        },
        {
          id: 'navy',
          name: 'Lacivert',
          colors: { primary: '#b8956a', secondary: '#6b91b3', bg: '#1a1f2e' }
        },
        {
          id: 'light',
          name: 'Açık',
          colors: { primary: '#8b6f47', secondary: '#4a6fa5', bg: '#fafaf9' }
        },
      ]
    },
    {
      id: 'smooth',
      name: 'Smooth',
      description: 'Modern & Polished',
      variants: [
        {
          id: 'dark',
          name: 'Karanlık',
          colors: { primary: '#6c8ef5', secondary: '#4ecdc4', bg: '#111318' }
        },
        {
          id: 'navy',
          name: 'Lacivert',
          colors: { primary: '#7b9ff5', secondary: '#44d9b8', bg: '#0e1525' }
        },
        {
          id: 'light',
          name: 'Açık',
          colors: { primary: '#4f6ef0', secondary: '#2ea8a0', bg: '#f4f5fb' }
        },
      ]
    }
  ];

  const getCurrentThemeFamily = (): ThemeFamily => {
    return currentTheme.split('-')[0] as ThemeFamily;
  };

  const getCurrentThemeVariant = (): ThemeVariant => {
    return currentTheme.split('-')[1] as ThemeVariant;
  };

  // Inline mode - show theme groups with variants
  if (inline) {
    return (
      <div className="space-y-6">{themeGroups.map((group) => (
          <div key={group.id} className="space-y-3">
            {/* Theme Group Header */}
            <div className="flex items-baseline gap-2 border-b-2 border-border-color pb-2">
              <h4 className="text-base font-mono font-bold text-foreground">
                {group.name}
              </h4>
              <span className="text-xs text-foreground-muted">
                {group.description}
              </span>
            </div>

            {/* Variants Grid */}
            <div className="grid grid-cols-3 gap-2">
              {group.variants.map((variant) => {
                const themeId: Theme = `${group.id}-${variant.id}`;
                const isActive = currentTheme === themeId;
                
                return (
                  <motion.button
                    key={themeId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleThemeChange(themeId)}
                    className={`
                      relative p-3 
                      border-2 
                      ${isActive 
                        ? 'border-accent-primary bg-surface-hover' 
                        : 'border-border-color hover:border-accent-secondary'
                      }
                      transition-all
                      flex flex-col items-center gap-2
                      group
                    `}
                  >
                    {/* Color Preview */}
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 border border-border-color" 
                        style={{ backgroundColor: variant.colors.primary }}
                      />
                      <div 
                        className="w-4 h-4 border border-border-color" 
                        style={{ backgroundColor: variant.colors.secondary }}
                      />
                      <div 
                        className="w-4 h-4 border border-border-color" 
                        style={{ backgroundColor: variant.colors.bg }}
                      />
                    </div>

                    {/* Variant Name */}
                    <span className="text-xs font-mono">
                      {variant.name}
                    </span>

                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1"
                      >
                        <Check size={14} className="text-accent-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
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
          bg-surface 
          border-2 border-border-color
          hover:border-accent-primary
          transition-colors
          flex items-center gap-2
        "
        title="Tema Değiştir"
      >
        <Palette size={20} className="text-accent-primary" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="
              absolute top-full right-0 mt-2
              bg-surface
              border-3 border-border-color
              shadow-[6px_6px_0px_var(--accent-primary)]
              p-4
              min-w-70
              z-50
            "
          >
            <div className="text-xs font-mono text-foreground-muted mb-3 uppercase">
              Tema Seç
            </div>
            
            <div className="space-y-4">
              {themeGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  {/* Theme Group Label */}
                  <div className="text-xs font-mono text-foreground uppercase">
                    {group.name}
                  </div>
                  
                  {/* Variants */}
                  <div className="space-y-1">
                    {group.variants.map((variant) => {
                      const themeId: Theme = `${group.id}-${variant.id}`;
                      const isActive = currentTheme === themeId;
                      
                      return (
                        <motion.button
                          key={themeId}
                          whileHover={{ x: 4 }}
                          onClick={() => handleThemeChange(themeId)}
                          className={`
                            w-full p-2 
                            border-2 
                            ${isActive 
                              ? 'border-accent-primary bg-surface-hover' 
                              : 'border-border-color hover:border-accent-secondary'
                            }
                            transition-all
                            flex items-center justify-between
                            group
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div 
                                className="w-3 h-3 border border-border-color" 
                                style={{ backgroundColor: variant.colors.primary }}
                              />
                              <div 
                                className="w-3 h-3 border border-border-color" 
                                style={{ backgroundColor: variant.colors.secondary }}
                              />
                              <div 
                                className="w-3 h-3 border border-border-color" 
                                style={{ backgroundColor: variant.colors.bg }}
                              />
                            </div>
                            <span className="text-xs font-mono">
                              {variant.name}
                            </span>
                          </div>
                          {isActive && (
                            <Check size={14} className="text-accent-primary" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
