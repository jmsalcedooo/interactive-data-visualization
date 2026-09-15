import Papa from 'papaparse';
import { ColumnDefinition, DataType, AggregationType, FilterCondition, ChartConfig } from '../types';

/**
 * Infer data type of a value
 */
export function inferType(val: any): DataType {
  if (val === null || val === undefined || val === '') return 'string';
  if (typeof val === 'number') return 'number';
  if (typeof val === 'boolean') return 'boolean';

  const str = String(val).trim();

  // Boolean
  if (str.toLowerCase() === 'true' || str.toLowerCase() === 'false') {
    return 'boolean';
  }

  // Number test (handle currency, commas, percentages if clean)
  const cleanNum = str.replace(/^[$,€£¥]/, '').replace(/%$/, '').replace(/,/g, '');
  if (!isNaN(Number(cleanNum)) && cleanNum !== '' && !isNaN(parseFloat(cleanNum))) {
    return 'number';
  }

  // Date test (YYYY-MM-DD, MM/DD/YYYY, ISO, etc.)
  if (
    /^\d{4}-\d{1,2}-\d{1,2}/.test(str) ||
    /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(str) ||
    (str.length >= 7 && !isNaN(Date.parse(str)) && (str.includes('-') || str.includes('/') || str.includes('T')))
  ) {
    return 'date';
  }

  return 'string';
}

/**
 * Analyze all columns in a dataset and detect their types, distinct count, min/max
 */
export function analyzeColumns(data: Record<string, any>[]): ColumnDefinition[] {
  if (!data || data.length === 0) return [];

  const keys = Object.keys(data[0] || {});
  const sampleSize = Math.min(data.length, 100);

  return keys.map((key) => {
    const typeVotes: Record<DataType, number> = {
      string: 0,
      number: 0,
      date: 0,
      boolean: 0,
    };

    const uniqueSet = new Set<string>();
    let numMin = Infinity;
    let numMax = -Infinity;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const val = row[key];

      if (val !== null && val !== undefined && val !== '') {
        uniqueSet.add(String(val));
        if (i < sampleSize) {
          const detected = inferType(val);
          typeVotes[detected]++;
        }

        const cleanVal = typeof val === 'string'
          ? Number(val.replace(/^[$,€£¥]/, '').replace(/%$/, '').replace(/,/g, ''))
          : Number(val);

        if (!isNaN(cleanVal)) {
          if (cleanVal < numMin) numMin = cleanVal;
          if (cleanVal > numMax) numMax = cleanVal;
        }
      }
    }

    let dominantType: DataType = 'string';
    let maxVote = -1;

    for (const [t, vote] of Object.entries(typeVotes)) {
      if (vote > maxVote) {
        maxVote = vote;
        dominantType = t as DataType;
      }
    }

    const sampleValues = data.slice(0, 5).map((row) => row[key] ?? null);

    return {
      name: key,
      type: dominantType,
      sampleValues,
      distinctCount: uniqueSet.size,
      min: numMin !== Infinity ? numMin : undefined,
      max: numMax !== -Infinity ? numMax : undefined,
    };
  });
}

/**
 * Clean & normalize rows by converting number strings to numbers, etc.
 */
export function cleanDatasetRows(data: Record<string, any>[], columns: ColumnDefinition[]): Record<string, any>[] {
  const numberCols = new Set(columns.filter((c) => c.type === 'number').map((c) => c.name));

  return data.map((row) => {
    const cleanRow: Record<string, any> = { ...row };
    for (const col of Object.keys(row)) {
      if (numberCols.has(col)) {
        const val = row[col];
        if (typeof val === 'number') {
          cleanRow[col] = isNaN(val) ? 0 : val;
        } else if (typeof val === 'string') {
          const numStr = val.replace(/^[$,€£¥]/, '').replace(/%$/, '').replace(/,/g, '').trim();
          const parsed = parseFloat(numStr);
          cleanRow[col] = isNaN(parsed) ? 0 : parsed;
        } else {
          cleanRow[col] = 0;
        }
      }
    }
    return cleanRow;
  });
}

/**
 * Filter data using multiple conditions
 */
export function applyFilters(data: Record<string, any>[], filters: FilterCondition[]): Record<string, any>[] {
  if (!filters || filters.length === 0) return data;

  return data.filter((row) => {
    for (const f of filters) {
      const val = row[f.column];

      // Global search / column search text
      if (f.searchText && f.searchText.trim() !== '') {
        const searchTarget = String(val ?? '').toLowerCase();
        if (!searchTarget.includes(f.searchText.toLowerCase().trim())) {
          return false;
        }
      }

      // Categorical multi-select
      if (f.selectedCategories && f.selectedCategories.length > 0) {
        const strVal = String(val ?? '');
        if (!f.selectedCategories.includes(strVal)) {
          return false;
        }
      }

      // Numeric range
      if (f.type === 'number') {
        const numVal = Number(val);
        if (!isNaN(numVal)) {
          if (f.numMin !== undefined && numVal < f.numMin) return false;
          if (f.numMax !== undefined && numVal > f.numMax) return false;
        }
      }

      // Date range
      if (f.type === 'date') {
        if (val) {
          const rowTime = new Date(val).getTime();
          if (!isNaN(rowTime)) {
            if (f.dateStart && rowTime < new Date(f.dateStart).getTime()) return false;
            if (f.dateEnd && rowTime > new Date(f.dateEnd).getTime()) return false;
          }
        }
      }
    }
    return true;
  });
}

/**
 * Aggregation logic for an array of numbers
 */
export function aggregateValues(values: number[], agg: AggregationType): number {
  if (values.length === 0) return 0;
  switch (agg) {
    case 'sum':
      return values.reduce((acc, v) => acc + (isNaN(v) ? 0 : v), 0);
    case 'avg': {
      const sum = values.reduce((acc, v) => acc + (isNaN(v) ? 0 : v), 0);
      return Math.round((sum / values.length) * 100) / 100;
    }
    case 'count':
      return values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'median': {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    default:
      return values.reduce((acc, v) => acc + (isNaN(v) ? 0 : v), 0);
  }
}

/**
 * Group & Aggregate data for chart rendering
 */
export function aggregateChartData(
  data: Record<string, any>[],
  config: ChartConfig
): { name: string; [key: string]: any }[] {
  if (!data || data.length === 0 || !config.xAxisKey || !config.yAxisKeys || config.yAxisKeys.length === 0) {
    return [];
  }

  const { xAxisKey, yAxisKeys, aggregation = 'sum', sortBy = 'none', topN, secondaryYAxisKey } = config;
  const allYKeys = secondaryYAxisKey ? [...yAxisKeys, secondaryYAxisKey] : yAxisKeys;

  // Group by X-Axis values
  const groups: Record<string, Record<string, number[]>> = {};

  for (const row of data) {
    const rawX = row[xAxisKey];
    const xVal = rawX === null || rawX === undefined || rawX === '' ? '(Blank)' : String(rawX);

    if (!groups[xVal]) {
      groups[xVal] = {};
      for (const yKey of allYKeys) {
        groups[xVal][yKey] = [];
      }
    }

    for (const yKey of allYKeys) {
      const val = row[yKey];
      const num = typeof val === 'number' ? val : parseFloat(String(val));
      if (!isNaN(num)) {
        groups[xVal][yKey].push(num);
      }
    }
  }

  // Compute aggregate for each group
  let result: { name: string; [key: string]: any }[] = Object.entries(groups).map(([groupKey, yKeyMap]) => {
    const item: { name: string; [key: string]: any } = { name: groupKey };
    for (const yKey of allYKeys) {
      item[yKey] = aggregateValues(yKeyMap[yKey] || [], aggregation);
    }
    return item;
  });

  // Sorting
  const primaryY = yAxisKeys[0];
  if (sortBy === 'value-desc') {
    result.sort((a, b) => (b[primaryY] ?? 0) - (a[primaryY] ?? 0));
  } else if (sortBy === 'value-asc') {
    result.sort((a, b) => (a[primaryY] ?? 0) - (b[primaryY] ?? 0));
  } else if (sortBy === 'label-asc') {
    result.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  } else if (sortBy === 'label-desc') {
    result.sort((a, b) => String(b.name).localeCompare(String(a.name)));
  }

  // Top N truncation
  if (topN && topN > 0 && result.length > topN) {
    result = result.slice(0, topN);
  }

  return result;
}

/**
 * Format numbers for display (currency, percentages, abbreviated thousands/millions)
 */
export function formatMetricNumber(val: number | undefined | null, columnName?: string): string {
  if (val === null || val === undefined || isNaN(val)) return '0';

  const colLower = (columnName || '').toLowerCase();
  const isCurrency = colLower.includes('revenue') || colLower.includes('cost') || colLower.includes('profit') || colLower.includes('price') || colLower.includes('sales') || colLower.includes('budget') || colLower.includes('$') || colLower.includes('mrr');
  const isPercent = colLower.includes('rate') || colLower.includes('percent') || colLower.includes('%') || colLower.includes('share') || colLower.includes('margin');

  if (isPercent) {
    return `${val.toFixed(1)}%`;
  }

  const prefix = isCurrency ? '$' : '';

  if (Math.abs(val) >= 1_000_000_000) {
    return `${prefix}${(val / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(val) >= 1_000_000) {
    return `${prefix}${(val / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `${prefix}${(val / 1_000).toFixed(1)}k`;
  }

  return `${prefix}${Number.isInteger(val) ? val : val.toFixed(2)}`;
}

/**
 * Parse CSV string to Dataset
 */
export function parseCSVData(csvString: string, name = 'Imported Dataset'): { data: Record<string, any>[]; columns: ColumnDefinition[] } {
  const parsed = Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const rawData = (parsed.data as Record<string, any>[]).filter((row) => row && Object.keys(row).length > 0);
  const columns = analyzeColumns(rawData);
  const cleanedData = cleanDatasetRows(rawData, columns);

  return { data: cleanedData, columns };
}

/**
 * Parse JSON string to Dataset
 */
export function parseJSONData(jsonString: string): { data: Record<string, any>[]; columns: ColumnDefinition[] } {
  let parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) {
    if (parsed && typeof parsed === 'object') {
      const arrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
      if (arrayKey) {
        parsed = parsed[arrayKey];
      } else {
        parsed = [parsed];
      }
    }
  }

  const columns = analyzeColumns(parsed);
  const cleanedData = cleanDatasetRows(parsed, columns);
  return { data: cleanedData, columns };
}

/**
 * Export data to CSV file download
 */
export function exportToCSV(data: Record<string, any>[], filename = 'dataset_export.csv') {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to JSON file download
 */
export function exportToJSON(data: Record<string, any>[], filename = 'dataset_export.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
