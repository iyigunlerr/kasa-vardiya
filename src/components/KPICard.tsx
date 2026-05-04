"use client";
import React from "react";
import { fmt } from "@/lib/format";

const KPI_VARIANT_STYLES = {
  default: { iconBg: "oklch(0.84 0.188 84.4 / 0.10)", iconColor: "var(--warning)", valueColor: "var(--foreground)", glowColor: "var(--warning)" },
  success: { iconBg: "oklch(0.765 0.177 155.5 / 0.12)", iconColor: "var(--success)", valueColor: "var(--success)", glowColor: "var(--success)" },
  danger:  { iconBg: "oklch(0.63 0.23 25 / 0.12)", iconColor: "var(--danger)", valueColor: "var(--danger)", glowColor: "var(--danger)" },
  warning: { iconBg: "oklch(0.84 0.188 84.4 / 0.10)", iconColor: "var(--warning)", valueColor: "var(--warning)", glowColor: "var(--warning)" },
} as const;

export default function KPICard({ icon: Icon, label, value, unit = "TL", variant = "default", sub, delta }: {
  icon: React.ElementType; label: string; value: number; unit?: string; variant?: keyof typeof KPI_VARIANT_STYLES; sub?: string; delta?: number;
}) {
  const s = KPI_VARIANT_STYLES[variant];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border p-5 flex flex-col gap-3" style={{ background: "var(--surface)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground leading-relaxed">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0" style={{ background: s.iconBg }}><Icon size={15} style={{ color: s.iconColor }} /></span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: s.valueColor }}>{fmt(value)}</span>
        <span className="text-sm font-medium text-muted-foreground">{unit}</span>
      </div>
      <div className="flex items-center justify-between">
        {sub && <p className="text-xs text-muted-foreground leading-relaxed">{sub}</p>}
        {delta !== undefined && <span className="text-xs font-semibold tabular-nums ml-auto" style={{ color: delta >= 0 ? "var(--success)" : "var(--danger)" }}>{delta >= 0 ? "+" : ""}{delta.toFixed(1)}%</span>}
      </div>
      <div className="pointer-events-none absolute -bottom-4 -right-4 h-16 w-16 rounded-full opacity-10" style={{ background: s.glowColor, filter: "blur(16px)" }} />
    </div>
  );
}
