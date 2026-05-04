"use client";
import { Wallet, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { fmt } from "@/lib/format";

interface GlobalTx {
  id: string;
  amount: number;
  created_at: string;
  description: string;
}

interface ProfitCardProps {
  globalKar: number;
  globalKomisyon: number;
  globalKarTxs: GlobalTx[];
  globalKomisyonTxs: GlobalTx[];
}

export default function ProfitCard({ globalKar, globalKomisyon, globalKarTxs, globalKomisyonTxs }: ProfitCardProps) {
  const icerdekiKar = globalKomisyon - globalKar;

  // Chart Data Preparation (Last 7 days or transactions)
  // We'll create a simple timeline chart from the transactions
  const allTxs = [...globalKarTxs, ...globalKomisyonTxs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const recentTxs = allTxs.slice(-15); // Get last 15 actions for the chart
  const maxVal = Math.max(...recentTxs.map(t => t.amount), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* LEFT COLUMN: Stacked Cards */}
      <div className="flex flex-col gap-4 lg:col-span-1">
        {/* 1) İÇERDEKİ KÂR KARTI */}
        <div className="rounded-2xl border border-border p-5 flex flex-col gap-4 relative overflow-hidden group flex-1" style={{ background: "var(--surface)" }}>
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: "var(--success)" }} />
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-sm font-bold text-foreground">İçerdeki Kâr</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Havuzda biriken</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: "oklch(0.765 0.177 155.5 / 0.10)" }}>
              <ArrowDownToLine size={15} style={{ color: "var(--success)" }} />
            </div>
          </div>

          <div className="flex items-baseline gap-2 relative z-10 mt-2">
            <span className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: "var(--success)" }}>{fmt(icerdekiKar)}</span>
            <span className="text-sm font-medium text-muted-foreground">TL</span>
          </div>
        </div>

        {/* 2) ALINAN KÂR KARTI */}
        <div className="rounded-2xl border border-border p-5 flex flex-col gap-4 relative overflow-hidden group flex-1" style={{ background: "var(--surface)" }}>
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: "var(--warning)" }} />
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-sm font-bold text-foreground">Alınan Kâr</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Çekilen toplam kâr</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: "oklch(0.84 0.188 84.4 / 0.10)" }}>
              <ArrowUpFromLine size={15} style={{ color: "var(--warning)" }} />
            </div>
          </div>

          <div className="flex items-baseline gap-2 relative z-10 mt-2">
            <span className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: "var(--warning)" }}>{fmt(globalKar)}</span>
            <span className="text-sm font-medium text-muted-foreground">TL</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Chart & History */}
      <div className="rounded-2xl border border-border p-5 flex flex-col gap-5 lg:col-span-2" style={{ background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Kâr ve Komisyon Grafiği</h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--success)" }} />Komisyon</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--warning)" }} />Çekilen</span>
          </div>
        </div>

        {/* Dynamic SVG Bar Chart */}
        <div className="h-32 flex items-end gap-1.5 mt-2">
          {recentTxs.length > 0 ? recentTxs.map((tx, i) => {
            const isKomisyon = globalKomisyonTxs.some(k => k.id === tx.id);
            const pct = Math.max((tx.amount / maxVal) * 100, 5);
            return (
              <div key={tx.id + i} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                <div 
                  className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer" 
                  style={{ height: `${pct}%`, background: isKomisyon ? "var(--success)" : "var(--warning)" }} 
                />
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 font-bold tabular-nums shadow-lg">
                  {fmt(tx.amount)} TL
                </div>
              </div>
            );
          }) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              Veri bulunamadı
            </div>
          )}
        </div>

        {/* History List */}
        <div className="mt-2 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 border-b border-border pb-2">Son İşlemler</p>
          <div className="flex flex-col gap-2">
            {[...allTxs].reverse().slice(0, 3).map((tx) => {
              const isKomisyon = globalKomisyonTxs.some(k => k.id === tx.id);
              return (
                <div key={tx.id} className="flex items-center justify-between py-1.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: isKomisyon ? "var(--success)" : "var(--warning)" }} />
                      {tx.description || (isKomisyon ? "Komisyon Eklendi" : "Kâr Çekildi")}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-3.5">{new Date(tx.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <span className="text-xs font-bold tabular-nums" style={{ color: isKomisyon ? "var(--success)" : "var(--warning)" }}>
                    {isKomisyon ? "+" : "-"}{fmt(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
