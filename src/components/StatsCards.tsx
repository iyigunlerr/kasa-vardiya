'use client';

import React from 'react';
import { Shift } from '@/types';

function fmt(v: number): string {
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

export default function StatsCards({ shift }: { shift: Shift }) {
  const netPosition = shift.starting_cash - shift.total_commission;

  const cards = [
    {
      label: 'Açılış Kasası',
      sub: 'Devralınan Tutar',
      value: shift.starting_cash,
      color: '#818cf8',
      glow: 'glow-blue',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      label: 'Toplam Komisyon',
      sub: 'Gün İçi Kazanç',
      value: shift.total_commission,
      color: '#34d399',
      glow: 'glow-green',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
    },
    {
      label: 'Toplam Masraflar',
      sub: 'Gün İçi Gider',
      value: shift.total_expenses,
      color: '#fb7185',
      glow: 'glow-red',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
        </svg>
      ),
    },
    {
      label: 'Beklenen Kasa',
      sub: 'Açılış − Komisyon',
      value: netPosition,
      color: '#a78bfa',
      glow: 'glow-violet',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`stat-card ${c.glow} group`}>
          {/* Top row */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[0.65rem] font-semibold t-tertiary uppercase tracking-[0.1em]">{c.label}</span>
            <div className="opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: c.color }}>
              {c.icon}
            </div>
          </div>

          {/* Value */}
          <div className="mb-1">
            <span className="text-[1.75rem] font-bold tracking-tight tabular-nums t-primary leading-none">
              {fmt(c.value)}
            </span>
            <span className="text-xs t-tertiary font-medium ml-1">₺</span>
          </div>

          {/* Sub */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1 h-1 rounded-full" style={{ background: c.color, opacity: 0.6 }} />
            <span className="text-[0.6rem] t-tertiary">{c.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
