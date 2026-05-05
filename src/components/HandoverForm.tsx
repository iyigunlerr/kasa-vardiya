"use client";
import { Banknote, Building2, CheckCircle2, ChevronRight, RefreshCw, RotateCcw, ShieldCheck } from "lucide-react";
import { fmt } from "@/lib/format";

export default function HandoverForm({ cash, bank, openingCash, totalCommission, totalKar, totalExpenses, status, onCashChange, onBankChange, onCalculate, onReset }: {
  cash: string; bank: string; openingCash: number; totalCommission: number; totalKar: number; totalExpenses: number; status: "idle" | "success";
  onCashChange: (v: string) => void; onBankChange: (v: string) => void; onCalculate: () => void; onReset: () => void;
}) {
  const parsedSistem = parseFloat(cash.replace(",", ".")) || 0;
  const parsedBanka = parseFloat(bank.replace(",", ".")) || 0;
  const devredilen = parsedSistem - parsedBanka;
  const hasInput = cash !== "" || bank !== "";

  // Beklenen = Açılış - Komisyon + Gider + Alınan Kar
  const beklenen = openingCash - totalCommission + totalKar + totalExpenses;
  const liveFark = hasInput ? beklenen - devredilen : null;
  const liveMatch = liveFark !== null && Math.abs(liveFark) <= 0.01;

  return (
    <div className="lg:col-span-2 rounded-2xl border border-border p-6" style={{ background: "var(--surface)" }}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Devir Teslim Formu</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Vardiya kapanışı için kasa verilerini girin</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium" style={status === "success" ? { background: "oklch(0.765 0.177 155.5 / 0.12)", color: "var(--success)" } : { background: "oklch(0.84 0.188 84.4 / 0.10)", color: "var(--warning)" }}>
          {status === "success" ? <><CheckCircle2 size={12} /> Onaylandı</> : <><RefreshCw size={12} /> Beklemede</>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label htmlFor="cash-input" className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Sistem</label>
          <div className="relative">
            <Banknote size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input id="cash-input" type="number" min="0" step="0.01" placeholder="0.00" value={cash} onChange={(e) => onCashChange(e.target.value)}
              className="w-full rounded-xl border border-border pl-9 pr-10 py-3 text-lg font-semibold tabular-nums text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all" style={{ background: "var(--surface-raised)" }} />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">TL</span>
          </div>
        </div>
        <div>
          <label htmlFor="bank-input" className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Banka</label>
          <div className="relative">
            <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input id="bank-input" type="number" min="0" step="0.01" placeholder="0.00" value={bank} onChange={(e) => onBankChange(e.target.value)}
              className="w-full rounded-xl border border-border pl-9 pr-10 py-3 text-lg font-semibold tabular-nums text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all" style={{ background: "var(--surface-raised)" }} />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">TL</span>
          </div>
        </div>
      </div>

      {hasInput && (
        <div className="mb-5 rounded-xl p-4 grid grid-cols-4 gap-3 text-center" style={{ background: liveMatch ? "oklch(0.765 0.177 155.5 / 0.07)" : "oklch(0.84 0.188 84.4 / 0.06)", border: `1px solid ${liveMatch ? "oklch(0.765 0.177 155.5 / 0.20)" : "oklch(0.84 0.188 84.4 / 0.18)"}` }}>
          <div><p className="text-xs text-muted-foreground mb-1">Sistem</p><p className="text-sm font-bold tabular-nums text-foreground">{fmt(parsedSistem)}</p></div>
          <div><p className="text-xs text-muted-foreground mb-1">Banka</p><p className="text-sm font-bold tabular-nums text-foreground">{fmt(parsedBanka)}</p></div>
          <div><p className="text-xs text-muted-foreground mb-1">Devredilen</p><p className="text-sm font-bold tabular-nums" style={{ color: "var(--success)" }}>{fmt(devredilen)}</p></div>
          <div><p className="text-xs text-muted-foreground mb-1">Fark</p><p className="text-sm font-bold tabular-nums" style={{ color: liveMatch ? "var(--success)" : (liveFark ?? 0) > 0 ? "var(--success)" : "var(--danger)" }}>{liveMatch ? "Denk" : `${(liveFark ?? 0) > 0 ? "+" : ""}${fmt(liveFark ?? 0)}`}</p></div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--surface-raised)" }}>
        <span className="text-xs text-muted-foreground">Beklenen Kasa (Açılış − Komisyon − Kar)</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: "var(--success)" }}>{fmt(beklenen)} TL</span>
      </div>

      <div className="flex gap-3">
        {status === "success" && (
          <button onClick={onReset} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors" style={{ background: "var(--surface-raised)" }} title="Sıfırla"><RotateCcw size={16} /></button>
        )}
        <button onClick={onCalculate} disabled={!hasInput} className="flex-1 rounded-xl py-4 text-sm font-bold tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: status === "success" ? "var(--success)" : "linear-gradient(135deg, oklch(0.765 0.177 155.5), oklch(0.68 0.18 170))", color: status === "success" ? "var(--success-foreground)" : "oklch(0.10 0 0)", boxShadow: status !== "success" ? "0 0 24px oklch(0.765 0.177 155.5 / 0.28)" : "none" }}>
          {status === "success" ? <><CheckCircle2 size={17} /> Kasa Denk — Devir Teslim Onaylandı</> : <><ShieldCheck size={17} /> Hesapla ve Devret <ChevronRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}
