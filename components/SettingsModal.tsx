'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Globe, Palette, Info, ExternalLink, Download, Server, Shield } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'theme' | 'language' | 'export' | 'selfhost' | 'privacy' | 'about';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    { id: 'theme', label: t('themeSettings'), icon: <Palette size={20} /> },
    { id: 'language', label: t('languageSettings'), icon: <Globe size={20} /> },
    { id: 'export', label: 'Export Data', icon: <Download size={20} />, disabled: true },
    { id: 'selfhost', label: 'Self Host', icon: <Server size={20} />, disabled: true },
    { id: 'privacy', label: t('privacyPolicySettings'), icon: <Shield size={20} /> },
    { id: 'about', label: t('aboutSettings'), icon: <Info size={20} /> },
  ];

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
              w-full max-w-4xl h-150 bg-surface theme-border flex flex-col"
            style={{
              borderColor: 'var(--border)',
              borderStyle: 'solid',
              boxShadow: 'var(--shadow-brutal)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 theme-border"
              style={{
                borderBottomWidth: 'var(--border-width)',
                borderColor: 'var(--border)',
                borderStyle: 'solid',
                borderLeft: '0',
                borderRight: '0',
                borderTop: '0'
              }}
            >
              <h2 className="text-display text-2xl text-accent-primary">
                {t('settings')}
              </h2>
              <button
                onClick={onClose}
                className="text-foreground-muted hover:text-accent-primary 
                  transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content - Sidebar Layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar - Vertical Tabs */}
              <div className="w-64 theme-border"
                style={{
                  borderRightWidth: 'var(--border-width)',
                  borderColor: 'var(--border)',
                  borderStyle: 'solid',
                  borderLeft: '0',
                  borderTop: '0',
                  borderBottom: '0'
                }}
              >
                <nav className="p-4 space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => !tab.disabled && setActiveTab(tab.id)}
                      disabled={tab.disabled}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3
                        text-left font-mono text-sm
                        transition-all duration-200
                        theme-border
                        ${tab.disabled
                          ? 'opacity-40 cursor-not-allowed text-foreground-muted'
                          : activeTab === tab.id
                            ? 'bg-accent-primary text-background'
                            : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground'
                        }
                      `}
                      style={{
                        borderLeftWidth: activeTab === tab.id ? 'calc(var(--border-width) * 2)' : '0',
                        borderColor: activeTab === tab.id ? 'var(--accent-secondary)' : 'transparent',
                        borderStyle: 'solid',
                        borderRadius: 'var(--border-radius)'
                      }}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Right Panel - Contextual Settings */}
              <div className="flex-1 overflow-y-auto p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'theme' && (
                    <motion.div
                      key="theme"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-display text-xl mb-2 text-foreground">
                          {t('themeSettings')}
                        </h3>
                        <p className="text-sm text-foreground-muted font-mono mb-6">
                          Choose your visual theme and color palette
                        </p>
                      </div>
                      <ThemeSwitcher inline />
                    </motion.div>
                  )}

                  {activeTab === 'language' && (
                    <motion.div
                      key="language"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-display text-xl mb-2 text-foreground">
                          {t('languageSettings')}
                        </h3>
                        <p className="text-sm text-foreground-muted font-mono mb-6">
                          Select your preferred language
                        </p>
                      </div>
                      <LanguageSwitcher inline />
                    </motion.div>
                  )}

                  {activeTab === 'privacy' && (
                    <motion.div
                      key="privacy"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-display text-xl mb-2 text-foreground">
                          {t('privacyPolicy')}
                        </h3>
                        <p className="text-sm text-foreground-muted font-mono mb-6">
                          {t('privacyPolicyDescription')}
                        </p>
                      </div>

                      <div className="space-y-4 max-h-95 overflow-y-auto pr-2 scrollbar-hidden">
                        {/* Privacy Notice Banner */}
                        <div className="p-4 theme-border bg-accent-primary/10"
                          style={{
                            borderColor: 'var(--accent-primary)',
                            borderStyle: 'solid',
                            borderWidth: 'var(--border-width)',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <p className="text-sm font-mono text-accent-primary leading-relaxed">
                            {t('privacyNotice')}
                          </p>
                        </div>

                        {/* Section 1 - Data Collection */}
                        <div className="theme-border bg-background p-4"
                          style={{
                            borderColor: 'var(--border)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <h4 className="text-sm font-mono font-bold text-foreground mb-3">
                            1. {t('privacyDataCollection')}
                          </h4>
                          <ul className="space-y-2 text-xs font-mono text-foreground-muted leading-relaxed">
                            <li>• {t('privacyNoPersonalData')}</li>
                            <li>• {t('privacyNoTracking')}</li>
                            <li>• {t('privacyNoExternalServers')}</li>
                          </ul>
                        </div>

                        {/* Section 2 - Data Storage */}
                        <div className="theme-border bg-background p-4"
                          style={{
                            borderColor: 'var(--border)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <h4 className="text-sm font-mono font-bold text-foreground mb-3">
                            2. {t('privacyDataStorage')}
                          </h4>
                          <ul className="space-y-2 text-xs font-mono text-foreground-muted leading-relaxed">
                            <li>• {t('privacyLocalStorage')}</li>
                            <li>• {t('privacyFileAccess')}</li>
                          </ul>
                        </div>

                        {/* Section 3 - Internet Usage */}
                        <div className="theme-border bg-background p-4"
                          style={{
                            borderColor: 'var(--border)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <h4 className="text-sm font-mono font-bold text-foreground mb-3">
                            3. {t('privacyInternetUsage')}
                          </h4>
                          <ul className="space-y-2 text-xs font-mono text-foreground-muted leading-relaxed">
                            <li>• {t('privacyUpdateChecks')}</li>
                            <li>• {t('privacyExternalLinks')}</li>
                          </ul>
                        </div>

                        {/* Section 4 - User Control */}
                        <div className="theme-border bg-background p-4"
                          style={{
                            borderColor: 'var(--border)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <h4 className="text-sm font-mono font-bold text-foreground mb-3">
                            4. {t('privacyUserControl')}
                          </h4>
                          <p className="text-xs font-mono text-foreground-muted leading-relaxed">
                            {t('privacyUserControlDesc')}
                          </p>
                        </div>

                        {/* Section 5 - Contact */}
                        <div className="theme-border bg-background p-4"
                          style={{
                            borderColor: 'var(--border)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <h4 className="text-sm font-mono font-bold text-foreground mb-3">
                            5. {t('privacyContact')}
                          </h4>
                          <p className="text-xs font-mono text-foreground-muted leading-relaxed">
                            {t('privacyContactDesc')}
                          </p>
                        </div>

                        {/* Last Updated */}
                        <div className="mt-4 p-3 theme-border bg-surface-hover"
                          style={{
                            borderColor: 'var(--border)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <p className="text-xs font-mono text-foreground-muted">
                            {t('privacyLastUpdated')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'about' && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8"
                    >
                      {/* About Header */}
                      <div>
                        <h3 className="text-display text-xl mb-2 text-foreground">
                          {t('about')}
                        </h3>
                        <p className="text-sm text-foreground-muted font-mono">
                          TubeNotes - Visual Video Knowledge Base
                        </p>
                      </div>

                      {/* Info Grid */}
                      <div className="space-y-4">
                        {/* Version */}
                        <div className="flex items-center justify-between p-4 theme-border bg-background"
                          style={{
                            borderColor: 'var(--border)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <span className="text-sm font-mono text-foreground-muted">
                            {t('version')}
                          </span>
                          <span className="text-sm font-mono text-accent-primary">
                            0.2.6
                          </span>
                        </div>

                        {/* License */}
                        <div className="flex items-center justify-between p-4 theme-border bg-background"
                          style={{
                            borderColor: 'var(--border)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <span className="text-sm font-mono text-foreground-muted">
                            {t('license')}
                          </span>
                          <span className="text-sm font-mono text-accent-secondary">
                            Apache 2.0
                          </span>
                        </div>

                        {/* Founder */}
                        <div className="flex items-center justify-between p-4 theme-border bg-background"
                          style={{
                            borderColor: 'var(--border)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <span className="text-sm font-mono text-foreground-muted">
                            {t('founder')}
                          </span>
                          <a
                            href="https://github.com/orgofjs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-mono text-accent-primary hover:text-accent-secondary transition-colors"
                          >
                            @orgofjs
                            <ExternalLink size={14} />
                          </a>
                        </div>

                        {/* Repository */}
                        <div className="flex items-center justify-between p-4 theme-border bg-background"
                          style={{
                            borderColor: 'var(--border)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <span className="text-sm font-mono text-foreground-muted">
                            {t('repository')}
                          </span>
                          <a
                            href="https://github.com/orgofjs/tubenotes-desktop"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-mono text-accent-primary hover:text-accent-secondary transition-colors"
                          >
                            {t('openSource')}
                            <ExternalLink size={14} />
                          </a>
                        </div>

                        {/* Contributors */}
                        <div className="theme-border bg-background"
                          style={{
                            borderColor: 'var(--border)',
                            borderStyle: 'solid',
                            borderRadius: 'var(--border-radius)'
                          }}
                        >
                          <div className="p-4 border-b"
                            style={{
                              borderColor: 'var(--border)',
                              borderBottomWidth: 'var(--border-width)'
                            }}
                          >
                            <span className="text-sm font-mono text-foreground-muted">
                              {t('contributors')}
                            </span>
                          </div>
                          <div className="max-h-32 overflow-y-auto scrollbar-hidden p-2">
                            {/* Contributor Item - orgofjs */}
                            <a
                              href="https://github.com/orgofjs"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-end gap-2 p-3 hover:bg-surface-hover transition-colors group"
                              style={{
                                borderRadius: 'var(--border-radius)'
                              }}
                            >
                              <span className="text-sm font-mono text-foreground group-hover:text-accent-primary transition-colors">
                                orgofjs
                              </span>
                              <ExternalLink size={14} className="text-foreground-muted group-hover:text-accent-secondary transition-colors" />
                            </a>

                            {/* Contributor Item - midhunadarvin */}
                            <a
                              href="https://github.com/midhunadarvin"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-end gap-2 p-3 hover:bg-surface-hover transition-colors group"
                              style={{
                                borderRadius: 'var(--border-radius)'
                              }}
                            >
                              <span className="text-sm font-mono text-foreground group-hover:text-accent-primary transition-colors">
                                midhunadarvin
                              </span>
                              <ExternalLink size={14} className="text-foreground-muted group-hover:text-accent-secondary transition-colors" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Footer Note */}
                      <div className="mt-8 p-4 theme-border bg-surface-hover"
                        style={{
                          borderColor: 'var(--border)',
                          borderStyle: 'solid',
                          borderRadius: 'var(--border-radius)'
                        }}
                      >
                        <p className="text-xs font-mono text-foreground-muted leading-relaxed">
                          TubeNotes is an open-source project. Contributions are welcome!
                          Visit our GitHub repository to report issues or contribute.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
