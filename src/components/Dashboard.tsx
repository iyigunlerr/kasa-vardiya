'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Shift } from '@/types';
import StatsCards from './StatsCards';
import TransactionPanel from './TransactionPanel';
import TransactionList from './TransactionList';
import HandoverModal from './HandoverModal';
import ResultModal from './ResultModal';
import NewShiftModal from './NewShiftModal';
import ThemeToggle from './ThemeToggle';

export default function Dashboard() {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showHandover, setShowHandover] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultDeficit, setResultDeficit] = useState(0);
  const [handoverData, setHandoverData] = useState<{ endingCash: number; bankBalance: number } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [showNewShift, setShowNewShift] = useState(false);
  const [devredilenCash, setDevredilenCash] = useState<number | undefined>(undefined);

  const fetchActiveShift = useCallback(async () => {
    const { data, error } = await supabase.from('shifts').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(1).single();
    if (error || !data) { setActiveShift(null); setShowNewShift(true); }
    else { setActiveShift(data); setShowNewShift(false); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchActiveShift(); }, [fetchActiveShift]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    fetchActiveShift();
  }, [fetchActiveShift]);

  const handleCreateShift = async (name: string, cash: number) => {
    const { error } = await supabase.from('shifts').insert({ personnel_name: name, starting_cash: cash, status: 'open' });
    if (error) { alert('Hata: ' + error.message); return; }
    setDevredilenCash(undefined);
    await fetchActiveShift();
  };

  const handleCalculate = (sistemTutar: number, bankBalance: number) => {
    if (!activeShift) return;
    const devredilenKasa = sistemTutar - bankBalance;
    const netKasaAcigi = activeShift.starting_cash - devredilenKasa - activeShift.total_commission;
    setHandoverData({ endingCash: devredilenKasa, bankBalance });
    setResultDeficit(netKasaAcigi);
    setShowHandover(false);
    setShowResult(true);
  };

  const handleConfirmHandover = async () => {
    if (!activeShift || !handoverData) return;
    setConfirming(true);
    try {
      const { error } = await supabase.from('shifts').update({
        status: 'closed', end_time: new Date().toISOString(),
        ending_cash: handoverData.endingCash, bank_balance: handoverData.bankBalance,
        cash_deficit: resultDeficit,
      }).eq('id', activeShift.id);
      if (error) throw error;
      setDevredilenCash(handoverData.endingCash);
      setShowResult(false); setHandoverData(null); setActiveShift(null); setShowNewShift(true);
    } catch (err) { console.error(err); alert('Devir teslim hatası.'); }
    finally { setConfirming(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-7 h-7 border-2 rounded-full mx-auto mb-3" style={{ borderColor: 'rgba(255,255,255,0.06)', borderTopColor: '#818cf8', animation: 'spin 0.8s linear infinite' }} />
          <p className="text-[0.65rem] t-tertiary">Yükleniyor</p>
        </div>
      </div>
    );
  }

  if (showNewShift || !activeShift) {
    return <NewShiftModal onShiftCreated={handleCreateShift} defaultCash={devredilenCash} />;
  }

  const shiftTime = new Date(activeShift.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen">
      {/* ─── Header ─── */}
      <header className="header-bar sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-5 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <span className="text-xs font-bold t-primary tracking-tight hidden sm:block">Kasa Devir Teslim</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Active shift */}
            <div className="hidden md:flex items-center gap-2 pill px-3 py-1.5 text-[0.65rem]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399', animation: 'live 2s ease-in-out infinite' }} />
              <span className="t-secondary">{activeShift.personnel_name}</span>
              <span className="t-tertiary">·</span>
              <span className="t-tertiary tabular-nums">{shiftTime}</span>
            </div>

            <ThemeToggle />

            <a href="/gecmis" className="btn btn-ghost text-[0.65rem] py-1.5 px-2.5 no-underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              </svg>
              Geçmiş
            </a>

            <button onClick={() => setShowHandover(true)} className="btn btn-danger text-[0.65rem] py-1.5 px-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              Devir Teslim
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile bar ─── */}
      <div className="md:hidden mx-4 mt-3">
        <div className="pill flex items-center gap-2 px-3 py-2 text-[0.65rem]">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399', animation: 'live 2s ease-in-out infinite' }} />
          <span className="t-secondary">{activeShift.personnel_name}</span>
          <span className="t-tertiary ml-auto tabular-nums">{shiftTime}</span>
        </div>
      </div>

      {/* ─── Content ─── */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-5 py-5 space-y-5">
        <StatsCards shift={activeShift} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <TransactionPanel shift={activeShift} onTransactionAdded={handleRefresh} />
          </div>
          <div className="lg:col-span-3">
            <TransactionList shiftId={activeShift.id} refreshKey={refreshKey} />
          </div>
        </div>
      </main>

      {showHandover && <HandoverModal shift={activeShift} onClose={() => setShowHandover(false)} onCalculate={handleCalculate} />}
      {showResult && <ResultModal cashDeficit={resultDeficit} onConfirm={handleConfirmHandover} onCancel={() => { setShowResult(false); setHandoverData(null); }} loading={confirming} />}
    </div>
  );
}
