"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, ShieldCheck, User, Users } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { useAuth, Profile, UserRole } from "@/lib/auth-context";

export default function AdminPage() {
  const supabase = createClient();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    } else if (isAdmin) {
      fetchProfiles();
    }
  }, [authLoading, isAdmin, router]);

  async function fetchProfiles() {
    setLoading(true);
    const { data: profilesData } = await supabase.from("profiles").select("*").order("role", { ascending: true }).order("full_name", { ascending: true });
    const { data: activeShifts } = await supabase.from("shifts").select("personnel_name").eq("status", "open");
    setProfiles(profilesData || []);
    setActiveUsers((activeShifts || []).map((s) => s.personnel_name));
    setLoading(false);
  }

  async function updateRole(id: string, currentRole: UserRole, newRole: UserRole) {
    if (currentRole === newRole) return;
    
    // Prevent removing the last admin (optional safety check)
    if (currentRole === "admin" && newRole === "cashier") {
      const adminCount = profiles.filter(p => p.role === "admin").length;
      if (adminCount <= 1) {
        alert("Sistemde en az bir yönetici bulunmalıdır!");
        return;
      }
      if (!confirm("Bu kullanıcının yönetici yetkisini almak istediğinize emin misiniz?")) return;
    }

    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    if (error) {
      alert("Hata: " + error.message);
    } else {
      fetchProfiles();
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="spinner mx-auto" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border px-6 py-3" style={{ background: "oklch(0.12 0 0 / 0.90)", backdropFilter: "blur(12px)" }}>
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors" style={{ background: "var(--surface)" }}>
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "oklch(0.63 0.23 25 / 0.15)" }}>
              <ShieldAlert size={14} style={{ color: "var(--danger)" }} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Yönetici Paneli</h1>
              <p className="text-xs text-muted-foreground">Personel Yetkilendirme</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users size={18} /> Sistem Kullanıcıları
          </h2>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
            Toplam: {profiles.length} Personel
          </span>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "var(--surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b border-border" style={{ background: "var(--surface-raised)" }}>
                <tr>
                  <th className="px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Personel</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-widest">E-posta</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Mevcut Rol</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-widest text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {profiles.map((p) => {
                  const isMe = user?.id === p.id;
                  const displayName = p.full_name?.trim() ? p.full_name : "İsimsiz Personel";
                  const isActive = activeUsers.includes(p.full_name);
                  
                  return (
                  <tr key={p.id} className={`hover:bg-muted/30 transition-colors ${isMe ? 'bg-muted/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border shrink-0" style={{ background: isMe ? "var(--warning)" : "var(--surface)", color: isMe ? "var(--background)" : "var(--muted-foreground)" }}>
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground flex items-center gap-2 flex-wrap">
                            {displayName}
                            {isMe && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-foreground/10 text-foreground shrink-0">Sen</span>}
                            {isActive && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0" style={{ background: "oklch(0.765 0.177 155.5 / 0.15)", color: "var(--success)", border: "1px solid oklch(0.765 0.177 155.5 / 0.3)" }}>
                                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
                                AKTİF
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.email}</td>
                    <td className="px-6 py-4">
                      {p.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "oklch(0.63 0.23 25 / 0.15)", color: "var(--danger)" }}>
                          <ShieldCheck size={12} /> Yönetici
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border border-border" style={{ background: "var(--surface-raised)", color: "var(--foreground)" }}>
                          Veznedar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.role === "admin" ? (
                        <button 
                          onClick={() => updateRole(p.id, p.role, "cashier")}
                          disabled={isMe}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg border border-border transition-colors ${isMe ? 'opacity-50 cursor-not-allowed text-muted-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                          title={isMe ? "Kendi yetkinizi alamazsınız" : "Veznedar Yap"}
                        >
                          Veznedar Yap
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateRole(p.id, p.role, "admin")}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          style={{ background: "var(--danger)", color: "var(--danger-foreground)" }}
                        >
                          Yönetici Yap
                        </button>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
