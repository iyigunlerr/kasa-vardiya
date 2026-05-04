'use client';

import React, { useState } from 'react';

interface Props { onShiftCreated: (name: string, cash: number) => void; defaultCash?: number; }

export default function NewShiftModal({ onShiftCreated, defaultCash }: Props) {
  const [name, setName] = useState('');
  const [cash, setCash] = useState(defaultCash !== undefined ? String(defaultCash) : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cash) return;
    setLoading(true);
    try { await onShiftCreated(name.trim(), parseFloat(cash)); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold t-primary tracking-tight">Yeni Vardiya</h2>
          <p className="text-[0.65rem] t-tertiary mt-1">Vardiya bilgilerinizi girerek kasayı devralın</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[0.65rem] font-medium t-tertiary mb-1.5 uppercase tracking-wider">Personel Adı</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınızı girin" className="input" required autoFocus />
          </div>
          <div>
            <label className="block text-[0.65rem] font-medium t-tertiary mb-1.5 uppercase tracking-wider">Başlangıç Kasası (₺)</label>
            <input type="number" step="0.01" min="0" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="Kasadaki nakit tutarı" className="input text-lg font-semibold" required />
          </div>
          <button type="submit" disabled={loading || !name.trim() || !cash} className="btn btn-primary w-full py-2.5 mt-1">
            {loading ? 'Başlatılıyor...' : 'Vardiyayı Başlat'}
          </button>
        </form>
      </div>
    </div>
  );
}
