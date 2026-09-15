import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ZAxis,
} from 'recharts';
import { ChartConfig, ColorTheme } from '../types';
import { aggregateChartData, formatMetricNumber } from '../utils/dataProcessor';
import { THEME_PALETTES } from '../utils/themeColors';
import { Maximize2, BarChart2, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';

interface UniversalChartProps {
  config: ChartConfig;
  data: Record<string, any>[];
  theme: ColorTheme;
  height?: number;
  onExpand?: (config: ChartConfig) => void;
  onChangeType?: (chartId: string, newType: ChartConfig['type']) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div id="chart-tooltip" className="bg-slate-950/95 text-white text-xs rounded-2xl p-3.5 shadow-2xl border border-slate-800 backdrop-blur-xl z-50">
        <p className="font-bold text-slate-200 mb-2 border-b border-slate-800 pb-1.5">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-800" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="text-slate-400 capitalize">{entry.name}:</span>
              </div>
              <span className="font-mono font-bold text-white">
                {typeof entry.value === 'number' ? formatMetricNumber(entry.value, entry.name) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const UniversalChart: React.FC<UniversalChartProps> = ({
  config,
  data,
  theme,
  height = 280,
  onExpand,
  onChangeType,
}) => {
  const palette = THEME_PALETTES[theme]?.colors || THEME_PALETTES.indigo.colors;
  const chartData = React.useMemo(() => aggregateChartData(data, config), [data, config]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 p-6">
        <Activity className="w-8 h-8 mb-2 stroke-1 text-slate-600 animate-pulse" />
        <p className="text-sm font-semibold text-slate-400">No data points for this metric configuration</p>
        <p className="text-xs text-slate-500 mt-1">Adjust filters or select alternative dimensions</p>
      </div>
    );
  }

  const renderChart = () => {
    const showGrid = config.showGrid !== false;
    const showLegend = config.showLegend !== false;
    const curve = config.curveType || 'monotone';

    switch (config.type) {
      case 'bar':
      case 'stacked-bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />}
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={chartData.length > 6 ? -25 : 0}
                textAnchor={chartData.length > 6 ? 'end' : 'middle'}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => formatMetricNumber(v, config.yAxisKeys[0])}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && config.yAxisKeys.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#94a3b8' }} />}
              {config.yAxisKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={palette[idx % palette.length]}
                  radius={config.type === 'stacked-bar' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                  stackId={config.type === 'stacked-bar' ? 'a' : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />}
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={chartData.length > 6 ? -25 : 0}
                textAnchor={chartData.length > 6 ? 'end' : 'middle'}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => formatMetricNumber(v, config.yAxisKeys[0])}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#94a3b8' }} />}
              {config.yAxisKeys.map((key, idx) => (
                <Line
                  key={key}
                  type={curve}
                  dataKey={key}
                  stroke={palette[idx % palette.length]}
                  strokeWidth={3}
                  dot={{ r: 3.5, fill: palette[idx % palette.length], strokeWidth: 2, stroke: '#020617' }}
                  activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
      case 'stacked-area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <defs>
                {config.yAxisKeys.map((key, idx) => {
                  const color = palette[idx % palette.length];
                  return (
                    <linearGradient key={`grad-${key}`} id={`grad-${config.id}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                    </linearGradient>
                  );
                })}
              </defs>
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />}
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={chartData.length > 6 ? -25 : 0}
                textAnchor={chartData.length > 6 ? 'end' : 'middle'}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => formatMetricNumber(v, config.yAxisKeys[0])}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#94a3b8' }} />}
              {config.yAxisKeys.map((key, idx) => (
                <Area
                  key={key}
                  type={curve}
                  dataKey={key}
                  stroke={palette[idx % palette.length]}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#grad-${config.id}-${idx})`}
                  stackId={config.type === 'stacked-area' ? '1' : undefined}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut': {
        const primaryKey = config.yAxisKeys[0];
        const innerRadius = config.type === 'donut' ? '55%' : '0%';
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 5, bottom: 5, left: 5, right: 5 }}>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />}
              <Pie
                data={chartData}
                dataKey={primaryKey}
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius="75%"
                paddingAngle={config.type === 'donut' ? 4 : 1}
                label={({ percent }: any) => (percent !== undefined ? `${(percent * 100).toFixed(0)}%` : '')}
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={palette[index % palette.length]} stroke="#020617" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#64748b', fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              {config.yAxisKeys.map((key, idx) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={palette[idx % palette.length]}
                  fill={palette[idx % palette.length]}
                  fillOpacity={0.35}
                />
              ))}
              {showLegend && <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />}
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'scatter': {
        const xKey = config.xAxisKey;
        const yKey = config.yAxisKeys[0];
        const zKey = config.yAxisKeys[1] || undefined;
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />}
              <XAxis
                type="category"
                dataKey="name"
                name={xKey}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                type="number"
                dataKey={yKey}
                name={yKey}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => formatMetricNumber(v, yKey)}
                tickLine={false}
                axisLine={false}
              />
              {zKey && <ZAxis type="number" dataKey={zKey} range={[60, 400]} name={zKey} />}
              <Tooltip content={<CustomTooltip />} />
              <Scatter name={yKey} data={chartData} fill={palette[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );
      }

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />}
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={chartData.length > 6 ? -25 : 0}
                textAnchor={chartData.length > 6 ? 'end' : 'middle'}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => formatMetricNumber(v, config.yAxisKeys[0])}
                tickLine={false}
                axisLine={false}
              />
              {config.secondaryYAxisKey && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(v) => formatMetricNumber(v, config.secondaryYAxisKey)}
                  tickLine={false}
                  axisLine={false}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#94a3b8' }} />}
              <Bar yAxisId="left" dataKey={config.yAxisKeys[0]} fill={palette[0]} radius={[6, 6, 0, 0]} />
              {config.secondaryYAxisKey ? (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={config.secondaryYAxisKey}
                  stroke={palette[1]}
                  strokeWidth={3}
                  dot={{ r: 3.5, fill: palette[1], stroke: '#020617', strokeWidth: 2 }}
                />
              ) : config.yAxisKeys[1] ? (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey={config.yAxisKeys[1]}
                  stroke={palette[1]}
                  strokeWidth={3}
                  dot={{ r: 3.5, fill: palette[1], stroke: '#020617', strokeWidth: 2 }}
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div id={`chart-card-${config.id}`} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-lg hover:border-slate-700/80 transition-all flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0 pr-2">
          <h3 className="text-sm font-bold text-white tracking-tight truncate" title={config.title}>
            {config.title}
          </h3>
          {config.description ? (
            <p className="text-xs text-slate-400 truncate mt-0.5" title={config.description}>
              {config.description}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 capitalize mt-0.5">
              {config.aggregation} of {config.yAxisKeys.join(', ')} by {config.xAxisKey}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onChangeType && (
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 shadow-inner">
              <button
                id={`btn-chart-type-bar-${config.id}`}
                onClick={() => onChangeType(config.id, 'bar')}
                title="Bar Chart"
                className={`p-1 rounded-lg text-xs transition-all ${config.type === 'bar' ? 'bg-indigo-600 text-white shadow-xs font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
              <button
                id={`btn-chart-type-line-${config.id}`}
                onClick={() => onChangeType(config.id, 'line')}
                title="Line Chart"
                className={`p-1 rounded-lg text-xs transition-all ${config.type === 'line' ? 'bg-indigo-600 text-white shadow-xs font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
              <button
                id={`btn-chart-type-pie-${config.id}`}
                onClick={() => onChangeType(config.id, 'pie')}
                title="Pie Chart"
                className={`p-1 rounded-lg text-xs transition-all ${config.type === 'pie' || config.type === 'donut' ? 'bg-indigo-600 text-white shadow-xs font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <PieIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {onExpand && (
            <button
              id={`btn-expand-chart-${config.id}`}
              onClick={() => onExpand(config)}
              title="Expand Chart View"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div style={{ height: `${height}px` }} className="w-full">
        {renderChart()}
      </div>
    </div>
  );
};

