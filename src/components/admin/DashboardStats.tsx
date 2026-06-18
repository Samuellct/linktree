import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import type { AnalyticsStats } from "../../lib/db";

interface DashboardStatsProps {
  stats: AnalyticsStats;
  umamiUrl?: string | null;
  umamiId?: string | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, umamiUrl, umamiId }) => {
  const [activePeriod, setActivePeriod] = useState<30 | 7 | 90>(30);

  // Compute stats metrics
  const ctr = stats.totalVisits > 0 ? ((stats.totalClicks / stats.totalVisits) * 100).toFixed(1) : "0.0";

  // Umami integration link
  const hasUmami = !!(umamiUrl && umamiId);
  // Extrapolate dashboard link if possible or open user-configured dashboard url
  const openUmamiDashboard = () => {
    if (hasUmami) {
      window.open(umamiUrl || "", "_blank", "noopener,noreferrer");
    }
  };

  // SVG Chart data rendering helper
  const renderLineChart = (data: Array<{ date: string; count: number }>, color: string, id: string) => {
    if (data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-sm text-slate-500">
          Pas de données historiques pour cette période.
        </div>
      );
    }

    const maxCount = Math.max(...data.map((d) => d.count), 5);
    const height = 180;
    const width = 500;
    const padding = 20;

    const points = data.map((d, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const y = height - padding - (d.count * (height - padding * 2)) / maxCount;
      return { x, y, ...d };
    });

    const pathData = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaData = points.length > 0 
      ? `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
      : "";

    return (
      <div className="relative w-full h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="4" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />

          {/* Gradient Area */}
          {areaData && <path d={areaData} fill={`url(#grad-${id})`} />}

          {/* Sparkline Path */}
          {pathData && <path d={pathData} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="#0f172a"
              stroke={color}
              strokeWidth="2"
              className="cursor-pointer hover:r-5 transition-all"
            >
              <title>{`${p.date}: ${p.count}`}</title>
            </circle>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Top header / stats title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tableau de Bord</h1>
          <p className="text-sm text-slate-400 mt-1">Analyse des visites et des interactions sur vos liens.</p>
        </div>

        {hasUmami && (
          <button
            onClick={openUmamiDashboard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer shadow-md"
          >
            <LucideIcons.ExternalLink className="w-4 h-4" />
            Ouvrir dans Umami
          </button>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Total Visits */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-950/60 shadow-xl flex items-center space-x-5">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/10">
            <LucideIcons.Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Visites totales</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.totalVisits}</h3>
          </div>
        </div>

        {/* KPI: Unique Visitors */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-950/60 shadow-xl flex items-center space-x-5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
            <LucideIcons.Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Visiteurs uniques</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.uniqueVisitors}</h3>
          </div>
        </div>

        {/* KPI: Total Clicks */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-950/60 shadow-xl flex items-center space-x-5">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/10">
            <LucideIcons.MousePointerClick className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider font-sans">Clics sur liens</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.totalClicks}</h3>
          </div>
        </div>

        {/* KPI: CTR */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-950/60 shadow-xl flex items-center space-x-5">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/10">
            <LucideIcons.Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider font-sans">Taux de clics (CTR)</p>
            <h3 className="text-2xl font-bold text-white mt-1">{ctr}%</h3>
          </div>
        </div>
      </div>

      {/* Traffic Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Visits Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-950/60 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Visites sur la page
            </h3>
          </div>
          <div className="h-56">
            {renderLineChart(stats.visitsOverTime, "#3b82f6", "visits")}
          </div>
        </div>

        {/* Clicks Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-950/60 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
              Clics sur les liens
            </h3>
          </div>
          <div className="h-56">
            {renderLineChart(stats.clicksOverTime, "#8b5cf6", "clicks")}
          </div>
        </div>

      </div>

      {/* Link details & Technical breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Link performance rank */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-950/60 shadow-xl">
          <h3 className="text-md font-bold text-white mb-6 flex items-center gap-2">
            <LucideIcons.BarChart3 className="w-5 h-5 text-indigo-400" />
            Performance des liens
          </h3>
          
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {stats.clicksPerLink.length > 0 ? (
              stats.clicksPerLink.map((link) => {
                const percentage = stats.totalClicks > 0 ? (link.clicks / stats.totalClicks) * 100 : 0;
                return (
                  <div key={link.id} className="group">
                    <div className="flex justify-between items-center text-sm mb-1.5">
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate max-w-[220px]">{link.title}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[220px]">{link.url}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="font-semibold text-white">{link.clicks} clics</span>
                        <span className="text-xs text-slate-500 block">{percentage.toFixed(0)}% du total</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800/40 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full group-hover:bg-indigo-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                Aucun clic enregistré pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Technical Split breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-950/60 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-white mb-6 flex items-center gap-2">
              <LucideIcons.MonitorSmartphone className="w-5 h-5 text-indigo-400" />
              Répartition technique
            </h3>

            {/* Devices */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Appareils</p>
              <div className="space-y-2">
                {stats.devices.slice(0, 3).map((dev) => (
                  <div key={dev.name} className="flex justify-between items-center text-sm">
                    <span className="capitalize text-slate-300 flex items-center gap-2">
                      {dev.name === 'mobile' && <LucideIcons.Smartphone className="w-4 h-4 text-slate-500" />}
                      {dev.name === 'desktop' && <LucideIcons.Monitor className="w-4 h-4 text-slate-500" />}
                      {dev.name === 'tablet' && <LucideIcons.Tablet className="w-4 h-4 text-slate-500" />}
                      {dev.name}
                    </span>
                    <span className="font-semibold text-white">{dev.count} ({((dev.count / Math.max(stats.totalVisits, 1)) * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browsers */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Navigateurs</p>
              <div className="space-y-2">
                {stats.browsers.slice(0, 3).map((browser) => (
                  <div key={browser.name} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">{browser.name}</span>
                    <span className="font-semibold text-white">{browser.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Top Pays</p>
              <div className="space-y-2">
                {stats.countries.slice(0, 3).map((country) => (
                  <div key={country.name} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 flex items-center gap-2">
                      <LucideIcons.MapPin className="w-4 h-4 text-slate-500" />
                      {country.name}
                    </span>
                    <span className="font-semibold text-white">{country.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
