"use client";
import { useEffect, useState } from "react";
import { Clock, LogOut, ShieldCheck, Timer, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function DashboardHeader({ userName, userId, shift, shiftStart }: { userName: string; userId: string; shift: string; shiftStart: string }) {
  const [now, setNow] = useState(new Date());
  const { profile, isAdmin, signOut } = useAuth();
  
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i); }, []);
  const dateStr = now.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const elapsed = shiftStart ? now.getTime() - new Date(shiftStart).getTime() : 0;

  // Use profile data if available, fallback to props
  const displayUserName = profile?.full_name || userName;
  const displayRole = isAdmin ? "Yönetici" : "Veznedar";

  return (
    <header className="sticky top-0 z-40 border-b border-border px-6 py-3" style={{ background: "oklch(0.12 0 0 / 0.90)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "oklch(0.765 0.177 155.5 / 0.15)" }}>
            <ShieldCheck size={18} style={{ color: "var(--success)" }} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">Finance Mutabakat</h1>
            <p className="text-xs text-muted-foreground">v4.2.1 · Güvenli Oturum</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock size={12} /><span>{dateStr}</span></div>
          {shift && shiftStart && (
            <>
              <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium shrink-0" style={{ background: "oklch(0.765 0.177 155.5 / 0.12)", color: "var(--success)" }}>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />{shift} · {timeStr}
              </div>
              <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold tabular-nums shrink-0" style={{ background: "oklch(0.84 0.188 84.4 / 0.10)", color: "var(--warning)" }}>
                <Timer size={12} />{formatElapsed(elapsed)}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isAdmin && (
            <Link href="/admin" className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all hover:opacity-90" style={{ background: "var(--danger)", color: "var(--danger-foreground)" }}>
              <ShieldCheck size={14} /> Yönetici Paneli
            </Link>
          )}
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-foreground">{displayUserName}</p>
            <p className="text-xs text-muted-foreground">{displayRole} {userId}</p>
          </div>
          <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors" style={{ background: "var(--surface)" }} title="Profil">
            <User size={16} />
          </Link>
          <button onClick={signOut} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors" style={{ background: "var(--surface)" }} title="Çıkış Yap">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
