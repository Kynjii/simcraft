'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../lib/i18n';

export default function UpdateChecker() {
  const { t } = useLanguage();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [version, setVersion] = useState('');
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const api = window.electronAPI;
    if (!api) return;

    const unlisten = api.onUpdateAvailable((ver) => {
      setUpdateAvailable(true);
      setVersion(ver);
    });

    api
      .checkForUpdate()
      .then((result) => {
        if (result) {
          setUpdateAvailable(true);
          setVersion(result.version);
        }
      })
      .catch(() => {});

    const unlistenProgress = api.onDownloadProgress((percent) => {
      setProgress(Math.round(percent));
    });

    return () => {
      unlisten();
      unlistenProgress();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function handleInstall() {
    if (simulated) {
      setOpen(false);
      return;
    }
    const api = window.electronAPI;
    if (!api) return;
    setInstalling(true);
    setError('');
    try {
      await api.downloadAndInstall();
    } catch (e: any) {
      setError(e?.message || 'Update failed');
      setInstalling(false);
    }
  }

  if (!updateAvailable) return null;

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={`${t('layout.updateAvailable')} — v${version}`}
        aria-label={t('layout.updateAvailable')}
        className="relative inline-flex h-5 w-5 items-center justify-center text-primary transition-colors hover:text-primary/80"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4"
          />
        </svg>
        <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-3 w-64 rounded-lg border border-gold/40 bg-[#1a1a2e] p-3 shadow-lg shadow-black/40">
          <p className="text-sm font-medium text-gray-200">{t('layout.updateAvailable')}</p>
          <p className="mt-0.5 text-xs text-gray-400">{t('layout.updateReady', { version })}</p>
          {error && <p className="mt-1 text-xs text-red-400">{t('layout.updateFailed')}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="rounded bg-gold px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-gold/90 disabled:opacity-50"
            >
              {installing ? t('layout.downloading', { progress }) : t('layout.installRestart')}
            </button>
            <button
              onClick={() => setOpen(false)}
              disabled={installing}
              className="rounded px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-gray-200"
            >
              {t('layout.later')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
