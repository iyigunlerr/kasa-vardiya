"use client";

import { useAuth } from "@/lib/auth-context";

export default function DebugPage() {
  const { user, profile, session, loading, isAdmin } = useAuth();

  if (loading) return <div className="p-10 text-white">Yükleniyor...</div>;

  return (
    <div className="min-h-screen p-10 font-mono text-sm" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <h1 className="text-2xl font-bold mb-4 text-white">Sistem & Kullanıcı Durumu (Debug)</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <h2 className="font-bold text-lg mb-2 text-white">1. Auth Durumu (Giriş yapılmış mı?)</h2>
          <pre>{JSON.stringify({ 
            loggedIn: !!user,
            userId: user?.id,
            email: user?.email,
          }, null, 2)}</pre>
        </div>

        <div className="p-4 border rounded" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <h2 className="font-bold text-lg mb-2 text-white">2. Profil Durumu (Veritabanında var mı?)</h2>
          <pre>{JSON.stringify({ 
            profileExists: !!profile,
            profileData: profile,
            isAdmin: isAdmin
          }, null, 2)}</pre>
        </div>
        
        <div className="p-4 border rounded" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <h2 className="font-bold text-lg mb-2 text-white">3. Ne Yapmalıyım?</h2>
          {(!user) ? (
            <p className="text-red-400">Giriş yapmamışsınız. Lütfen /login sayfasından giriş yapın.</p>
          ) : (!profile) ? (
            <p className="text-red-400">Auth ile giriş yapmışsınız ancak 'profiles' tablosunda kaydınız yok! Supabase SQL kısmında verdiğim INSERT kodunu çalıştırmanız gerekiyor.</p>
          ) : (!profile.full_name) ? (
            <p className="text-red-400">Profiliniz var ancak 'full_name' kısmınız boş. İsim yazmadığı için görünmüyorsunuz. Supabase'den isminizi doldurun.</p>
          ) : (
            <p className="text-green-400">Profiliniz mevcut ve her şey yolunda görünüyor! Eğer Admin iseniz tüm listeyi görebiliyor olmalısınız.</p>
          )}
        </div>
      </div>
    </div>
  );
}
