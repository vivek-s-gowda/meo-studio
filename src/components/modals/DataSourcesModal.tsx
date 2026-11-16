import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { DataSource, DataSourceField } from '../../types';
import { inferSchema } from '../../constants/dataSources';
import {
  X,
  Database,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink,
  Code2,
  Table,
  Layers,
  Sparkles,
  ArrowRight,
  Sliders,
} from 'lucide-react';

interface DataSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSourcesModal: React.FC<DataSourcesModalProps> = ({ isOpen, onClose }) => {
  const {
    dataSources,
    activeDataSourceId,
    setActiveDataSourceId,
    addDataSource,
    updateDataSource,
    deleteDataSource,
    fetchDataSourceData,
    addComponent,
  } = useBuilder();

  const [selectedId, setSelectedId] = useState<string>(activeDataSourceId || (dataSources[0]?.id ?? ''));
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync selected datasource data to text editor
  const currentSource = dataSources.find((d) => d.id === selectedId) || dataSources[0];

  React.useEffect(() => {
    if (currentSource) {
      setJsonText(JSON.stringify(currentSource.data, null, 2));
      setJsonError(null);
    }
  }, [currentSource?.id]);

  if (!isOpen) return null;

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed)) {
        setJsonError('Data must be a JSON array of objects, e.g. [{ id: 1, name: "..." }]');
      } else {
        setJsonError(null);
      }
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError('Cannot format: invalid JSON syntax');
    }
  };

  const handleSaveJson = () => {
    if (!currentSource) return;
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setJsonError('Data must be an array of objects');
        return;
      }
      const schema = inferSchema(parsed);
      updateDataSource(currentSource.id, {
        data: parsed,
        schema,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setJsonError('Invalid JSON syntax: ' + err.message);
    }
  };

  const handleFetchEndpoint = async () => {
    if (!currentSource) return;
    await fetchDataSourceData(currentSource.id);
    const updated = dataSources.find((d) => d.id === currentSource.id);
    if (updated) {
      setJsonText(JSON.stringify(updated.data, null, 2));
    }
  };

  const handleAddNewSource = () => {
    const newId = addDataSource({
      name: 'New Custom API',
      type: 'mock',
      data: [
        { id: 1, title: 'Item 1', status: 'Active', value: 100 },
        { id: 2, title: 'Item 2', status: 'Pending', value: 250 },
      ],
      schema: [
        { name: 'id', type: 'number', sampleValue: 1 },
        { name: 'title', type: 'string', sampleValue: 'Item 1' },
        { name: 'status', type: 'string', sampleValue: 'Active' },
        { name: 'value', type: 'number', sampleValue: 100 },
      ],
    });
    setSelectedId(newId);
  };

  const handleInsertDataTable = () => {
    if (!currentSource) return;
    const schemaCols = (currentSource.schema || []).slice(0, 4).map((f) => ({
      key: f.name,
      label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
    }));

    addComponent({
      type: 'data-table',
      name: `${currentSource.name} Table`,
      category: 'data-display',
      icon: 'Table',
      description: `Data Table bound to ${currentSource.name}`,
      defaultProps: {
        title: `${currentSource.name}`,
        searchable: true,
        paginated: true,
        pageSize: 5,
        columns: schemaCols.length > 0 ? schemaCols : [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }],
      },
      defaultStyles: {
        width: '100%',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: '1px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      },
      defaultEvents: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Database size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Mock APIs & Dynamic Data Sources</h2>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  {dataSources.length} Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connect REST endpoints or customize mock JSON data to bind directly to UI cards, lists, and tables.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Studio Body: Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Sources List */}
          <div className="w-72 bg-slate-950/60 border-r border-slate-800/80 flex flex-col p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Active Sources
              </span>
              <button
                onClick={handleAddNewSource}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium hover:bg-emerald-500/10 px-2 py-0.5 rounded transition-colors"
              >
                <Plus size={12} />
                <span>Add Source</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {dataSources.map((ds) => {
                const isSelected = (currentSource?.id || '') === ds.id;
                return (
                  <div
                    key={ds.id}
                    onClick={() => {
                      setSelectedId(ds.id);
                      setActiveDataSourceId(ds.id);
                    }}
                    className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Database size={14} />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium truncate">{ds.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                          <span
                            className={`uppercase font-mono px-1 py-0.2 rounded text-[9px] ${
                              ds.type === 'rest'
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {ds.type}
                          </span>
                          <span>• {Array.isArray(ds.data) ? ds.data.length : 0} items</span>
                        </div>
                      </div>
                    </div>

                    {dataSources.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDataSource(ds.id);
                          if (selectedId === ds.id) {
                            setSelectedId(dataSources[0]?.id || '');
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 rounded transition-all"
                        title="Delete data source"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Helper Tip */}
            <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Sparkles size={12} className="text-emerald-400" />
                <span>Dynamic Tokens</span>
              </div>
              <p>
                Use <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">{'{{item.name}}'}</code> or{' '}
                <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">{'{{item.price}}'}</code> in any
                element prop to inject live data!
              </p>
            </div>
          </div>

          {/* Right Panel: Detail, Endpoints & JSON Editor */}
          {currentSource ? (
            <div className="flex-1 flex flex-col bg-slate-900 overflow-y-auto p-5 space-y-4">
              {/* Configuration Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Source Name
                  </label>
                  <input
                    type="text"
                    value={currentSource.name}
                    onChange={(e) => updateDataSource(currentSource.id, { name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Source Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateDataSource(currentSource.id, { type: 'mock' })}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        currentSource.type === 'mock'
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      Mock JSON Data
                    </button>
                    <button
                      onClick={() => updateDataSource(currentSource.id, { type: 'rest' })}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        currentSource.type === 'rest'
                          ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      Live REST API Endpoint
                    </button>
                  </div>
                </div>

                {/* If REST, Endpoint Input */}
                {currentSource.type === 'rest' && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      REST Endpoint URL (GET)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentSource.endpoint || ''}
                        placeholder="https://jsonplaceholder.typicode.com/users"
                        onChange={(e) => updateDataSource(currentSource.id, { endpoint: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={handleFetchEndpoint}
                        disabled={currentSource.isLoading}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
                      >
                        <RefreshCw size={13} className={currentSource.isLoading ? 'animate-spin' : ''} />
                        <span>{currentSource.isLoading ? 'Fetching...' : 'Test & Fetch'}</span>
                      </button>
                    </div>

                    {currentSource.error && (
                      <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                        <AlertCircle size={14} />
                        <span>{currentSource.error}</span>
                      </div>
                    )}
                    {currentSource.lastFetched && !currentSource.error && (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                        <Check size={12} />
                        <span>Connected successfully ({currentSource.data?.length || 0} items retrieved)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Detected Schema Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Detected Schema Fields ({currentSource.schema?.length || 0})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Click to copy token snippet</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(currentSource.schema || []).map((f) => (
                    <button
                      key={f.name}
                      onClick={() => {
                        navigator.clipboard?.writeText(`{{item.${f.name}}}`);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 1500);
                      }}
                      className="group flex items-center gap-1 px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-md text-xs font-mono text-slate-300 hover:text-emerald-300 transition-colors"
                      title={`Type: ${f.type} • Sample: ${JSON.stringify(f.sampleValue)}`}
                    >
                      <span className="text-emerald-400 font-bold">#</span>
                      <span>{f.name}</span>
                      <span className="text-[10px] text-slate-500 font-sans">({f.type})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* JSON Data Editor */}
              <div className="flex-1 flex flex-col min-h-[220px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Mock Data JSON Editor
                    </span>
                    {jsonError ? (
                      <span className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
                        <AlertCircle size={11} /> Invalid JSON
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                        <Check size={11} /> Valid Syntax
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFormatJson}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Code2 size={12} />
                      <span>Format</span>
                    </button>
                    <button
                      onClick={handleSaveJson}
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors flex items-center gap-1"
                    >
                      <Check size={12} />
                      <span>Save JSON</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className="w-full flex-1 min-h-[200px] p-3 bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-700/80 rounded-xl outline-none focus:border-emerald-500 resize-y leading-relaxed"
                  spellCheck={false}
                />
                {saveSuccess && (
                  <p className="text-[11px] text-emerald-400 font-mono mt-1">✓ Saved changes to data source!</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select or create a data source on the left
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isCopied && <span className="text-emerald-400 font-mono">✓ Token copied to clipboard!</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleInsertDataTable}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
            >
              <Table size={14} className="text-emerald-400" />
              <span>Insert Pre-bound Data Table into Canvas</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-blue-500/25"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
