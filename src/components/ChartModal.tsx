import React from 'react';
import { ChartConfig, ColorTheme } from '../types';
import { UniversalChart } from './UniversalChart';
import { X, Download, Share2, Check } from 'lucide-react';
import { exportToCSV, exportToJSON, aggregateChartData } from '../utils/dataProcessor';

interface ChartModalProps {
  config: ChartConfig | null;
  data: Record<string, any>[];
  theme: ColorTheme;
  onClose: () => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({ config, data, theme, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!config) return null;

  const aggregated = aggregateChartData(data, config);

  const handleCopySummary = () => {
    const text = `${config.title}\n` + aggregated.map(r => `${r.name}: ${config.yAxisKeys.map(k => `${k}=${r[k]}`).join(', ')}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        id="chart-expanded-modal"
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">{config.title}</h2>
            <p className="text-xs text-slate-400 capitalize mt-0.5">
              {config.aggregation} aggregation of {config.yAxisKeys.join(', ')} by {config.xAxisKey}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 text-xs text-slate-300 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-1.5 font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={() => exportToCSV(aggregated, `${config.id}_data.csv`)}
              className="px-3 py-1.5 text-xs text-slate-300 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-1.5 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Large Chart Canvas */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <UniversalChart
            config={config}
            data={data}
            theme={theme}
            height={380}
          />
        </div>

        {/* Underlying Data Points Table */}
        <div className="space-y-2.5 pt-1">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            Dataset Values Breakdown
          </div>
          <div className="overflow-x-auto max-h-48 border rounded-2xl border-slate-800 bg-slate-950/80">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800 sticky top-0 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3.5 py-2.5">{config.xAxisKey}</th>
                  {config.yAxisKeys.map((k) => (
                    <th key={k} className="px-3.5 py-2.5 text-right">
                      {k}
                    </th>
                  ))}
                  {config.secondaryYAxisKey && (
                    <th className="px-3.5 py-2.5 text-right">{config.secondaryYAxisKey}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono text-[11px]">
                {aggregated.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="px-3.5 py-2 font-sans font-medium text-white">{r.name}</td>
                    {config.yAxisKeys.map((k) => (
                      <td key={k} className="px-3.5 py-2 text-right font-mono text-slate-200">
                        {r[k]?.toLocaleString()}
                      </td>
                    ))}
                    {config.secondaryYAxisKey && (
                      <td className="px-3.5 py-2 text-right font-mono text-slate-200">{r[config.secondaryYAxisKey]?.toLocaleString()}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

