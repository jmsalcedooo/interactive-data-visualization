/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Dataset, FilterCondition, ViewMode, ColorTheme, ChartConfig } from './types';
import { INITIAL_DATASETS } from './data/sampleDatasets';
import { applyFilters } from './utils/dataProcessor';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KPICards } from './components/KPICards';
import { DashboardGrid } from './components/DashboardGrid';
import { ChartStudio } from './components/ChartStudio';
import { DataTable } from './components/DataTable';
import { DataInsights } from './components/DataInsights';
import { DataImportModal } from './components/DataImportModal';
import { ChartModal } from './components/ChartModal';
import { UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  const [datasets, setDatasets] = React.useState<Dataset[]>(INITIAL_DATASETS);
  const [activeDatasetId, setActiveDatasetId] = React.useState<string>(INITIAL_DATASETS[0].id);
  const [filters, setFilters] = React.useState<FilterCondition[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>('dashboard');
  const [theme, setTheme] = React.useState<ColorTheme>('indigo');
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [expandedChart, setExpandedChart] = React.useState<ChartConfig | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = React.useState(true);

  // Active dataset
  const activeDataset = React.useMemo(() => {
    return datasets.find((d) => d.id === activeDatasetId) || datasets[0];
  }, [datasets, activeDatasetId]);

  // Reset filters when dataset changes
  const handleSelectDataset = (dataset: Dataset) => {
    setActiveDatasetId(dataset.id);
    setFilters([]);
  };

  // Import custom dataset handler
  const handleImportDataset = (newDataset: Dataset) => {
    setDatasets((prev) => [newDataset, ...prev]);
    setActiveDatasetId(newDataset.id);
    setFilters([]);
    setShowWelcomeBanner(false);
  };

  // Update active dataset table rows
  const handleUpdateActiveData = (newData: Record<string, any>[]) => {
    setDatasets((prev) =>
      prev.map((d) => (d.id === activeDataset.id ? { ...d, data: newData } : d))
    );
  };

  // Filtered dataset
  const filteredData = React.useMemo(() => {
    return applyFilters(activeDataset.data, filters);
  }, [activeDataset.data, filters]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar & Header */}
      <Header
        datasets={datasets}
        activeDataset={activeDataset}
        onSelectDataset={handleSelectDataset}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        theme={theme}
        onChangeTheme={setTheme}
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* User Data Readiness Callout Banner */}
        {showWelcomeBanner && (
          <div
            id="banner-data-ready"
            className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Interactive Bento Dashboard Active & Ready for Data
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Currently visualizing <span className="font-semibold text-slate-200">{activeDataset.name}</span>. Upload or paste your own CSV/JSON datasets at any time to instantly analyze them across all multi-metric views, distributions, and custom charts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto relative z-10">
              <button
                id="btn-import-data-banner"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-950/40 transition-all"
              >
                <span>Upload / Paste Data</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowWelcomeBanner(false)}
                className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
                title="Dismiss banner"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Filters Bar */}
        <FilterBar
          columns={activeDataset.columns}
          data={activeDataset.data}
          filters={filters}
          onChangeFilters={setFilters}
          filteredCount={filteredData.length}
          totalCount={activeDataset.data.length}
        />

        {/* Metric KPI Summary Cards */}
        <KPICards data={filteredData} columns={activeDataset.columns} />

        {/* Multi-View Dynamic Content */}
        {viewMode === 'dashboard' && (
          <DashboardGrid
            dataset={activeDataset}
            filteredData={filteredData}
            theme={theme}
            onExpandChart={(config) => setExpandedChart(config)}
            onOpenStudio={() => setViewMode('studio')}
          />
        )}

        {viewMode === 'studio' && (
          <ChartStudio
            columns={activeDataset.columns}
            data={filteredData}
            theme={theme}
          />
        )}

        {viewMode === 'table' && (
          <DataTable
            columns={activeDataset.columns}
            data={filteredData}
            onUpdateData={handleUpdateActiveData}
          />
        )}

        {viewMode === 'insights' && (
          <DataInsights
            columns={activeDataset.columns}
            data={filteredData}
          />
        )}
      </main>

      {/* Fullscreen Expand Chart Modal */}
      <ChartModal
        config={expandedChart}
        data={filteredData}
        theme={theme}
        onClose={() => setExpandedChart(null)}
      />

      {/* Data Import Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportDataset={handleImportDataset}
      />
    </div>
  );
}
