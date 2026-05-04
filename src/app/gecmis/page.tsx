'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shift } from '@/types';
import ThemeToggle from '@/components/ThemeToggle';

function fmt(v: number) { return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); }

export default function GecmisPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('shifts').select('*').eq('status', 'closed').order('end_time', { ascending: false });
      setShifts(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <header className="header-bar sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-5 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <a href="/" className="w-7 h-7 rounded-lg flex items-center justify-center no-underline" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </a>
            <span className="text-xs font-bold t-primary tracking-tight">Geçmiş Vardiyalar</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="/" className="btn btn-primary text-[0.65rem] py-1.5 px-3 no-underline">← Dashboard</a>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-5 py-5">
        {loading ? (
          <div className="space-y-2.5">{[1,2,3].map(i => <div key={i} className="shimmer h-24" />)}</div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-2xl surface-3 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="t-tertiary">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </div>
            <h2 className="text-sm font-semibold t-primary mb-1">Henüz geçmiş vardiya yok</h2>
            <p className="text-[0.65rem] t-tertiary">Vardiyalar kapatıldıkça burada listelenecek.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Desktop header */}
            <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2 text-[0.55rem] font-bold t-tertiary uppercase tracking-[0.1em]">
              <div className="col-span-2">Personel</div>
              <div className="col-span-2">Tarih / Saat</div>
              <div className="col-span-2 text-right">Açılış → Kapanış</div>
              <div className="col-span-2 text-right">Komisyon</div>
              <div className="col-span-2 text-right">Masraf</div>
              <div className="col-span-2 text-right">Kasa Durumu</div>
            </div>

            {shifts.map((s, i) => (
              <div key={s.id} className="card" style={{ animation: `rowIn 0.25s ease-out ${i * 0.03}s both` }}>
                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-12 gap-3 items-center px-4 py-3.5">
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167,139,250,0.08)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold t-primary truncate">{s.personnel_name}</span>
                  </div>
                  <div className="col-span-2 text-[0.65rem] t-secondary">
                    <span>{fmtDate(s.start_time)}</span>
                    <span className="block t-tertiary tabular-nums">{fmtTime(s.start_time)} — {s.end_time ? fmtTime(s.end_time) : '—'}</span>
                  </div>
                  <div className="col-span-2 text-right text-xs tabular-nums">
                    <span className="t-secondary">{fmt(s.starting_cash)}</span>
                    <span className="t-tertiary mx-1">→</span>
                    <span className="t-primary font-semibold">{s.ending_cash !== null ? fmt(s.ending_cash) : '—'}</span>
                    <span className="t-tertiary text-[0.6rem] ml-0.5">₺</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-bold tabular-nums" style={{ color: '#34d399' }}>{fmt(s.total_commission)} ₺</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-bold tabular-nums" style={{ color: '#fb7185' }}>{fmt(s.total_expenses)} ₺</span>
                  </div>
                  <div className="col-span-2 text-right">
                    {s.cash_deficit !== null && (
                      <span className="text-xs font-bold tabular-nums" style={{ color: s.cash_deficit === 0 ? '#34d399' : '#fb7185' }}>
                        {s.cash_deficit === 0 ? '✓ Denk' : `${fmt(s.cash_deficit)} ₺`}
                      </span>
                    )}
                    {s.bank_balance !== null && (
                      <span className="block text-[0.55rem] t-tertiary mt-0.5 tabular-nums">Banka: {fmt(s.bank_balance)} ₺</span>
                    )}
                  </div>
                </div>

                {/* Mobile */}
                <div className="lg:hidden p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.08)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <span className="text-xs font-semibold t-primary">{s.personnel_name}</span>
                    </div>
                    <span className="text-[0.6rem] t-tertiary">{fmtDate(s.start_time)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[0.65rem]">
                    <div><span className="t-tertiary block mb-0.5">Kasa</span><span className="t-primary tabular-nums">{fmt(s.starting_cash)} → {s.ending_cash !== null ? fmt(s.ending_cash) : '—'} ₺</span></div>
                    <div className="text-right"><span className="t-tertiary block mb-0.5">Komisyon</span><span className="font-bold tabular-nums" style={{ color: '#34d399' }}>{fmt(s.total_commission)} ₺</span></div>
                    <div><span className="t-tertiary block mb-0.5">Masraf</span><span className="font-bold tabular-nums" style={{ color: '#fb7185' }}>{fmt(s.total_expenses)} ₺</span></div>
                    <div className="text-right"><span className="t-tertiary block mb-0.5">Durum</span>{s.cash_deficit !== null && <span className="font-bold tabular-nums" style={{ color: s.cash_deficit === 0 ? '#34d399' : '#fb7185' }}>{s.cash_deficit === 0 ? '✓ Denk' : `${fmt(s.cash_deficit)} ₺`}</span>}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
