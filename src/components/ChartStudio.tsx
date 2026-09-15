import React from 'react';
import {
  ChartConfig,
  ChartType,
  AggregationType,
  ColumnDefinition,
  ColorTheme,
} from '../types';
import { UniversalChart } from './UniversalChart';
import { THEME_PALETTES } from '../utils/themeColors';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Layers,
  CircleDot,
  Sliders,
  Sparkles,
  Download,
  Share2,
  Check,
} from 'lucide-react';
import { exportToCSV, exportToJSON, aggregateChartData } from '../utils/dataProcessor';

interface ChartStudioProps {
  columns: ColumnDefinition[];
  data: Record<string, any>[];
  theme: ColorTheme;
  onPinChart?: (config: ChartConfig) => void;
}

const CHART_TYPES: { type: ChartType; label: string; icon: any; desc: string }[] = [
  { type: 'bar', label: 'Bar Chart', icon: BarChart3, desc: 'Compare categories and magnitude' },
  { type: 'stacked-bar', label: 'Stacked Bar', icon: Layers, desc: 'Part-to-whole comparisons' },
  { type: 'line', label: 'Line Chart', icon: TrendingUp, desc: 'Show continuous trends over time' },
  { type: 'area', label: 'Area Chart', icon: Activity, desc: 'Volume and cumulative momentum' },
  { type: 'stacked-area', label: 'Stacked Area', icon: Layers, desc: 'Stacked cumulative trends' },
  { type: 'pie', label: 'Pie Chart', icon: PieIcon, desc: 'Distribution and percentages' },
  { type: 'donut', label: 'Donut Chart', icon: CircleDot, desc: 'Proportional breakdown' },
  { type: 'radar', label: 'Radar Polar', icon: Activity, desc: 'Multivariate performance scoring' },
  { type: 'scatter', label: 'Scatter Matrix', icon: CircleDot, desc: 'Correlation between variables' },
  { type: 'composed', label: 'Composed Dual', icon: BarChart3, desc: 'Dual-axis Bar + Line mix' },
];

export const ChartStudio: React.FC<ChartStudioProps> = ({
  columns,
  data,
  theme,
}) => {
  const stringCols = React.useMemo(() => columns.filter((c) => c.type === 'string' || c.type === 'date'), [columns]);
  const numberCols = React.useMemo(() => columns.filter((c) => c.type === 'number'), [columns]);

  const [chartType, setChartType] = React.useState<ChartType>('bar');
  const [xAxisKey, setXAxisKey] = React.useState<string>(() => stringCols[0]?.name || columns[0]?.name || '');
  const [selectedYKeys, setSelectedYKeys] = React.useState<string[]>(() => [numberCols[0]?.name || '']);
  const [secondaryYKey, setSecondaryYKey] = React.useState<string>('');
  const [aggregation, setAggregation] = React.useState<AggregationType>('sum');
  const [sortBy, setSortBy] = React.useState<ChartConfig['sortBy']>('value-desc');
  const [topN, setTopN] = React.useState<number>(10);
  const [curveType, setCurveType] = React.useState<'monotone' | 'linear' | 'step'>('monotone');
  const [showGrid, setShowGrid] = React.useState<boolean>(true);
  const [showLegend, setShowLegend] = React.useState<boolean>(true);
  const [customTitle, setCustomTitle] = React.useState<string>('');
  const [copiedNotification, setCopiedNotification] = React.useState(false);

  // Auto-sync valid keys if columns change
  React.useEffect(() => {
    if (!stringCols.some((c) => c.name === xAxisKey) && stringCols.length > 0) {
      setXAxisKey(stringCols[0].name);
    }
    if (selectedYKeys.length === 0 || !numberCols.some((c) => selectedYKeys.includes(c.name))) {
      setSelectedYKeys([numberCols[0]?.name || '']);
    }
  }, [columns, stringCols, numberCols]);

  const handleToggleYKey = (key: string) => {
    if (selectedYKeys.includes(key)) {
      if (selectedYKeys.length > 1) {
        setSelectedYKeys(selectedYKeys.filter((k) => k !== key));
      }
    } else {
      setSelectedYKeys([...selectedYKeys, key]);
    }
  };

  const currentConfig: ChartConfig = {
    id: 'studio-chart-custom',
    title: customTitle.trim() || `${aggregation.toUpperCase()} of ${selectedYKeys.join(', ')} by ${xAxisKey}`,
    type: chartType,
    xAxisKey,
    yAxisKeys: selectedYKeys.filter(Boolean),
    secondaryYAxisKey: chartType === 'composed' && secondaryYKey ? secondaryYKey : undefined,
    aggregation,
    sortBy,
    topN: topN === 0 ? undefined : topN,
    curveType,
    showGrid,
    showLegend,
  };

  const handleExportChartData = (format: 'csv' | 'json') => {
    const aggregated = aggregateChartData(data, currentConfig);
    if (format === 'csv') {
      exportToCSV(aggregated, `${currentConfig.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    } else {
      exportToJSON(aggregated, `${currentConfig.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
    }
  };

  const handleCopySummary = () => {
    const aggregated = aggregateChartData(data, currentConfig);
    const summary = `Chart: ${currentConfig.title}\nDimension: ${xAxisKey}\nMetrics: ${selectedYKeys.join(', ')}\nRecords: ${aggregated.length}\nTop 3 Items:\n` +
      aggregated.slice(0, 3).map((r, i) => `${i + 1}. ${r.name}: ${selectedYKeys.map(k => `${k}=${r[k]}`).join(', ')}`).join('\n');
    navigator.clipboard.writeText(summary);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div id="chart-studio-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Configuration Controls Sidebar */}
      <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Visual Design Studio
            </h2>
            <p className="text-[11px] text-slate-400">Configure metrics, axes & formats</p>
          </div>
        </div>

        {/* 1. Chart Type Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
            1. Visualization Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CHART_TYPES.map((ct) => {
              const Icon = ct.icon;
              const isSelected = chartType === ct.type;
              return (
                <button
                  key={ct.type}
                  id={`btn-select-type-${ct.type}`}
                  onClick={() => setChartType(ct.type)}
                  className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{ct.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{ct.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. X-Axis (Dimension / Category) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
            2. X-Axis Grouping Dimension
          </label>
          <select
            id="select-xaxis-dimension"
            value={xAxisKey}
            onChange={(e) => setXAxisKey(e.target.value)}
            className="w-full text-xs bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          >
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.type})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Y-Axis (Metrics to Measure) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
            3. Numerical Metrics
          </label>
          <div className="space-y-1 max-h-36 overflow-y-auto p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
            {numberCols.map((col) => {
              const isSelected = selectedYKeys.includes(col.name);
              return (
                <button
                  key={col.name}
                  type="button"
                  id={`btn-ykey-${col.name}`}
                  onClick={() => handleToggleYKey(col.name)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{col.name}</span>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700 bg-slate-950'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Composed Secondary Y-Axis Option */}
        {chartType === 'composed' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
              Secondary Y-Axis Metric (Right Line)
            </label>
            <select
              id="select-secondary-ykey"
              value={secondaryYKey}
              onChange={(e) => setSecondaryYKey(e.target.value)}
              className="w-full text-xs bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-slate-200"
            >
              <option value="">None (Single Axis)</option>
              {numberCols.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 4. Aggregation Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
              Aggregation
            </label>
            <select
              id="select-aggregation"
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as AggregationType)}
              className="w-full text-xs bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-slate-200 focus:border-indigo-500"
            >
              <option value="sum">Sum (Total)</option>
              <option value="avg">Average (Mean)</option>
              <option value="median">Median</option>
              <option value="max">Maximum</option>
              <option value="min">Minimum</option>
              <option value="count">Count (Frequency)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
              Sorting Order
            </label>
            <select
              id="select-sorting"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ChartConfig['sortBy'])}
              className="w-full text-xs bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-slate-200 focus:border-indigo-500"
            >
              <option value="value-desc">Highest First</option>
              <option value="value-asc">Lowest First</option>
              <option value="label-asc">Label A to Z</option>
              <option value="label-desc">Label Z to A</option>
              <option value="none">Original Order</option>
            </select>
          </div>
        </div>

        {/* 5. Top N Limit and Curve Styling */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
              Limit (Top N)
            </label>
            <select
              id="select-top-n"
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="w-full text-xs bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-slate-200 focus:border-indigo-500"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={25}>Top 25</option>
              <option value={0}>All Records</option>
            </select>
          </div>

          {(chartType === 'line' || chartType === 'area' || chartType === 'stacked-area') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                Curve Style
              </label>
              <select
                id="select-curve-style"
                value={curveType}
                onChange={(e) => setCurveType(e.target.value as any)}
                className="w-full text-xs bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-slate-200 focus:border-indigo-500"
              >
                <option value="monotone">Smooth Curve</option>
                <option value="linear">Straight Lines</option>
                <option value="step">Stepped Lines</option>
              </select>
            </div>
          )}
        </div>

        {/* Display Toggles */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Gridlines</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLegend}
              onChange={(e) => setShowLegend(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show Legend</span>
          </label>
        </div>
      </div>

      {/* Main Interactive Chart Preview Canvas */}
      <div className="lg:col-span-8 space-y-4">
        {/* Custom title input & export toolbar */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              id="input-custom-chart-title"
              type="text"
              placeholder={currentConfig.title}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full font-bold text-white text-base bg-transparent border-b border-dashed border-slate-700 focus:border-indigo-500 focus:outline-none pb-1"
            />
            <div className="text-[11px] text-slate-400 mt-1">
              Click to edit chart display title
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-chart-summary"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
              title="Copy summary to clipboard"
            >
              {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedNotification ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              id="btn-export-chart-csv"
              onClick={() => handleExportChartData('csv')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>CSV</span>
            </button>
            <button
              id="btn-export-chart-json"
              onClick={() => handleExportChartData('json')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Rendered Live Chart Component */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-sm">
          <UniversalChart
            config={currentConfig}
            data={data}
            theme={theme}
            height={420}
          />
        </div>

        {/* Micro Data Table for this Aggregated View */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              Aggregated Data Breakdown
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {aggregateChartData(data, currentConfig).length} grouped data points
            </div>
          </div>

          <div className="overflow-x-auto max-h-52 border rounded-2xl border-slate-800 bg-slate-950/80">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold sticky top-0 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3.5 py-2.5">{xAxisKey}</th>
                  {selectedYKeys.map((k) => (
                    <th key={k} className="px-3.5 py-2.5 text-right">
                      {aggregation.toUpperCase()}({k})
                    </th>
                  ))}
                  {secondaryYKey && <th className="px-3.5 py-2.5 text-right">{secondaryYKey}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono text-[11px]">
                {aggregateChartData(data, currentConfig).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="px-3.5 py-2 font-sans font-medium text-white">{row.name}</td>
                    {selectedYKeys.map((k) => (
                      <td key={k} className="px-3.5 py-2 text-right font-mono text-slate-200">{row[k]?.toLocaleString()}</td>
                    ))}
                    {secondaryYKey && <td className="px-3.5 py-2 text-right font-mono text-slate-200">{row[secondaryYKey]?.toLocaleString()}</td>}
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
