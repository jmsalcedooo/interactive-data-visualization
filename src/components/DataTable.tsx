import React from 'react';
import { ColumnDefinition } from '../types';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Plus,
  Trash2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { exportToCSV, exportToJSON, formatMetricNumber } from '../utils/dataProcessor';

interface DataTableProps {
  columns: ColumnDefinition[];
  data: Record<string, any>[];
  onUpdateData: (newData: Record<string, any>[]) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ columns, data, onUpdateData }) => {
  const [search, setSearch] = React.useState('');
  const [sortCol, setSortCol] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(15);
  const [showAddRowModal, setShowAddRowModal] = React.useState(false);
  const [newRowData, setNewRowData] = React.useState<Record<string, any>>({});

  const handleSort = (colName: string) => {
    if (sortCol === colName) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortCol(null);
        setSortDir('asc');
      }
    } else {
      setSortCol(colName);
      setSortDir('asc');
    }
  };

  // Filtered & sorted records
  const processedData = React.useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) => String(val ?? '').toLowerCase().includes(q))
      );
    }

    if (sortCol) {
      result.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }
        return sortDir === 'asc'
          ? String(valA ?? '').localeCompare(String(valB ?? ''))
          : String(valB ?? '').localeCompare(String(valA ?? ''));
      });
    }

    return result;
  }, [data, search, sortCol, sortDir]);

  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const pagedRows = processedData.slice(page * pageSize, (page + 1) * pageSize);

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedRow: Record<string, any> = {};
    for (const col of columns) {
      const rawVal = newRowData[col.name];
      if (col.type === 'number') {
        formattedRow[col.name] = rawVal !== undefined && rawVal !== '' ? Number(rawVal) : 0;
      } else {
        formattedRow[col.name] = rawVal ?? '';
      }
    }

    onUpdateData([formattedRow, ...data]);
    setNewRowData({});
    setShowAddRowModal(false);
  };

  const handleDeleteRow = (index: number) => {
    const globalIdx = page * pageSize + index;
    const next = [...processedData];
    next.splice(globalIdx, 1);
    onUpdateData(next);
  };

  return (
    <div id="data-table-container" className="bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Top action toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-table-search"
              type="text"
              placeholder="Search in data records..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-table-row"
            onClick={() => setShowAddRowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>
          <button
            id="btn-download-csv"
            onClick={() => exportToCSV(processedData, 'dataset.csv')}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>
          <button
            id="btn-download-json"
            onClick={() => exportToJSON(processedData, 'dataset.json')}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3.5 w-12 text-slate-500">#</th>
              {columns.map((col) => {
                const isSorted = sortCol === col.name;
                return (
                  <th
                    key={col.name}
                    onClick={() => handleSort(col.name)}
                    className="px-4 py-3.5 cursor-pointer hover:bg-slate-900 text-slate-300 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{col.name}</span>
                      <span className="text-[9px] font-mono text-indigo-400/80 lowercase">({col.type})</span>
                      <span className="text-slate-400 ml-auto">
                        {isSorted ? (
                          sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-400" /> : <ArrowDown className="w-3 h-3 text-indigo-400" />
                        ) : (
                          <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th className="px-4 py-3.5 w-12 text-center text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-slate-500">
                  No records match your query.
                </td>
              </tr>
            ) : (
              pagedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">{page * pageSize + idx + 1}</td>
                  {columns.map((col) => {
                    const val = row[col.name];
                    return (
                      <td key={col.name} className="px-4 py-3 truncate max-w-[220px]" title={String(val ?? '')}>
                        {col.type === 'number' && typeof val === 'number' ? (
                          <span className="font-mono text-slate-200 font-medium">{formatMetricNumber(val, col.name)}</span>
                        ) : (
                          <span className="text-slate-300">{String(val ?? '-')}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteRow(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-600">|</span>
          <span>
            {processedData.length > 0 ? page * pageSize + 1 : 0} -{' '}
            {Math.min((page + 1) * pageSize, processedData.length)} of {processedData.length} records
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-slate-300 font-mono text-xs">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Row Modal */}
      {showAddRowModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white tracking-tight">Add New Data Record</h3>
            <form onSubmit={handleAddRow} className="space-y-3.5">
              {columns.map((col) => (
                <div key={col.name}>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {col.name} <span className="text-slate-500 font-normal">({col.type})</span>
                  </label>
                  <input
                    type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                    step="any"
                    value={newRowData[col.name] ?? ''}
                    onChange={(e) => setNewRowData({ ...newRowData, [col.name]: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder={`Enter ${col.name}...`}
                  />
                </div>
              ))}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddRowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

