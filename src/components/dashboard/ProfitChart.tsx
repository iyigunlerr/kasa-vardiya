"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

export type MonthlyChartData = {
  ay: string;
  icerideKar: number;
  alinanKar: number;
};

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────────────────

const formatTL = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatAxisTL = (value: number) => {
  if (value >= 1_000_000) return `₺${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₺${(value / 1_000).toFixed(0)}K`;
  return `₺${value}`;
};

// ─── Özel Tooltip ─────────────────────────────────────────────────────────────

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  const icerideKar = payload.find((p) => p.name === "icerideKar");
  const alinanKar = payload.find((p) => p.name === "alinanKar");
  const total = (icerideKar?.value ?? 0) + (alinanKar?.value ?? 0);

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-sm min-w-[200px]">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
        {label}
      </p>

      {icerideKar && (
        <div className="flex items-center justify-between gap-6 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#10b981" }}
            />
            <span className="text-xs text-zinc-400">İçerideki Kar</span>
          </div>
          <span className="text-sm font-semibold text-emerald-400">
            {formatTL(icerideKar.value)}
          </span>
        </div>
      )}

      {alinanKar && (
        <div className="flex items-center justify-between gap-6 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#f59e0b" }}
            />
            <span className="text-xs text-zinc-400">Alınan Kar</span>
          </div>
          <span className="text-sm font-semibold text-amber-400">
            {formatTL(alinanKar.value)}
          </span>
        </div>
      )}

      <div className="border-t border-zinc-700/50 pt-2 mt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Toplam</span>
          <span className="text-sm font-bold text-zinc-200">{formatTL(total)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── KPI Kartı ────────────────────────────────────────────────────────────────

type KpiCardProps = {
  title: string;
  value: number;
  change: number;
  color: "emerald" | "amber";
  icon: React.ReactNode;
};

const KpiCard = ({ title, value, change, color, icon }: KpiCardProps) => {
  const isPositive = change >= 0;
  const borderColor = color === "emerald" ? "border-emerald-500/20" : "border-amber-500/20";
  const valueColor = color === "emerald" ? "text-emerald-400" : "text-amber-400";
  const iconBg = color === "emerald" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400";

  return (
    <div className={`rounded-xl border ${borderColor} bg-zinc-800/40 p-5 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{title}</p>
        <div className={`rounded-lg p-2 ${iconBg}`}>{icon}</div>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{formatTL(value)}</p>
      <div className="flex items-center gap-1.5">
        {isPositive ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
        )}
        <span
          className={`text-xs font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
        >
          {isPositive ? "+" : ""}
          {change.toFixed(1)}%
        </span>
        <span className="text-xs text-zinc-600">geçen aya göre</span>
      </div>
    </div>
  );
};

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

type ChartType = "area" | "bar";

export default function ProfitChart({ monthlyData }: { monthlyData: MonthlyChartData[] }) {
  const [chartType, setChartType] = useState<ChartType>("area");

  if (!monthlyData || monthlyData.length === 0) {
    return <div className="p-10 text-center text-zinc-500">Veri bulunamadı.</div>;
  }

  const latest = monthlyData[monthlyData.length - 1];
  const prev = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : { icerideKar: 0, alinanKar: 0 };

  const icerideChange = prev.icerideKar ? ((latest.icerideKar - prev.icerideKar) / prev.icerideKar) * 100 : 0;
  const alinanChange = prev.alinanKar ? ((latest.alinanKar - prev.alinanKar) / prev.alinanKar) * 100 : 0;

  const totalIceride = latest.icerideKar; // Kümülatif olduğu için son ayki değer toplamı ifade eder
  const totalAlinan = latest.alinanKar;
  const retentionRate = (totalIceride + totalAlinan) > 0 ? ((totalIceride / (totalIceride + totalAlinan)) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-zinc-950 rounded-3xl p-6 md:p-8 font-sans w-full">
      <div className="mx-auto w-full space-y-6">

        {/* ── Başlık ── */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Kümülatif Gelişim · Kar Analizi
          </p>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Kar Dağılım Paneli
          </h1>
        </div>

        {/* ── KPI Kartları ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="İçerideki Kar"
            value={latest.icerideKar}
            change={icerideChange}
            color="emerald"
            icon={<PiggyBank className="h-4 w-4" />}
          />
          <KpiCard
            title="Alınan Kar"
            value={latest.alinanKar}
            change={alinanChange}
            color="amber"
            icon={<Wallet className="h-4 w-4" />}
          />
          <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-5 flex flex-col justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              Sistemde Tutma Oranı
            </p>
            <div>
              <p className="text-2xl font-bold text-zinc-100 mt-3">
                %{retentionRate}
              </p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-700/50">
                <div
                  className="h-1.5 rounded-full bg-emerald-500"
                  style={{ width: `${retentionRate}%` }}
                />
              </div>
              <p className="text-xs text-zinc-600 mt-2">Güncel oran</p>
            </div>
          </div>
        </div>

        {/* ── Grafik Kartı ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-6 space-y-5">

          {/* Grafik Başlık + Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                <span className="text-xs text-zinc-400">İçerideki Kar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
                <span className="text-xs text-zinc-400">Alınan Kar</span>
              </div>
            </div>

            <div className="flex rounded-lg border border-zinc-800 bg-zinc-950/60 p-0.5 gap-0.5 self-start sm:self-auto">
              {(["area", "bar"] as ChartType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    chartType === type
                      ? "bg-zinc-700 text-zinc-100 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {type === "area" ? "Alan" : "Çubuk"}
                </button>
              ))}
            </div>
          </div>

          {/* Grafik */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="ay"
                    tick={{ fill: "#71717a", fontSize: 11, fontFamily: "inherit" }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tickFormatter={formatAxisTL}
                    tick={{ fill: "#71717a", fontSize: 11, fontFamily: "inherit" }}
                    axisLine={false}
                    tickLine={false}
                    dx={-4}
                    width={64}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3f3f46", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="icerideKar"
                    name="icerideKar"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#emeraldGrad)"
                    dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#10b981", stroke: "#052e16", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="alinanKar"
                    name="alinanKar"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#amberGrad)"
                    dot={{ fill: "#f59e0b", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#f59e0b", stroke: "#451a03", strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="ay"
                    tick={{ fill: "#71717a", fontSize: 11, fontFamily: "inherit" }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tickFormatter={formatAxisTL}
                    tick={{ fill: "#71717a", fontSize: 11, fontFamily: "inherit" }}
                    axisLine={false}
                    tickLine={false}
                    dx={-4}
                    width={64}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar
                    dataKey="icerideKar"
                    name="icerideKar"
                    fill="#10b981"
                    fillOpacity={0.85}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="alinanKar"
                    name="alinanKar"
                    fill="#f59e0b"
                    fillOpacity={0.85}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Alt Özet Çizgisi */}
          <div className="border-t border-zinc-800/60 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-600 mb-0.5">Toplam İçerideki Kar (Güncel)</p>
              <p className="text-sm font-semibold text-emerald-400">{formatTL(totalIceride)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-600 mb-0.5">Toplam Alınan Kar (Güncel)</p>
              <p className="text-sm font-semibold text-amber-400">{formatTL(totalAlinan)}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
