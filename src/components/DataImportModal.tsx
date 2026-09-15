import React from 'react';
import { Dataset, ColumnDefinition } from '../types';
import { parseCSVData, parseJSONData } from '../utils/dataProcessor';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles, Database } from 'lucide-react';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDataset: (newDataset: Dataset) => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({ isOpen, onClose, onImportDataset }) => {
  const [activeTab, setActiveTab] = React.useState<'upload' | 'paste'>('upload');
  const [datasetName, setDatasetName] = React.useState('My Custom Dataset');
  const [datasetDesc, setDatasetDesc] = React.useState('User-imported analytics data');
  const [rawText, setRawText] = React.useState('');
  const [dragActive, setDragActive] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [previewData, setPreviewData] = React.useState<{ data: Record<string, any>[]; columns: ColumnDefinition[] } | null>(null);

  if (!isOpen) return null;

  const processImportString = (content: string, nameHint?: string) => {
    setErrorMsg(null);
    try {
      const trimmed = content.trim();
      if (!trimmed) {
        setErrorMsg('Data source is empty.');
        return;
      }

      let parsedResult;
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        parsedResult = parseJSONData(trimmed);
      } else {
        parsedResult = parseCSVData(trimmed, nameHint);
      }

      if (!parsedResult.data || parsedResult.data.length === 0) {
        setErrorMsg('Could not extract any rows from this data. Please verify the format.');
        return;
      }

      setPreviewData(parsedResult);
      if (nameHint) {
        setDatasetName(nameHint.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      setErrorMsg(`Parsing error: ${err.message || 'Invalid CSV or JSON syntax.'}`);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setRawText(text);
        processImportString(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePasteChange = (text: string) => {
    setRawText(text);
    if (text.trim().length > 10) {
      processImportString(text);
    } else {
      setPreviewData(null);
    }
  };

  const handleConfirmImport = () => {
    if (!previewData || previewData.data.length === 0) {
      setErrorMsg('Please upload or paste valid data before continuing.');
      return;
    }

    const newDataset: Dataset = {
      id: `custom_${Date.now()}`,
      name: datasetName.trim() || 'Custom Dataset',
      description: datasetDesc.trim() || 'User uploaded data source',
      iconName: 'Database',
      data: previewData.data,
      columns: previewData.columns,
    };

    onImportDataset(newDataset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        id="data-import-modal"
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Import Custom Dataset
              </h2>
              <p className="text-xs text-slate-400">
                Supply your CSV or JSON data to visualize it across all bento charts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'upload' ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File (.csv, .json)</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'paste' ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Raw Data</span>
          </button>
        </div>

        {/* Upload Mode */}
        {activeTab === 'upload' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-indigo-500/50 bg-slate-950/60'
            }`}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept=".csv,.json,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">
              Click to select or drag & drop your file here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports Comma-Separated Values (.csv) or JSON array files
            </p>
          </div>
        )}

        {/* Paste Mode */}
        {activeTab === 'paste' && (
          <div>
            <textarea
              id="textarea-raw-data"
              rows={6}
              value={rawText}
              onChange={(e) => handlePasteChange(e.target.value)}
              placeholder="Paste your CSV content (e.g. Month,Sales,Profit) or JSON array of objects here..."
              className="w-full text-xs font-mono bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        {/* Error message if any */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/80 text-red-300 text-xs rounded-2xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preview Detected Columns & Data */}
        {previewData && (
          <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ready to load: {previewData.data.length} rows & {previewData.columns.length} columns detected</span>
              </div>
            </div>

            {/* Inferred Column badges */}
            <div className="flex flex-wrap gap-1.5">
              {previewData.columns.map((col) => (
                <span
                  key={col.name}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 flex items-center gap-1.5"
                >
                  <span className="font-semibold text-white">{col.name}</span>
                  <span className="text-[9px] uppercase px-1 rounded bg-slate-950 text-indigo-400 font-mono border border-slate-800">
                    {col.type}
                  </span>
                </span>
              ))}
            </div>

            {/* Dataset metadata inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  Dataset Name
                </label>
                <input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-2 text-white focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  Description
                </label>
                <input
                  type="text"
                  value={datasetDesc}
                  onChange={(e) => setDatasetDesc(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl p-2 text-white focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-import-data"
            onClick={handleConfirmImport}
            disabled={!previewData}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-indigo-900/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Into Bento Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

