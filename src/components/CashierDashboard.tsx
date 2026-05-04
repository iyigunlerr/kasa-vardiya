"use client";

import { useEffect, useState, useCallback } from "react";
import { Banknote, TrendingUp, CreditCard, Wallet, AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { fmt } from "@/lib/format";
import { Shift, Transaction as DBTransaction } from "@/types";
import DashboardHeader from "./DashboardHeader";
import KPICard from "./KPICard";
import HandoverForm from "./HandoverForm";
import ActivityFeed, { UITransaction } from "./ActivityFeed";
import MismatchModal from "./MismatchModal";
import ProfitChart, { MonthlyChartData } from "./dashboard/ProfitChart";

function mapDbTxToUI(tx: DBTransaction): UITransaction {
  return {
    id: tx.id,
    type: tx.type,
    desc: tx.description || "",
    amount: tx.amount,
    time: new Date(tx.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── New Shift Overlay ───
function NewShiftOverlay({ defaultCash, onCreated, profileName }: { defaultCash?: number; onCreated: (name: string, cash: number) => void; profileName?: string }) {
  const [name, setName] = useState(profileName || "");
  const [cash, setCash] = useState(defaultCash !== undefined ? String(defaultCash) : "");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cash) return;
    setSaving(true);
    await onCreated(name.trim(), parseFloat(cash));
    setSaving(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-overlay-bg" />
      <div className="new-shift-panel">
        <div className="text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl mx-auto mb-4" style={{ background: "oklch(0.765 0.177 155.5 / 0.12)", border: "1px solid oklch(0.765 0.177 155.5 / 0.18)" }}>
            <Clock size={20} style={{ color: "var(--success)" }} />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Yeni Vardiya</h2>
          <p className="text-xs text-muted-foreground mt-1">Vardiya bilgilerinizi girerek kasayı devralın</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Personel Adı</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınızı girin" className="new-shift-input" required autoFocus={!profileName} readOnly={!!profileName} style={{ opacity: profileName ? 0.7 : 1 }} />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Başlangıç Kasası (TL)</label>
            <input type="number" step="0.01" min="0" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="Kasadaki nakit tutarı" className="new-shift-input text-lg font-semibold" required autoFocus={!!profileName} />
          </div>
          <button type="submit" disabled={saving || !name.trim() || !cash} className="new-shift-btn mt-1">
            {saving ? "Başlatılıyor..." : "Vardiyayı Başlat"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───
import { useAuth } from "@/lib/auth-context";

export default function CashierDashboard() {
  const supabase = createClient();
  const { profile, isAdmin, loading: authLoading } = useAuth();
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [transactions, setTransactions] = useState<UITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewShift, setShowNewShift] = useState(false);
  const [devredilenCash, setDevredilenCash] = useState<number | undefined>(undefined);
  const [prevCommission, setPrevCommission] = useState(0);

  // Global Stats
  const [globalKar, setGlobalKar] = useState(0);
  const [globalKomisyon, setGlobalKomisyon] = useState(0);
  const [globalKarTxs, setGlobalKarTxs] = useState<any[]>([]);
  const [globalKomisyonTxs, setGlobalKomisyonTxs] = useState<any[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyChartData[]>([]);
  const [elapsed, setElapsed] = useState("");

  // Handover
  const [cash, setCash] = useState("");
  const [bank, setBank] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mismatchDiff, setMismatchDiff] = useState(0);
  const [devredilenTotal, setDevredilenTotal] = useState(0);
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const fetchShift = useCallback(async () => {
    const { data: shift } = await supabase.from("shifts").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(1).single();
    if (!shift) { setActiveShift(null); setShowNewShift(true); setLoading(false); return; }
    setActiveShift(shift);
    setShowNewShift(false);
    const { data: txs } = await supabase.from("transactions").select("*").eq("shift_id", shift.id).order("created_at", { ascending: false });
    setTransactions((txs || []).map(mapDbTxToUI));
    // Fetch previous closed shift's commission
    const { data: prevShift } = await supabase.from("shifts").select("total_commission").eq("status", "closed").order("created_at", { ascending: false }).limit(1).single();
    setPrevCommission(prevShift?.total_commission ?? 0);
    
    fetchGlobalStats();
    setLoading(false);
  }, []);

  async function fetchGlobalStats() {
    const { data: karData } = await supabase.from("transactions").select("id, amount, created_at, description, type").eq("type", "kar").order("created_at", { ascending: false });
    const { data: komData } = await supabase.from("transactions").select("id, amount, created_at, description, type").eq("type", "komisyon").order("created_at", { ascending: false });
    
    const totKar = (karData || []).reduce((sum, tx) => sum + tx.amount, 0);
    const totKom = (komData || []).reduce((sum, tx) => sum + tx.amount, 0);
    
    setGlobalKar(totKar);
    setGlobalKomisyon(totKom);
    setGlobalKarTxs(karData || []);
    setGlobalKomisyonTxs(komData || []);

    const allTxs = [...(karData || []), ...(komData || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    const trMonths = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const monthlyChanges = new Map<string, { kom: number, kar: number }>();
    
    allTxs.forEach(tx => {
       const d = new Date(tx.created_at);
       const monthStr = trMonths[d.getMonth()];
       const yearStr = d.getFullYear().toString().slice(-2);
       const key = `${monthStr} '${yearStr}`;
       
       if (!monthlyChanges.has(key)) monthlyChanges.set(key, { kom: 0, kar: 0 });
       if (tx.type === "kar") {
         monthlyChanges.get(key)!.kar += tx.amount;
       } else {
         monthlyChanges.get(key)!.kom += tx.amount;
       }
    });
    
    const chartData: MonthlyChartData[] = [];
    let currentKom = 0;
    let currentKar = 0;
    
    monthlyChanges.forEach((vals, key) => {
       currentKom += vals.kom;
       currentKar += vals.kar;
       chartData.push({
         ay: key,
         icerideKar: currentKom - currentKar,
         alinanKar: currentKar
       });
    });
    
    if (chartData.length === 1) {
       chartData.unshift({ ay: "Önceki", icerideKar: 0, alinanKar: 0 });
    }
    
    setMonthlyChartData(chartData);
  }

  useEffect(() => { fetchShift(); }, [fetchShift]);

  // Live Elapsed Time Timer
  useEffect(() => {
    if (!activeShift) return;
    const updateElapsed = () => {
      const start = new Date(activeShift.start_time).getTime();
      const end = activeShift.end_time ? new Date(activeShift.end_time).getTime() : new Date().getTime();
      const diffMs = end - start;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs / (1000 * 60)) % 60);
      setElapsed(hours > 0 ? `${hours}s ${mins}d` : `${mins}dk`);
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);
    return () => clearInterval(interval);
  }, [activeShift]);

  const handleCreateShift = async (name: string, cashAmount: number) => {
    const { error } = await supabase.from("shifts").insert({ personnel_name: name, starting_cash: cashAmount, status: "open" });
    if (error) { alert("Hata: " + error.message); return; }
    setDevredilenCash(undefined);
    setCash(""); setBank(""); setStatus("idle");
    await fetchShift();
  };

  // Add transaction
  const handleAddTransaction = async (type: "komisyon" | "masraf" | "kar", amount: number, desc: string) => {
    if (!activeShift) return;
    const absAmount = Math.abs(amount);

    if (type === "kar") {
      const icerdekiKar = globalKomisyon - globalKar;
      if (absAmount > icerdekiKar) {
        alert(`Hata: Çekmek istediğiniz tutar (${fmt(absAmount)} TL), içerdeki kârdan (${fmt(icerdekiKar)} TL) fazla olamaz!`);
        return;
      }
    }

    const { error: txErr } = await supabase.from("transactions").insert({
      shift_id: activeShift.id, type, amount: absAmount, description: desc,
    });
    if (txErr) { alert("İşlem hatası: " + txErr.message); return; }

    // Update shift totals
    if (type === "komisyon") {
      await supabase.from("shifts").update({ total_commission: activeShift.total_commission + absAmount }).eq("id", activeShift.id);
    } else if (type === "masraf") {
      await supabase.from("shifts").update({ total_expenses: activeShift.total_expenses + absAmount }).eq("id", activeShift.id);
    } else if (type === "kar") {
      const curKar = activeShift.total_profit_withdrawn ?? 0;
      await supabase.from("shifts").update({ total_profit_withdrawn: curKar + absAmount }).eq("id", activeShift.id);
    }

    setStatus("idle");
    await fetchShift();
  };

  // ── HESAPLAMA ──
  // Fark = (Açılış - Devredilen) - Komisyon - Alınan Kar
  // Pozitif = artı, Negatif = zarar, 0 = denk
  function handleCalculate() {
    if (!activeShift) return;
    const parsedSistem = parseFloat(cash.replace(",", ".")) || 0;
    const parsedBanka = parseFloat(bank.replace(",", ".")) || 0;
    const devredilen = parsedSistem - parsedBanka;
    const totalKar = activeShift.total_profit_withdrawn ?? 0;
    const fark = (activeShift.starting_cash - devredilen) - activeShift.total_commission - totalKar;
    setDevredilenTotal(devredilen);

    if (Math.abs(fark) > 0.01) {
      setMismatchDiff(fark);
      setShowModal(true);
      setStatus("idle");
    } else {
      performHandover(devredilen, parsedBanka, 0);
    }
  }

  async function performHandover(devredilen: number, bankaBakiye: number, deficit: number) {
    if (!activeShift) return;
    const { error } = await supabase.from("shifts").update({
      status: "closed", end_time: new Date().toISOString(),
      ending_cash: devredilen, bank_balance: bankaBakiye, cash_deficit: deficit,
    }).eq("id", activeShift.id);
    if (error) { alert("Devir teslim hatası."); return; }
    setStatus("success");
    setDevredilenCash(devredilen);
    setTimeout(() => {
      setShowModal(false);
      setActiveShift(null);
      setShowNewShift(true);
      setCash(""); setBank(""); setStatus("idle");
    }, 2000);
  }

  function handleReset() { setCash(""); setBank(""); setStatus("idle"); }

  // Derived
  const totalCommission = activeShift?.total_commission ?? 0;
  const totalExpenses = activeShift?.total_expenses ?? 0;
  const totalKar = activeShift?.total_profit_withdrawn ?? 0;
  const openingCash = activeShift?.starting_cash ?? 0;
  const beklenenKasa = openingCash - totalCommission - totalKar;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center"><div className="spinner mx-auto mb-3" /><p className="text-xs text-muted-foreground">Yükleniyor</p></div>
      </div>
    );
  }

  if (showNewShift || !activeShift) {
    return (
      <div className="min-h-screen" style={{ background: "var(--background)" }}>
        <NewShiftOverlay defaultCash={devredilenCash} onCreated={handleCreateShift} profileName={profile?.full_name} />
      </div>
    );
  }

  const shiftLabel = `${activeShift.personnel_name} Vardiyası`;

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>
      <DashboardHeader userName={activeShift.personnel_name} userId={`#${activeShift.id.slice(0, 4).toUpperCase()}`} shift={shiftLabel} shiftStart={activeShift.start_time} />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 md:px-6">
        {/* KPI Row */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5 mb-5">
          <KPICard icon={Banknote} label="Açılış Kasası" value={openingCash} sub="Güne başlanan nakit" variant="default" />
          <KPICard icon={TrendingUp} label="Devralınan Kom." value={prevCommission} sub="Önceki vardiyadan" variant="warning" />
          <KPICard icon={TrendingUp} label="Komisyon" value={totalCommission} sub="Bu vardiya" variant="success" delta={totalCommission > 0 ? 2.4 : 0} />
          <KPICard icon={CreditCard} label="Gider" value={totalExpenses} sub="Gün içi masraf" variant="danger" delta={totalExpenses > 0 ? -1.2 : 0} />
          <KPICard icon={Wallet} label="Beklenen Kasa" value={beklenenKasa} sub="Açılış − Komisyon − Kâr" variant="success" />
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-4">
          <HandoverForm cash={cash} bank={bank} openingCash={openingCash} totalCommission={totalCommission} totalKar={totalKar} status={status}
            onCashChange={(v) => { setCash(v); setStatus("idle"); }} onBankChange={(v) => { setBank(v); setStatus("idle"); }}
            onCalculate={handleCalculate} onReset={handleReset} />
          <ActivityFeed transactions={transactions} onAdd={handleAddTransaction} />
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <ProfitChart monthlyData={monthlyChartData} />
        </div>
        
        {/* Bottom row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 sm:col-span-2">

            <div className="rounded-2xl border border-border p-4 flex items-start gap-3 flex-1" style={{ background: "var(--surface)" }}>
              <Clock size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div className="w-full">
                <p className="text-xs font-semibold text-foreground">Vardiya Özeti</p>
                <p className="text-xs text-muted-foreground mt-0.5">{transactions.length} işlem · {new Date(activeShift.start_time).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}'den beri · Süre: <span className="font-semibold text-foreground">{elapsed}</span></p>
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Komisyon</span><span className="text-xs font-bold tabular-nums" style={{ color: "var(--success)" }}>{fmt(totalCommission)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Gider</span><span className="text-xs font-bold tabular-nums" style={{ color: "var(--danger)" }}>-{fmt(totalExpenses)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Alınan Kâr</span><span className="text-xs font-bold tabular-nums" style={{ color: "var(--warning)" }}>{fmt(totalKar)}</span></div>
                  <div className="mt-1 pt-2 flex justify-between border-t" style={{ borderColor: "var(--border)" }}>
                    <span className="text-xs font-semibold text-foreground">Beklenen Kasa</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: "var(--success)" }}>{fmt(beklenenKasa)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <MismatchModal diff={mismatchDiff} expected={beklenenKasa} entered={devredilenTotal}
          isAdmin={isAdmin}
          onClose={() => setShowModal(false)}
          onConfirmWithDeficit={() => {
            const parsedBanka = parseFloat(bank.replace(",", ".")) || 0;
            performHandover(devredilenTotal, parsedBanka, mismatchDiff);
          }} />
      )}
    </div>
  );
}
