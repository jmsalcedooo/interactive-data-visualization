import React from 'react';
import { ColumnDefinition, FilterCondition } from '../types';
import { Search, Filter, RotateCcw, ChevronDown, Check } from 'lucide-react';

interface FilterBarProps {
  columns: ColumnDefinition[];
  data: Record<string, any>[];
  filters: FilterCondition[];
  onChangeFilters: (filters: FilterCondition[]) => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  columns,
  data,
  filters,
  onChangeFilters,
  filteredCount,
  totalCount,
}) => {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  // Global search input
  const globalSearchFilter = filters.find((f) => f.column === '__global__');
  const searchText = globalSearchFilter?.searchText || '';

  const handleSearchChange = (val: string) => {
    const nextFilters = filters.filter((f) => f.column !== '__global__');
    if (val.trim()) {
      nextFilters.push({
        column: '__global__',
        type: 'string',
        searchText: val,
      });
    }
    onChangeFilters(nextFilters);
  };

  // Get distinct values for top categorical columns
  const categoricalCols = React.useMemo(() => {
    return columns.filter((c) => c.type === 'string' && c.distinctCount > 1 && c.distinctCount <= 25);
  }, [columns]);

  const getDistinctValues = (colName: string): string[] => {
    const set = new Set<string>();
    for (const r of data) {
      if (r[colName] !== null && r[colName] !== undefined) {
        set.add(String(r[colName]));
      }
    }
    return Array.from(set).sort();
  };

  const handleToggleCategory = (colName: string, value: string) => {
    const existing = filters.find((f) => f.column === colName);
    let updatedCategories: string[] = [];

    if (existing && existing.selectedCategories) {
      if (existing.selectedCategories.includes(value)) {
        updatedCategories = existing.selectedCategories.filter((v) => v !== value);
      } else {
        updatedCategories = [...existing.selectedCategories, value];
      }
    } else {
      updatedCategories = [value];
    }

    const nextFilters = filters.filter((f) => f.column !== colName);
    if (updatedCategories.length > 0) {
      nextFilters.push({
        column: colName,
        type: 'string',
        selectedCategories: updatedCategories,
      });
    }
    onChangeFilters(nextFilters);
  };

  const clearAllFilters = () => {
    onChangeFilters([]);
  };

  const hasActiveFilters = filters.length > 0;

  return (
    <div id="filter-bar" className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 mb-6 shadow-lg backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-global-search"
            type="text"
            placeholder="Search records, dimensions, categories..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        {/* Categorical filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {categoricalCols.slice(0, 4).map((col) => {
            const distinctVals = getDistinctValues(col.name);
            const activeFilter = filters.find((f) => f.column === col.name);
            const selectedCount = activeFilter?.selectedCategories?.length || 0;
            const isOpen = activeDropdown === col.name;

            return (
              <div key={col.name} className="relative">
                <button
                  id={`btn-filter-dropdown-${col.name}`}
                  onClick={() => setActiveDropdown(isOpen ? null : col.name)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                    selectedCount > 0
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-xs'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Filter className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[120px]">{col.name}</span>
                  {selectedCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {selectedCount}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                </button>

                {isOpen && (
                  <div
                    id={`dropdown-menu-${col.name}`}
                    className="absolute z-40 mt-2 left-0 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 max-h-64 overflow-y-auto backdrop-blur-xl"
                  >
                    <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-widest border-b border-slate-800 pb-1.5 mb-1">
                      Filter {col.name}
                    </div>
                    <div className="space-y-0.5">
                      {distinctVals.map((val) => {
                        const isSelected = activeFilter?.selectedCategories?.includes(val);
                        return (
                          <button
                            key={val}
                            onClick={() => handleToggleCategory(col.name, val)}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
                          >
                            <span className="truncate pr-2">{val}</span>
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
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
                )}
              </div>
            );
          })}

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/30 transition-colors"
              title="Clear all active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Counter summary */}
        <div className="text-xs text-slate-400 shrink-0 font-medium">
          Showing <span className="font-bold text-white">{filteredCount}</span> of {totalCount} records
        </div>
      </div>
    </div>
  );
};

