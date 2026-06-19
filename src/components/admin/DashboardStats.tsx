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
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1f2937" strokeDasharray="2" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1f2937" strokeDasharray="2" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="1" />

          {/* Sparkline Path */}
          {pathData && <path d={pathData} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />}

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#0c0c0e"
              stroke={color}
              strokeWidth="1.5"
              className="cursor-pointer transition-all hover:r-4"
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-serif-title">Tableau de Bord</h1>
          <p className="text-sm text-slate-400 mt-1">Analyse des visites et des interactions sur vos liens.</p>
        </div>

        {hasUmami && (
          <button
            onClick={openUmamiDashboard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-white text-black hover:bg-black hover:text-white border border-white hover:border-slate-850 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <LucideIcons.ExternalLink className="w-4 h-4" />
            Ouvrir dans Umami
          </button>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Total Visits */}
        <div className="p-6 rounded-none bg-slate-950 border border-slate-800 flex items-center space-x-5">
          <div className="p-3 rounded-none bg-slate-900 text-slate-400 border border-slate-800">
            <LucideIcons.Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Visites totales</p>
            <h3 className="text-2xl font-bold text-white mt-1 font-serif-title">{stats.totalVisits}</h3>
          </div>
        </div>

        {/* KPI: Unique Visitors */}
        <div className="p-6 rounded-none bg-slate-950 border border-slate-800 flex items-center space-x-5">
          <div className="p-3 rounded-none bg-slate-900 text-slate-400 border border-slate-800">
            <LucideIcons.Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Visiteurs uniques</p>
            <h3 className="text-2xl font-bold text-white mt-1 font-serif-title">{stats.uniqueVisitors}</h3>
          </div>
        </div>

        {/* KPI: Total Clicks */}
        <div className="p-6 rounded-none bg-slate-950 border border-slate-800 flex items-center space-x-5">
          <div className="p-3 rounded-none bg-slate-900 text-slate-400 border border-slate-800">
            <LucideIcons.MousePointerClick className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Clics sur liens</p>
            <h3 className="text-2xl font-bold text-white mt-1 font-serif-title">{stats.totalClicks}</h3>
          </div>
        </div>

        {/* KPI: CTR */}
        <div className="p-6 rounded-none bg-slate-950 border border-slate-800 flex items-center space-x-5">
          <div className="p-3 rounded-none bg-slate-900 text-slate-400 border border-slate-800">
            <LucideIcons.Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Taux de clics (CTR)</p>
            <h3 className="text-2xl font-bold text-white mt-1 font-serif-title">{ctr}%</h3>
          </div>
        </div>
      </div>

      {/* Traffic Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Visits Chart */}
        <div className="p-6 rounded-none bg-slate-950 border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2 font-serif-title">
              <span className="w-2 h-2 bg-white"></span>
              Visites sur la page
            </h3>
          </div>
          <div className="h-56">
            {renderLineChart(stats.visitsOverTime, "#ffffff", "visits")}
          </div>
        </div>

        {/* Clicks Chart */}
        <div className="p-6 rounded-none bg-slate-950 border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2 font-serif-title">
              <span className="w-2 h-2 bg-slate-400"></span>
              Clics sur les liens
            </h3>
          </div>
          <div className="h-56">
            {renderLineChart(stats.clicksOverTime, "#a1a1aa", "clicks")}
          </div>
        </div>

      </div>

      {/* Link details & Technical breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Link performance rank */}
        <div className="lg:col-span-2 p-6 rounded-none bg-slate-950 border border-slate-800">
          <h3 className="text-md font-bold text-white mb-6 flex items-center gap-2 font-serif-title">
            <LucideIcons.BarChart3 className="w-5 h-5 text-slate-400" />
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
                        <p className="font-semibold text-white truncate max-w-[220px]">{link.title}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[220px]">{link.url}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="font-semibold text-white">{link.clicks} clics</span>
                        <span className="text-xs text-slate-500 block">{percentage.toFixed(0)}% du total</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-none bg-slate-900 border border-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-500"
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
        <div className="p-6 rounded-none bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-white mb-6 flex items-center gap-2 font-serif-title">
              <LucideIcons.MonitorSmartphone className="w-5 h-5 text-slate-400" />
              Répartition technique
            </h3>

            {/* Devices */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-sans">Appareils</p>
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
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-sans">Navigateurs</p>
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
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-sans">Top Pays</p>
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
