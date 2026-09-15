import React from 'react';
import { ChartConfig, ColorTheme, ColumnDefinition, Dataset } from '../types';
import { UniversalChart } from './UniversalChart';
import { Sparkles, LayoutGrid, Zap, ShieldCheck } from 'lucide-react';

interface DashboardGridProps {
  dataset: Dataset;
  filteredData: Record<string, any>[];
  theme: ColorTheme;
  onExpandChart: (config: ChartConfig) => void;
  onOpenStudio: () => void;
}

/**
 * Generate intelligent default charts based on dataset columns
 */
export function generateDefaultCharts(columns: ColumnDefinition[]): ChartConfig[] {
  const stringCols = columns.filter((c) => c.type === 'string');
  const numberCols = columns.filter((c) => c.type === 'number');
  const dateCol = columns.find((c) => c.type === 'date');

  const configs: ChartConfig[] = [];

  const primaryCategory = stringCols[0]?.name || 'Category';
  const secondaryCategory = stringCols[1]?.name || stringCols[0]?.name || 'Segment';
  const primaryMetric = numberCols[0]?.name || 'Value';
  const secondaryMetric = numberCols[1]?.name;
  const tertiaryMetric = numberCols[2]?.name;

  // 1. Primary Dimension Trend / Hero Area Chart
  if (dateCol && primaryMetric) {
    configs.push({
      id: 'chart-line-trend',
      title: `${primaryMetric} Momentum Trends`,
      type: 'area',
      xAxisKey: dateCol.name,
      yAxisKeys: secondaryMetric ? [primaryMetric, secondaryMetric] : [primaryMetric],
      aggregation: 'sum',
      sortBy: 'label-asc',
      curveType: 'monotone',
      showGrid: true,
    });
  } else if (primaryCategory && primaryMetric) {
    configs.push({
      id: 'chart-bar-primary',
      title: `${primaryMetric} by ${primaryCategory}`,
      type: 'bar',
      xAxisKey: primaryCategory,
      yAxisKeys: secondaryMetric ? [primaryMetric, secondaryMetric] : [primaryMetric],
      aggregation: 'sum',
      sortBy: 'value-desc',
      topN: 8,
      showGrid: true,
      showLegend: true,
    });
  }

  // 2. Proportional Share Donut / Pie Chart
  if (primaryCategory && primaryMetric) {
    configs.push({
      id: 'chart-donut-share',
      title: `${primaryMetric} Distribution Share`,
      type: 'donut',
      xAxisKey: primaryCategory,
      yAxisKeys: [primaryMetric],
      aggregation: 'sum',
      sortBy: 'value-desc',
      topN: 6,
      showLegend: true,
    });
  }

  // 3. Multi-Metric Composed Chart
  if (primaryCategory && primaryMetric && secondaryMetric) {
    configs.push({
      id: 'chart-composed-dual',
      title: `${primaryMetric} vs ${secondaryMetric} Analysis`,
      type: 'composed',
      xAxisKey: primaryCategory,
      yAxisKeys: [primaryMetric],
      secondaryYAxisKey: secondaryMetric,
      aggregation: 'sum',
      sortBy: 'value-desc',
      topN: 7,
      showGrid: true,
      showLegend: true,
    });
  } else if (secondaryCategory && primaryMetric) {
    configs.push({
      id: 'chart-area-secondary',
      title: `${primaryMetric} by ${secondaryCategory}`,
      type: 'area',
      xAxisKey: secondaryCategory,
      yAxisKeys: [primaryMetric],
      aggregation: 'sum',
      sortBy: 'value-desc',
      showGrid: true,
    });
  }

  // 4. Secondary Dimension Bar / Stacked
  if (secondaryCategory && primaryMetric && (!dateCol || configs.length < 4)) {
    configs.push({
      id: 'chart-stacked-bar',
      title: `${primaryMetric} Breakdown by ${secondaryCategory}`,
      type: 'bar',
      xAxisKey: secondaryCategory,
      yAxisKeys: [primaryMetric],
      aggregation: 'sum',
      sortBy: 'value-desc',
      topN: 7,
      showGrid: true,
    });
  }

  // 5. Radar / Polar Multivariate Chart
  if (stringCols.length > 0 && numberCols.length >= 2) {
    configs.push({
      id: 'chart-radar-multi',
      title: `Multivariate Metric Scoring`,
      type: 'radar',
      xAxisKey: primaryCategory,
      yAxisKeys: numberCols.slice(0, 3).map((c) => c.name),
      aggregation: 'avg',
      topN: 6,
      showLegend: true,
    });
  }

  // 6. Stacked Area or Alternate View
  if (secondaryCategory && primaryMetric && tertiaryMetric) {
    configs.push({
      id: 'chart-stacked-area',
      title: `${primaryMetric} & ${tertiaryMetric} Combined Flow`,
      type: 'stacked-area',
      xAxisKey: secondaryCategory,
      yAxisKeys: [primaryMetric, tertiaryMetric],
      aggregation: 'sum',
      sortBy: 'value-desc',
      showGrid: true,
    });
  } else if (primaryCategory && secondaryMetric) {
    configs.push({
      id: 'chart-pie-alt',
      title: `${secondaryMetric} by ${primaryCategory}`,
      type: 'pie',
      xAxisKey: primaryCategory,
      yAxisKeys: [secondaryMetric],
      aggregation: 'sum',
      sortBy: 'value-desc',
      topN: 5,
    });
  }

  return configs;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  dataset,
  filteredData,
  theme,
  onExpandChart,
  onOpenStudio,
}) => {
  const [charts, setCharts] = React.useState<ChartConfig[]>(() => generateDefaultCharts(dataset.columns));

  // Update default charts when dataset changes
  React.useEffect(() => {
    setCharts(generateDefaultCharts(dataset.columns));
  }, [dataset.id, dataset.columns]);

  const handleChangeChartType = (chartId: string, newType: ChartConfig['type']) => {
    setCharts((prev) =>
      prev.map((c) => (c.id === chartId ? { ...c, type: newType } : c))
    );
  };

  return (
    <div id="dashboard-grid-container" className="space-y-6">
      {/* Bento Grid Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <LayoutGrid className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Bento Visualizer Matrix
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            {charts.length} Views Active
          </span>
        </div>

        <button
          id="btn-create-custom-chart"
          onClick={onOpenStudio}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Design New Visual</span>
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {charts.map((config, idx) => {
          // Bento layout rhythm: 1st chart spans 8 cols on desktop, 2nd spans 4 cols, next span 6 or 4
          let colSpan = 'md:col-span-6 lg:col-span-4';
          let height = 270;

          if (idx === 0) {
            colSpan = 'md:col-span-12 lg:col-span-8';
            height = 300;
          } else if (idx === 1) {
            colSpan = 'md:col-span-12 lg:col-span-4';
            height = 300;
          } else if (idx === 2) {
            colSpan = 'md:col-span-6 lg:col-span-6';
            height = 280;
          } else if (idx === 3) {
            colSpan = 'md:col-span-6 lg:col-span-6';
            height = 280;
          }

          return (
            <div key={config.id} className={colSpan}>
              <UniversalChart
                config={config}
                data={filteredData}
                theme={theme}
                height={height}
                onExpand={onExpandChart}
                onChangeType={handleChangeChartType}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

