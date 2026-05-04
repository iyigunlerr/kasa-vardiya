"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Giriş başarısız: E-posta veya şifre hatalı.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md rounded-2xl border border-border p-8 shadow-2xl relative overflow-hidden" style={{ background: "var(--surface)", backdropFilter: "blur(20px)" }}>
        {/* Glow effect */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full opacity-20" style={{ background: "var(--success)", filter: "blur(40px)" }} />
        
        <div className="text-center mb-8 relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: "oklch(0.765 0.177 155.5 / 0.15)", border: "1px solid oklch(0.765 0.177 155.5 / 0.30)" }}>
            <ShieldCheck size={28} style={{ color: "var(--success)" }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Finance Mutabakat</h1>
          <p className="text-sm text-muted-foreground mt-2">Güvenli sisteme giriş yapın</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl p-4 border" style={{ background: "oklch(0.63 0.23 25 / 0.10)", borderColor: "oklch(0.63 0.23 25 / 0.30)" }}>
            <AlertCircle size={18} style={{ color: "var(--danger)" }} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium" style={{ color: "var(--danger)" }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5 relative z-10">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">E-posta</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@sirket.com"
                className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all"
                style={{ background: "var(--surface-raised)" }}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Şifre</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all"
                style={{ background: "var(--surface-raised)" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, oklch(0.765 0.177 155.5), oklch(0.68 0.18 170))",
              color: "oklch(0.10 0 0)",
              boxShadow: "0 0 20px oklch(0.765 0.177 155.5 / 0.25)",
            }}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                Giriş Yap <LogIn size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
