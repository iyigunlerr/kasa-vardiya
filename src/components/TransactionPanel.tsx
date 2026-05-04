'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shift } from '@/types';

interface Props { shift: Shift; onTransactionAdded: () => void; }

export default function TransactionPanel({ shift, onTransactionAdded }: Props) {
  const [mode, setMode] = useState<'komisyon' | 'masraf' | null>(null);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mode || !amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    try {
      const val = parseFloat(amount);
      const { error: t } = await supabase.from('transactions').insert({ shift_id: shift.id, type: mode, amount: val, description: desc || null });
      if (t) throw t;
      const field = mode === 'komisyon' ? 'total_commission' : 'total_expenses';
      const cur = mode === 'komisyon' ? shift.total_commission : shift.total_expenses;
      const { error: s } = await supabase.from('shifts').update({ [field]: cur + val }).eq('id', shift.id);
      if (s) throw s;
      setAmount(''); setDesc(''); setMode(null);
      onTransactionAdded();
    } catch { alert('İşlem eklenirken hata oluştu.'); }
    finally { setSaving(false); }
  };

  const isKomisyon = mode === 'komisyon';

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <span className="text-xs font-semibold t-primary tracking-tight">İşlem Ekle</span>
      </div>

      {!mode ? (
        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={() => setMode('komisyon')} className="action-card flex flex-col items-center gap-3 p-5 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.08)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <span className="text-xs font-semibold" style={{ color: '#34d399' }}>Komisyon</span>
          </button>
          <button onClick={() => setMode('masraf')} className="action-card flex flex-col items-center gap-3 p-5 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251,113,133,0.08)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
              </svg>
            </div>
            <span className="text-xs font-semibold" style={{ color: '#fb7185' }}>Masraf</span>
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3.5">
          <div className="pill inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] font-bold" style={{ color: isKomisyon ? '#34d399' : '#fb7185' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: isKomisyon ? '#34d399' : '#fb7185' }} />
            {isKomisyon ? 'Komisyon' : 'Masraf'} Ekleniyor
          </div>
          <div>
            <label className="block text-[0.65rem] font-medium t-tertiary mb-1.5 uppercase tracking-wider">Tutar (₺)</label>
            <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="input text-lg font-semibold" required autoFocus />
          </div>
          <div>
            <label className="block text-[0.65rem] font-medium t-tertiary mb-1.5 uppercase tracking-wider">Açıklama</label>
            <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="İşlem açıklaması..." className="input" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving || !amount} className={`btn flex-1 ${isKomisyon ? 'btn-success' : 'btn-danger'}`}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button type="button" onClick={() => { setMode(null); setAmount(''); setDesc(''); }} className="btn btn-ghost">İptal</button>
          </div>
        </form>
      )}
    </div>
  );
}
