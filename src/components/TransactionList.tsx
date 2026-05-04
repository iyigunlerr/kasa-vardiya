'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types';

function fmt(v: number) { return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v); }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); }

export default function TransactionList({ shiftId, refreshKey }: { shiftId: string; refreshKey: number }) {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('transactions').select('*').eq('shift_id', shiftId).order('created_at', { ascending: false });
      setTxs(data || []);
      setLoading(false);
    })();
  }, [shiftId, refreshKey]);

  if (loading) {
    return (
      <div className="card p-5">
        <span className="text-xs font-semibold t-primary mb-4 block">Son İşlemler</span>
        <div className="space-y-2.5">{[1,2,3].map(i => <div key={i} className="shimmer h-12" />)}</div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.1)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            </svg>
          </div>
          <span className="text-xs font-semibold t-primary tracking-tight">Son İşlemler</span>
        </div>
        {txs.length > 0 && (
          <span className="text-[0.6rem] font-bold t-tertiary pill px-2 py-0.5 tabular-nums">{txs.length}</span>
        )}
      </div>

      {txs.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 rounded-xl surface-3 flex items-center justify-center mx-auto mb-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="t-tertiary">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <p className="text-[0.65rem] t-tertiary">Henüz işlem yok</p>
        </div>
      ) : (
        <div className="space-y-0.5 max-h-[360px] overflow-y-auto">
          {txs.map((tx, i) => {
            const isK = tx.type === 'komisyon';
            return (
              <div key={tx.id} className="row-item flex items-center justify-between py-2.5 px-2.5" style={{ animation: `rowIn 0.2s ease-out ${i * 0.03}s both` }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: isK ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isK ? '#34d399' : '#fb7185'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {isK ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></> : <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>}
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={isK ? 'badge badge-green' : 'badge badge-red'}>{isK ? 'Komisyon' : 'Masraf'}</span>
                      <span className="text-[0.6rem] t-tertiary tabular-nums">{fmtTime(tx.created_at)}</span>
                    </div>
                    {tx.description && <p className="text-[0.65rem] t-tertiary truncate max-w-[160px] mt-0.5">{tx.description}</p>}
                  </div>
                </div>
                <span className="text-xs font-bold tabular-nums tracking-tight flex-shrink-0 ml-2" style={{ color: isK ? '#34d399' : '#fb7185' }}>
                  {isK ? '+' : '−'}{fmt(tx.amount)} ₺
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
