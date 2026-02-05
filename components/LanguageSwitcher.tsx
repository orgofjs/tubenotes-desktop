'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface LanguageSwitcherProps {
  inline?: boolean; // inline mode for modals - shows list directly without dropdown
}

export default function LanguageSwitcher({ inline = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  // Update current language when i18n language changes
  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      setCurrentLang(lang);
      if (!inline) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // Inline mode - just show the list directly
  if (inline) {
    return (
      <div className="space-y-2">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ x: 4 }}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              w-full p-3 
              border-2 
              ${currentLang === lang.code 
                ? 'border-[var(--accent-primary)] bg-[var(--surface-hover)]' 
                : 'border-[var(--border)] hover:border-[var(--accent-secondary)]'
              }
              transition-all
              flex items-center justify-between
              group
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-sm font-mono">
                {lang.name}
              </span>
            </div>
            {currentLang === lang.code && (
              <Check size={16} className="text-[var(--accent-primary)]" />
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  // Inline mode - just show the list directly
  if (inline) {
    return (
      <div className="space-y-2">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ x: 4 }}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              w-full p-3 
              border-2 
              ${currentLang === lang.code 
                ? 'border-[var(--accent-primary)] bg-[var(--surface-hover)]' 
                : 'border-[var(--border)] hover:border-[var(--accent-secondary)]'
              }
              transition-all
              flex items-center justify-between
              group
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-sm font-mono">
                {lang.name}
              </span>
            </div>
            {currentLang === lang.code && (
              <Check size={16} className="text-[var(--accent-primary)]" />
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  // Regular dropdown mode
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--accent-primary)] transition-colors"
      >
        <Globe size={16} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-[var(--surface)] border-2 border-[var(--border)] shadow-[4px_4px_0px_var(--accent-primary)] z-[100]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`block w-full px-4 py-2 text-left text-sm font-mono hover:bg-[var(--surface-hover)] ${
                currentLang === lang.code ? 'text-[var(--accent-primary)]' : 'text-[var(--foreground-muted)]'
              }`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}