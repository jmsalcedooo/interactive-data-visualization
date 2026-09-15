import React from 'react';
import { ColumnDefinition } from '../types';
import { formatMetricNumber } from '../utils/dataProcessor';
import { TrendingUp, Layers, Hash, Award, ArrowUpRight } from 'lucide-react';

interface KPICardsProps {
  data: Record<string, any>[];
  columns: ColumnDefinition[];
}

export const KPICards: React.FC<KPICardsProps> = ({ data, columns }) => {
  const numericCols = React.useMemo(() => columns.filter((c) => c.type === 'number'), [columns]);

  // Compute key stats for top numeric columns
  const kpiStats = React.useMemo(() => {
    if (!data || data.length === 0 || numericCols.length === 0) return [];

    const stats = numericCols.slice(0, 4).map((col) => {
      const vals = data.map((r) => Number(r[col.name])).filter((v) => !isNaN(v));
      const total = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length > 0 ? total / vals.length : 0;
      const max = vals.length > 0 ? Math.max(...vals) : 0;
      const min = vals.length > 0 ? Math.min(...vals) : 0;

      // Find top item associated with max value
      let maxRecordLabel = '';
      const stringCol = columns.find((c) => c.type === 'string');
      if (stringCol) {
        const topRow = data.find((r) => Number(r[col.name]) === max);
        if (topRow) {
          maxRecordLabel = String(topRow[stringCol.name] || '');
        }
      }

      return {
        column: col.name,
        total,
        avg,
        max,
        min,
        maxRecordLabel,
        count: vals.length,
      };
    });

    return stats;
  }, [data, numericCols, columns]);

  if (kpiStats.length === 0) {
    return null;
  }

  const icons = [TrendingUp, Award, Layers, Hash];
  const badges = [
    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'bg-sky-500/10 text-sky-400 border-sky-500/20',
    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ];

  return (
    <div id="kpi-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiStats.map((stat, idx) => {
        const Icon = icons[idx % icons.length];
        const badgeStyle = badges[idx % badges.length];

        return (
          <div
            key={stat.column}
            id={`kpi-card-${idx}`}
            className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-lg hover:border-slate-700/80 transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]" title={stat.column}>
                {stat.column}
              </span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${badgeStyle}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {formatMetricNumber(stat.total, stat.column)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <span className="text-emerald-400 flex items-center text-[11px] font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Total Volume
                </span>
                <span>•</span>
                <span>{stat.count} points</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 text-[11px] uppercase tracking-wider">Avg: </span>
                <span className="font-semibold text-slate-300 font-mono">{formatMetricNumber(stat.avg, stat.column)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] uppercase tracking-wider">Peak: </span>
                <span className="font-semibold text-slate-200 font-mono" title={stat.maxRecordLabel ? `Max: ${stat.maxRecordLabel}` : undefined}>
                  {formatMetricNumber(stat.max, stat.column)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

