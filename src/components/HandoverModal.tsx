'use client';

import React, { useState } from 'react';
import { Shift } from '@/types';

function fmt(v: number) { return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v); }

export default function HandoverModal({ shift, onClose, onCalculate }: { shift: Shift; onClose: () => void; onCalculate: (ending: number, bank: number) => void }) {
  const [sistem, setSistem] = useState('');
  const [banka, setBanka] = useState('');

  const devredilenKasa = sistem ? parseFloat(sistem) - parseFloat(banka || '0') : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sistem) return;
    onCalculate(parseFloat(sistem), parseFloat(banka || '0'));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.12)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold t-primary tracking-tight">Devir Teslim</h2>
          <p className="text-[0.65rem] t-tertiary mt-1">Kasa ve banka bilgilerini girin</p>
        </div>

        {/* Summary grid */}
        <div className="info-box p-3.5 mb-5">
          <div className="grid grid-cols-2 gap-3 text-[0.65rem]">
            <div>
              <span className="t-tertiary">Personel</span>
              <p className="t-primary font-semibold mt-0.5 text-xs">{shift.personnel_name}</p>
            </div>
            <div>
              <span className="t-tertiary">Açılış Kasası</span>
              <p className="font-bold mt-0.5 text-xs" style={{ color: '#818cf8' }}>{fmt(shift.starting_cash)} ₺</p>
            </div>
            <div>
              <span className="t-tertiary">Komisyon</span>
              <p className="font-bold mt-0.5 text-xs" style={{ color: '#34d399' }}>{fmt(shift.total_commission)} ₺</p>
            </div>
            <div>
              <span className="t-tertiary">Masraf</span>
              <p className="font-bold mt-0.5 text-xs" style={{ color: '#fb7185' }}>{fmt(shift.total_expenses)} ₺</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[0.65rem] font-medium t-tertiary mb-1.5 uppercase tracking-wider">Sistem (₺)</label>
            <input type="number" step="0.01" min="0" value={sistem} onChange={(e) => setSistem(e.target.value)} placeholder="Sistemde gözüken kasa" className="input text-lg font-semibold" required autoFocus />
          </div>
          <div>
            <label className="block text-[0.65rem] font-medium t-tertiary mb-1.5 uppercase tracking-wider">Banka (₺)</label>
            <input type="number" step="0.01" min="0" value={banka} onChange={(e) => setBanka(e.target.value)} placeholder="Banka bakiyesi" className="input" />
          </div>

          {/* Live calculated result */}
          {devredilenKasa !== null && (
            <div className="info-box p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[0.6rem] t-tertiary font-medium uppercase tracking-wider">Devredilen Kasa</span>
                <span className="text-[0.55rem] t-tertiary">Sistem − Banka</span>
              </div>
              <p className="text-xl font-bold t-primary tracking-tight tabular-nums">
                {fmt(devredilenKasa)} <span className="text-[0.65rem] t-tertiary font-medium">₺</span>
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={!sistem} className="btn btn-primary flex-1 py-2.5">Hesapla ve Devret</button>
            <button type="button" onClick={onClose} className="btn btn-ghost">İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
