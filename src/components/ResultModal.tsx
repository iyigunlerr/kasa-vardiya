'use client';

import React from 'react';

function fmt(v: number) { return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v); }

export default function ResultModal({ cashDeficit, onConfirm, onCancel, loading }: { cashDeficit: number; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  const isOk = cashDeficit === 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel max-w-sm text-center">
        {isOk ? (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(52,211,153,0.08)', border: '2px solid rgba(52,211,153,0.2)', animation: 'modalSlide 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight mb-1" style={{ color: '#34d399' }}>Kasa Denk</h2>
            <p className="text-[0.65rem] t-tertiary mb-6 leading-relaxed">Tüm hesaplar uyuşuyor — işlem tamamlanabilir.</p>
            <button onClick={onConfirm} disabled={loading} className="btn btn-success w-full py-2.5">
              {loading ? 'İşleniyor...' : 'Onayla ve Devret'}
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(251,191,36,0.08)', border: '2px solid rgba(251,191,36,0.2)', animation: 'modalSlide 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight mb-3" style={{ color: '#fbbf24' }}>Uyuşmazlık</h2>
            <div className="info-box p-4 mb-4">
              <p className="text-[0.55rem] t-tertiary uppercase tracking-[0.1em] font-semibold mb-1.5">Tespit Edilen Açık</p>
              <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: '#fb7185' }}>{fmt(cashDeficit)} ₺</p>
            </div>
            <p className="text-[0.65rem] t-secondary mb-5 leading-relaxed">
              Kasada <span className="font-semibold" style={{ color: '#fb7185' }}>{fmt(Math.abs(cashDeficit))} TL</span> açık tespit edildi. Devir teslimi onaylıyor musunuz?
            </p>
            <div className="flex gap-2">
              <button onClick={onConfirm} disabled={loading} className="btn btn-danger flex-1 py-2.5">
                {loading ? 'İşleniyor...' : 'Onayla'}
              </button>
              <button onClick={onCancel} disabled={loading} className="btn btn-ghost flex-1">İptal</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
