"use client";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet, Plus } from "lucide-react";
import { fmt } from "@/lib/format";

export interface UITransaction {
  id: string;
  type: "komisyon" | "masraf" | "kar";
  desc: string;
  amount: number;
  time: string;
}

export default function ActivityFeed({
  transactions,
  onAdd,
}: {
  transactions: UITransaction[];
  onAdd: (type: "komisyon" | "masraf" | "kar", amount: number, desc: string) => void;
}) {
  const [mode, setMode] = useState<"komisyon" | "masraf" | "kar" | null>(null);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const totalK = transactions.filter((t) => t.type === "komisyon").reduce((s, t) => s + t.amount, 0);
  const totalM = transactions.filter((t) => t.type === "masraf").reduce((s, t) => s + t.amount, 0);

  function submit() {
    if (!mode || !amount) return;
    if (mode === "masraf" && !desc.trim()) return;
    onAdd(mode, parseFloat(amount.replace(",", ".")) || 0, desc.trim());
    setAmount("");
    setDesc("");
    setMode(null);
  }

  const typeLabel = { komisyon: "Komisyon", masraf: "Gider", kar: "Kar Çekimi" };
  const typeColor = { komisyon: "var(--success)", masraf: "var(--danger)", kar: "var(--warning)" };
  const typeBg = { komisyon: "oklch(0.765 0.177 155.5 / 0.12)", masraf: "oklch(0.63 0.23 25 / 0.12)", kar: "oklch(0.84 0.188 84.4 / 0.10)" };

  return (
    <div className="rounded-2xl border border-border flex flex-col" style={{ background: "var(--surface)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
        <div>
          <h2 className="text-sm font-bold text-foreground">Son İşlemler</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{transactions.length} işlem</p>
        </div>
        <span className="rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums" style={{ background: "oklch(0.765 0.177 155.5 / 0.12)", color: "var(--success)" }}>
          {transactions.length}
        </span>
      </div>

      {/* Quick Action Buttons */}
      <div className="px-3 pt-3 flex gap-2">
        <button onClick={() => setMode(mode === "komisyon" ? null : "komisyon")}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all"
          style={{ background: mode === "komisyon" ? "oklch(0.765 0.177 155.5 / 0.20)" : "var(--surface-raised)", color: mode === "komisyon" ? "var(--success)" : "var(--muted-foreground)", border: `1px solid ${mode === "komisyon" ? "oklch(0.765 0.177 155.5 / 0.30)" : "var(--border)"}` }}>
          <Plus size={12} /> Komisyon
        </button>
        <button onClick={() => setMode(mode === "masraf" ? null : "masraf")}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all"
          style={{ background: mode === "masraf" ? "oklch(0.63 0.23 25 / 0.15)" : "var(--surface-raised)", color: mode === "masraf" ? "var(--danger)" : "var(--muted-foreground)", border: `1px solid ${mode === "masraf" ? "oklch(0.63 0.23 25 / 0.30)" : "var(--border)"}` }}>
          <Plus size={12} /> Gider
        </button>
        <button onClick={() => setMode(mode === "kar" ? null : "kar")}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all"
          style={{ background: mode === "kar" ? "oklch(0.84 0.188 84.4 / 0.15)" : "var(--surface-raised)", color: mode === "kar" ? "var(--warning)" : "var(--muted-foreground)", border: `1px solid ${mode === "kar" ? "oklch(0.84 0.188 84.4 / 0.30)" : "var(--border)"}` }}>
          <Wallet size={12} /> Kar Çek
        </button>
      </div>

      {/* Inline Form */}
      {mode && (
        <div className="mx-3 mt-3 rounded-xl p-4 flex flex-col gap-3 border" style={{ background: "var(--surface-raised)", borderColor: typeColor[mode] + "33" }}>
          <p className="text-xs font-semibold" style={{ color: typeColor[mode] }}>{typeLabel[mode]} Ekle</p>
          <div className="relative">
            <input type="number" min="0" step="0.01" placeholder="Tutar" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
              className="w-full rounded-lg border border-border pl-3 pr-8 py-2 text-sm font-semibold tabular-nums text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 bg-transparent" style={{ background: "var(--surface)" }} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">TL</span>
          </div>
          <input type="text" placeholder={mode === "masraf" ? "Açıklama (zorunlu)" : "Açıklama (opsiyonel)"} value={desc} onChange={(e) => setDesc(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 bg-transparent" style={{ background: "var(--surface)" }} />
          <div className="flex gap-2">
            <button onClick={() => { setMode(null); setAmount(""); setDesc(""); }} className="flex-1 rounded-lg border border-border py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">İptal</button>
            <button onClick={submit} disabled={!amount || (mode === "masraf" && !desc.trim())}
              className="flex-1 rounded-lg py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: typeColor[mode], color: mode === "masraf" ? "var(--danger-foreground)" : mode === "kar" ? "var(--warning-foreground)" : "var(--success-foreground)" }}>
              Ekle
            </button>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-3 py-2" style={{ maxHeight: 280 }}>
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center h-20"><p className="text-xs text-muted-foreground">Henüz işlem yok</p></div>
        ) : (
          transactions.map((tx, i) => (
            <div key={tx.id} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-card/60" style={{ borderBottom: i < transactions.length - 1 ? "1px solid oklch(0.22 0 0 / 0.5)" : "none" }}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: typeBg[tx.type] }}>
                {tx.type === "komisyon" ? <ArrowUpRight size={14} style={{ color: "var(--success)" }} /> : tx.type === "kar" ? <Wallet size={14} style={{ color: "var(--warning)" }} /> : <ArrowDownLeft size={14} style={{ color: "var(--danger)" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{typeLabel[tx.type]}</p>
                {tx.desc && <p className="text-xs text-muted-foreground truncate">{tx.desc}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold tabular-nums" style={{ color: typeColor[tx.type] }}>
                  {tx.type === "komisyon" ? "+" : "-"}{fmt(tx.amount)} TL
                </p>
                <p className="text-xs text-muted-foreground">{tx.time}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Summary */}
      <div className="mx-3 mb-3 mt-2 rounded-xl p-3 flex items-center justify-between shrink-0" style={{ background: "var(--surface-raised)" }}>
        <div>
          <p className="text-xs text-muted-foreground">Komisyon</p>
          <p className="text-sm font-bold tabular-nums" style={{ color: "var(--success)" }}>+{fmt(totalK)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Gider</p>
          <p className="text-sm font-bold tabular-nums" style={{ color: "var(--danger)" }}>-{fmt(totalM)}</p>
        </div>
      </div>
    </div>
  );
}
