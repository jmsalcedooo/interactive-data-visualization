export type DataType = 'string' | 'number' | 'date' | 'boolean';

export interface ColumnDefinition {
  name: string;
  type: DataType;
  sampleValues: (string | number | boolean | null)[];
  distinctCount: number;
  min?: number;
  max?: number;
}

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';

export type ChartType =
  | 'bar'
  | 'stacked-bar'
  | 'line'
  | 'area'
  | 'stacked-area'
  | 'pie'
  | 'donut'
  | 'radar'
  | 'scatter'
  | 'composed';

export interface ChartConfig {
  id: string;
  title: string;
  description?: string;
  type: ChartType;
  xAxisKey: string;
  yAxisKeys: string[];
  aggregation: AggregationType;
  secondaryYAxisKey?: string;
  sortBy?: 'value-desc' | 'value-asc' | 'label-asc' | 'label-desc' | 'none';
  topN?: number;
  stacked?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  colorPalette?: string;
  curveType?: 'monotone' | 'linear' | 'step';
}

export interface FilterCondition {
  column: string;
  type: DataType;
  selectedCategories?: string[];
  numMin?: number;
  numMax?: number;
  dateStart?: string;
  dateEnd?: string;
  searchText?: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  iconName: string;
  data: Record<string, any>[];
  columns: ColumnDefinition[];
}

export type ViewMode = 'dashboard' | 'studio' | 'table' | 'insights';

export type ColorTheme = 'indigo' | 'emerald' | 'sunset' | 'slate' | 'vibrant';
