'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-lg pill" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-8 h-8 rounded-lg pill flex items-center justify-center cursor-pointer hover:border-[rgba(255,255,255,0.12)] transition-all duration-200"
      aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      title={isDark ? 'Aydınlık Mod' : 'Karanlık Mod'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="absolute transition-all duration-300"
        style={{
          color: '#fbbf24',
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'rotate(0) scale(1)' : 'rotate(90deg) scale(0)',
        }}
      >
        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="absolute transition-all duration-300"
        style={{
          color: '#6366f1',
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'rotate(-90deg) scale(0)' : 'rotate(0) scale(1)',
        }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  );
}
