"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { fmt } from "@/lib/format";
import { Shift } from "@/types";
import { ArrowLeft, Clock, TrendingUp, CreditCard, Wallet, User, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth, Profile } from "@/lib/auth-context";

export default function ProfilPage() {
  const supabase = createClient();
  const { user, isAdmin } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: shiftData } = await supabase.from("shifts").select("*").order("created_at", { ascending: false });
    const { data: profileData } = await supabase.from("profiles").select("*").order("full_name", { ascending: true });
    setShifts(shiftData || []);
    setProfiles((profileData as Profile[]) || []);
    setLoading(false);
  }

  async function handleDeleteShift(shiftId: string) {
    if (!confirm("Bu vardiyayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    
    // İşlemleri (transactions) ve ardından vardiyayı sil
    await supabase.from("transactions").delete().eq("shift_id", shiftId);
    await supabase.from("shifts").delete().eq("id", shiftId);
    
    // Verileri yenile
    fetchData();
  }

  // Filter shifts for selected person
  const personShifts = selectedName ? shifts.filter((s) => s.personnel_name === selectedName) : [];
  const closedShifts = personShifts.filter((s) => s.status === "closed");

  // Calculate stats
  const totalHours = closedShifts.reduce((sum, s) => {
    if (!s.end_time) return sum;
    const diff = new Date(s.end_time).getTime() - new Date(s.start_time).getTime();
    return sum + diff / (1000 * 60 * 60);
  }, 0);

  const totalCommission = closedShifts.reduce((s, sh) => s + sh.total_commission, 0);
  const totalExpenses = closedShifts.reduce((s, sh) => s + sh.total_expenses, 0);
  const totalKar = closedShifts.reduce((s, sh) => s + (sh.total_profit_withdrawn ?? 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="spinner mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border px-6 py-3" style={{ background: "oklch(0.12 0 0 / 0.90)", backdropFilter: "blur(12px)" }}>
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors" style={{ background: "var(--surface)" }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-foreground">Çalışan Profilleri</h1>
            <p className="text-xs text-muted-foreground">{profiles.length} personel</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {!selectedName ? (
          /* ── Personnel List ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => {
              const isMe = user?.id === p.id;
              const displayName = p.full_name?.trim() ? p.full_name : "İsimsiz Personel";
              const count = shifts.filter((s) => s.personnel_name === p.full_name).length;
              const isActive = shifts.some((s) => s.personnel_name === p.full_name && s.status === "open");
              
              return (
                <button key={p.id} onClick={() => setSelectedName(p.full_name)}
                  className={`rounded-2xl border p-5 text-left transition-all hover:border-foreground/20 hover:scale-[1.01] flex flex-col gap-3 ${isMe ? 'border-warning/30 bg-warning/5' : 'border-border'}`} style={{ background: isMe ? "var(--surface-raised)" : "var(--surface)" }}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border" style={{ background: isMe ? "var(--warning)" : "var(--surface-raised)", borderColor: "var(--border)", color: isMe ? "var(--background)" : "var(--muted-foreground)" }}>
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
                          {displayName}
                          {isMe && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-warning text-warning-foreground font-bold shrink-0">Sen</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.role === "admin" ? "Yönetici" : "Veznedar"} • {count} vardiya
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-2" style={{ background: "oklch(0.765 0.177 155.5 / 0.15)", color: "var(--success)", border: "1px solid oklch(0.765 0.177 155.5 / 0.3)" }}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
                        AKTİF
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {profiles.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="text-sm text-muted-foreground">Henüz kayıtlı personel yok</p>
              </div>
            )}
          </div>
        ) : (
          /* ── Profile Detail ── */
          <div>
            <button onClick={() => setSelectedName(null)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft size={12} /> Tüm personeller
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border" style={{ background: "var(--surface)" }}>
                <User size={24} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedName}</h2>
                <p className="text-xs text-muted-foreground">{closedShifts.length} tamamlanan vardiya</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <div className="rounded-2xl border border-border p-4" style={{ background: "var(--surface)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Mesai</span>
                </div>
                <p className="text-2xl font-bold tabular-nums text-foreground">{totalHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">saat</p>
              </div>
              <div className="rounded-2xl border border-border p-4" style={{ background: "var(--surface)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} style={{ color: "var(--success)" }} />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Komisyon</span>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--success)" }}>{fmt(totalCommission)}</p>
                <p className="text-xs text-muted-foreground">TL toplam</p>
              </div>
              <div className="rounded-2xl border border-border p-4" style={{ background: "var(--surface)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={14} style={{ color: "var(--danger)" }} />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Gider</span>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--danger)" }}>{fmt(totalExpenses)}</p>
                <p className="text-xs text-muted-foreground">TL toplam</p>
              </div>
              <div className="rounded-2xl border border-border p-4" style={{ background: "var(--surface)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={14} style={{ color: "var(--warning)" }} />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Alınan Kâr</span>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--warning)" }}>{fmt(totalKar)}</p>
                <p className="text-xs text-muted-foreground">TL toplam</p>
              </div>
            </div>

            {/* Shift History */}
            <h3 className="text-sm font-bold text-foreground mb-4">Vardiya Geçmişi</h3>
            <div className="flex flex-col gap-3">
              {personShifts.map((s) => {
                const start = new Date(s.start_time);
                const end = s.end_time ? new Date(s.end_time) : null;
                const hours = end ? ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1) : "—";
                const dateStr = start.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
                const timeStr = start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
                const endTimeStr = end ? end.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "Devam";

                return (
                  <div key={s.id} className="rounded-xl border border-border p-4" style={{ background: "var(--surface)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.status === "open" ? "var(--success)" : "var(--muted-foreground)" }} />
                        <span className="text-xs font-semibold text-foreground">{dateStr}</span>
                        <span className="text-xs text-muted-foreground">{timeStr} → {endTimeStr}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{hours} saat</span>
                        {isAdmin && (
                          <button onClick={() => handleDeleteShift(s.id)} className="text-muted-foreground hover:text-danger transition-colors" title="Vardiyayı Sil">
                            <Trash2 size={14} style={{ color: "var(--danger)" }} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div><p className="text-xs text-muted-foreground">Açılış</p><p className="text-xs font-bold tabular-nums text-foreground">{fmt(s.starting_cash)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Komisyon</p><p className="text-xs font-bold tabular-nums" style={{ color: "var(--success)" }}>{fmt(s.total_commission)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Gider</p><p className="text-xs font-bold tabular-nums" style={{ color: "var(--danger)" }}>{fmt(s.total_expenses)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Açık</p><p className="text-xs font-bold tabular-nums" style={{ color: (s.cash_deficit ?? 0) === 0 ? "var(--success)" : "var(--danger)" }}>{s.cash_deficit === 0 || s.cash_deficit === null ? "Denk" : fmt(s.cash_deficit ?? 0)}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
