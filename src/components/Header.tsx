import React from 'react';
import { Dataset, ViewMode, ColorTheme } from '../types';
import { THEME_PALETTES } from '../utils/themeColors';
import {
  LayoutDashboard,
  Sliders,
  Table as TableIcon,
  Sparkles,
  Upload,
  Database,
  Palette,
  ChevronDown,
  Activity,
  Check,
} from 'lucide-react';

interface HeaderProps {
  datasets: Dataset[];
  activeDataset: Dataset;
  onSelectDataset: (dataset: Dataset) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  theme: ColorTheme;
  onChangeTheme: (theme: ColorTheme) => void;
  onOpenImportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  datasets,
  activeDataset,
  onSelectDataset,
  viewMode,
  onChangeViewMode,
  theme,
  onChangeTheme,
  onOpenImportModal,
}) => {
  const [showDatasetMenu, setShowDatasetMenu] = React.useState(false);
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);

  const views: { id: ViewMode; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Bento Dashboard', icon: LayoutDashboard },
    { id: 'studio', label: 'Chart Studio', icon: Sliders },
    { id: 'table', label: 'Data Matrix', icon: TableIcon },
    { id: 'insights', label: 'Intelligence', icon: Sparkles },
  ];

  return (
    <header id="main-header" className="bg-[#020617] border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Dataset Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                  Nexus<span className="text-indigo-400">Lens</span>
                </h1>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-semibold">
                  Bento Grid Analytics
                </p>
              </div>
            </div>

            {/* Active Dataset Dropdown */}
            <div className="relative">
              <button
                id="btn-select-dataset-dropdown"
                onClick={() => {
                  setShowDatasetMenu(!showDatasetMenu);
                  setShowThemeMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-all hover:border-slate-700 shadow-xs"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span className="max-w-[140px] sm:max-w-[200px] truncate">{activeDataset.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showDatasetMenu && (
                <div
                  id="menu-dataset-list"
                  className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-xl"
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                    Select Data Source
                  </div>
                  {datasets.map((ds) => (
                    <button
                      key={ds.id}
                      onClick={() => {
                        onSelectDataset(ds);
                        setShowDatasetMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col ${
                        ds.id === activeDataset.id
                          ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                      }`}
                    >
                      <span className="truncate text-white font-medium">{ds.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                        {ds.data.length} records • {ds.columns.length} columns
                      </span>
                    </button>
                  ))}
                  <div className="pt-2 border-t border-slate-800 mt-1">
                    <button
                      onClick={() => {
                        setShowDatasetMenu(false);
                        onOpenImportModal();
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs text-indigo-400 hover:bg-indigo-500/10 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>+ Import New Data (CSV / JSON)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Tools: Import Data Button & Theme Picker */}
          <div className="flex items-center gap-2.5">
            {/* Primary Import Data Button */}
            <button
              id="btn-import-data-header"
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Import Data</span>
              <span className="xs:hidden">Import</span>
            </button>

            {/* Theme color switcher */}
            <div className="relative">
              <button
                id="btn-theme-switcher"
                onClick={() => {
                  setShowThemeMenu(!showThemeMenu);
                  setShowDatasetMenu(false);
                }}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors"
                title="Bento Palette Selector"
              >
                <Palette className="w-4 h-4 text-indigo-400" />
              </button>

              {showThemeMenu && (
                <div
                  id="menu-theme-palette"
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-xl"
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                    Chart Color Accent
                  </div>
                  {Object.entries(THEME_PALETTES).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onChangeTheme(key as ColorTheme);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                        theme === key
                          ? 'bg-indigo-500/20 font-semibold text-white border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <span>{item.name}</span>
                      <div className="flex items-center gap-1">
                        {item.colors.slice(0, 3).map((c, i) => (
                          <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile / System Node Avatar Badge */}
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shadow-xs">
              JD
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-800/80 overflow-x-auto py-2.5 scrollbar-none">
          {views.map((v) => {
            const Icon = v.icon;
            const isActive = viewMode === v.id;
            return (
              <button
                key={v.id}
                id={`nav-tab-${v.id}`}
                onClick={() => onChangeViewMode(v.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

