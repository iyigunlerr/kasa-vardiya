"use client";
import { TrendingUp, TrendingDown } from "lucide-react";
import { fmtRate } from "@/lib/format";

const RATES = [
  { code: "USD", buy: 32.45, sell: 32.68, change:  0.42 },
  { code: "EUR", buy: 35.10, sell: 35.38, change: -0.18 },
  { code: "GBP", buy: 41.22, sell: 41.55, change:  0.61 },
  { code: "CHF", buy: 36.80, sell: 37.12, change: -0.09 },
  { code: "SAR", buy:  8.64, sell:  8.71, change:  0.05 },
];

export default function ExchangeRates() {
  return (
    <div className="rounded-2xl border border-border p-5" style={{ background: "var(--surface)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-foreground">Guncel Doviz Kurlari</h2>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">TCMB referans · TL</p>
        </div>
        <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--success)" }} title="Canli" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-4 px-2 pb-1">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground col-span-1">Doviz</span>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground text-right">Alis</span>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground text-right">Satis</span>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground text-right">Degisim</span>
        </div>
        {RATES.map(rate => (
          <div key={rate.code} className="grid grid-cols-4 items-center rounded-xl px-2 py-2.5 transition-colors hover:bg-card/50">
            <div className="flex items-center gap-2 col-span-1">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black" style={{ background: "var(--surface-raised)", color: "var(--muted-foreground)" }}>{rate.code.slice(0, 2)}</span>
              <span className="text-xs font-bold text-foreground">{rate.code}</span>
            </div>
            <span className="text-xs tabular-nums font-medium text-foreground text-right">{fmtRate(rate.buy)}</span>
            <span className="text-xs tabular-nums font-semibold text-foreground text-right">{fmtRate(rate.sell)}</span>
            <div className="flex items-center justify-end gap-1">
              {rate.change >= 0 ? <TrendingUp size={11} style={{ color: "var(--success)" }} /> : <TrendingDown size={11} style={{ color: "var(--danger)" }} />}
              <span className="text-xs tabular-nums font-semibold" style={{ color: rate.change >= 0 ? "var(--success)" : "var(--danger)" }}>{rate.change >= 0 ? "+" : ""}{rate.change.toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
