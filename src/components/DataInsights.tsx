import React from 'react';
import { ColumnDefinition } from '../types';
import { formatMetricNumber, aggregateValues } from '../utils/dataProcessor';
import { Sparkles, TrendingUp, AlertCircle, Award, Compass, BarChart2, Zap } from 'lucide-react';

interface DataInsightsProps {
  columns: ColumnDefinition[];
  data: Record<string, any>[];
}

export const DataInsights: React.FC<DataInsightsProps> = ({ columns, data }) => {
  const numberCols = React.useMemo(() => columns.filter((c) => c.type === 'number'), [columns]);
  const stringCols = React.useMemo(() => columns.filter((c) => c.type === 'string'), [columns]);

  // Compute statistical breakdown for each numeric column
  const columnAnalysis = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    return numberCols.map((col) => {
      const vals = data.map((r) => Number(r[col.name])).filter((v) => !isNaN(v));
      if (vals.length === 0) return null;

      const sum = aggregateValues(vals, 'sum');
      const avg = aggregateValues(vals, 'avg');
      const min = aggregateValues(vals, 'min');
      const max = aggregateValues(vals, 'max');
      const median = aggregateValues(vals, 'median');

      // Standard deviation
      const variance = vals.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / vals.length;
      const stdDev = Math.sqrt(variance);

      // Top contributor in categorical column
      let topCategory = '';
      if (stringCols.length > 0) {
        const catMap: Record<string, number> = {};
        for (const row of data) {
          const cat = String(row[stringCols[0].name] || 'Other');
          catMap[cat] = (catMap[cat] || 0) + (Number(row[col.name]) || 0);
        }
        const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
        if (sortedCats[0]) {
          topCategory = `${sortedCats[0][0]} (${formatMetricNumber(sortedCats[0][1], col.name)})`;
        }
      }

      return {
        name: col.name,
        count: vals.length,
        sum,
        avg,
        min,
        max,
        median,
        stdDev: Math.round(stdDev * 100) / 100,
        skew: avg > median ? 'Right-skewed (concentrated in high values)' : 'Left-skewed (concentrated in lower values)',
        topCategory,
      };
    }).filter(Boolean);
  }, [data, numberCols, stringCols]);

  return (
    <div id="data-insights-view" className="space-y-6">
      {/* Header banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Automated Statistical Intelligence</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Dataset Analysis & Distribution Metrics</h2>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Comprehensive breakdown of statistical distributions, central tendencies, standard deviations, and volume drivers.
        </p>
      </div>

      {/* Grid of Column Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {columnAnalysis.map((item) => {
          if (!item) return null;
          return (
            <div
              key={item.name}
              id={`insight-card-${item.name}`}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg hover:border-slate-700/80 transition-all space-y-4 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <div className="text-[11px] text-slate-500 font-mono">Sample: {item.count} data points</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider">Total Sum</div>
                  <div className="text-base font-bold text-indigo-400 font-mono">
                    {formatMetricNumber(item.sum, item.name)}
                  </div>
                </div>
              </div>

              {/* Metric stats grid */}
              <div className="grid grid-cols-4 gap-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Average</div>
                  <div className="text-xs font-bold text-slate-200 mt-1">{formatMetricNumber(item.avg, item.name)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Median</div>
                  <div className="text-xs font-bold text-slate-200 mt-1">{formatMetricNumber(item.median, item.name)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Min</div>
                  <div className="text-xs font-bold text-slate-200 mt-1">{formatMetricNumber(item.min, item.name)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Peak (Max)</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1">{formatMetricNumber(item.max, item.name)}</div>
                </div>
              </div>

              {/* Detailed Observations */}
              <div className="space-y-2.5 text-xs text-slate-300 pt-1">
                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Distribution Profile: </span>
                    <span className="text-slate-400">{item.skew} with standard deviation of ±{item.stdDev.toLocaleString()}.</span>
                  </div>
                </div>

                {item.topCategory && (
                  <div className="flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">Primary Contributor: </span>
                      <span className="text-slate-400">Top volume contributor is {item.topCategory}.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

