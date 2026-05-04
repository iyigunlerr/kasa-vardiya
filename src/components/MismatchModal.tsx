"use client";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import { fmt } from "@/lib/format";

export default function MismatchModal({ diff, expected, entered, isAdmin, onClose, onConfirmWithDeficit }: {
  diff: number; expected: number; entered: number; isAdmin: boolean; onClose: () => void; onConfirmWithDeficit: () => void;
}) {
  const isOver = diff > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "oklch(0.63 0.23 25 / 0.6)", boxShadow: "0 0 40px oklch(0.63 0.23 25 / 0.25)" }}>
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: "var(--danger)" }} />
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"><X size={16} /></button>
        <div className="flex items-start gap-4 mt-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: "oklch(0.63 0.23 25 / 0.15)" }}>
            <AlertTriangle size={20} style={{ color: "var(--danger)" }} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base text-balance">Kasa Uyusmazligi Tespit Edildi</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">Girilen degerler ile sistem kaydi arasinda fark bulunmaktadir.</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl p-4 grid grid-cols-3 gap-4" style={{ background: "oklch(0.63 0.23 25 / 0.08)" }}>
          <div><p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Beklenen</p><p className="text-base font-bold tabular-nums leading-relaxed" style={{ color: "var(--success)" }}>{fmt(expected)}<span className="text-xs font-medium ml-1 text-muted-foreground">TL</span></p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Devredilen</p><p className="text-base font-bold tabular-nums text-foreground leading-relaxed">{fmt(entered)}<span className="text-xs font-medium ml-1 text-muted-foreground">TL</span></p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Fark</p><p className="text-base font-bold tabular-nums leading-relaxed" style={{ color: "var(--danger)" }}>{isOver ? "+" : ""}{fmt(diff)}<span className="text-xs font-medium ml-1 text-muted-foreground">TL</span></p></div>
        </div>
        <div className="mt-3 rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ background: "oklch(0.63 0.23 25 / 0.06)" }}>
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--danger)" }} />
          <p className="text-xs text-muted-foreground leading-relaxed">{isOver ? "Kasada fazla para var. Kaynagi tespit edilmeli." : "Kasada eksik para var. Acik olarak kaydedilecek."}</p>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">Tekrar Gir</button>
          {isAdmin ? (
            <button onClick={onConfirmWithDeficit} className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "var(--danger)", color: "var(--danger-foreground)" }}>
              <ShieldAlert size={16} /> Onayla (Admin)
            </button>
          ) : (
            <div className="flex-1 rounded-xl py-2.5 text-xs font-medium text-center flex items-center justify-center border" style={{ background: "var(--surface-raised)", borderColor: "var(--border)", color: "var(--danger)" }}>
              Yönetici Onayı Gerekli
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
