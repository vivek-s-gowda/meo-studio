import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { TargetLanguage, ViewportMode } from '../../types';
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Play,
  Pencil,
  Undo2,
  Redo2,
  Trash2,
  Sparkles,
  Download,
  FolderDown,
  Layers,
  Code2,
  Check,
  Database,
} from 'lucide-react';

interface TopNavProps {
  onOpenScaffoldModal: () => void;
  onOpenAIModal: () => void;
  onOpenTemplatesModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenScaffoldModal,
  onOpenAIModal,
  onOpenTemplatesModal,
}) => {
  const {
    targetLanguage,
    setTargetLanguage,
    viewportMode,
    setViewportMode,
    isPreviewMode,
    setIsPreviewMode,
    canUndo,
    canRedo,
    undo,
    redo,
    clearCanvas,
    dataSources,
    setIsDataSourcesModalOpen,
  } = useBuilder();

  return (
    <header className="h-14 w-full bg-[#0d1322] border-b border-slate-800 flex items-center justify-between px-4 select-none z-20">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold text-sm tracking-tighter">
            FU
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white">FlexUI</h1>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded font-mono font-medium">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Visual Studio & Framework Scaffolder</p>
          </div>
        </div>

        {/* Templates Picker Button */}
        <button
          onClick={onOpenTemplatesModal}
          className="ml-3 hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <Layers size={13} className="text-blue-400" />
          <span>Templates</span>
        </button>

        {/* Mock APIs & Data Sources Button */}
        <button
          onClick={() => setIsDataSourcesModalOpen(true)}
          className="ml-2 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-colors"
          title="Connect REST endpoints or edit local JSON data models"
        >
          <Database size={13} className="text-emerald-400" />
          <span>Data Sources</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-mono font-semibold">
            {dataSources.length}
          </span>
        </button>
      </div>

      {/* Center: Language Porting Dropdown & Viewport Switcher */}
      <div className="flex items-center gap-4">
        {/* Language Porting Dropdown (Required by User: 'at the top mid keep a dropdown to select the launguage to port the UI to react, angular or Vue') */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1">
          <Code2 size={14} className="text-blue-400 shrink-0" />
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Port UI to:</span>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value as TargetLanguage)}
            className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer pr-1"
          >
            <option value="react" className="bg-slate-900 text-white">
              React (TSX)
            </option>
            <option value="angular" className="bg-slate-900 text-white">
              Angular 17+
            </option>
            <option value="vue" className="bg-slate-900 text-white">
              Vue 3 (SFC)
            </option>
            <option value="html" className="bg-slate-900 text-white">
              HTML / CSS / JS
            </option>
          </select>
        </div>

        {/* Viewport Breakpoint Switcher */}
        <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-slate-400">
          <button
            onClick={() => setViewportMode('desktop')}
            title="Desktop View (1100px)"
            className={`p-1.5 rounded-md transition-colors ${
              viewportMode === 'desktop' ? 'bg-blue-600 text-white' : 'hover:text-slate-200'
            }`}
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setViewportMode('tablet')}
            title="Tablet View (768px)"
            className={`p-1.5 rounded-md transition-colors ${
              viewportMode === 'tablet' ? 'bg-blue-600 text-white' : 'hover:text-slate-200'
            }`}
          >
            <Tablet size={14} />
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            title="Mobile View (375px)"
            className={`p-1.5 rounded-md transition-colors ${
              viewportMode === 'mobile' ? 'bg-blue-600 text-white' : 'hover:text-slate-200'
            }`}
          >
            <Smartphone size={14} />
          </button>
          <button
            onClick={() => setViewportMode('responsive')}
            title="Responsive (100%)"
            className={`p-1.5 rounded-md transition-colors ${
              viewportMode === 'responsive' ? 'bg-blue-600 text-white' : 'hover:text-slate-200'
            }`}
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Mode Toggle: Edit Mode vs Interactive Test Mode */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setIsPreviewMode(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              !isPreviewMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pencil size={12} />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => setIsPreviewMode(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              isPreviewMode ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play size={12} />
            <span className="hidden sm:inline">Interactive</span>
          </button>
        </div>
      </div>

      {/* Right Actions: Undo/Redo, AI Formatter, Scaffold */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-1 border-r border-slate-800 pr-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Redo2 size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm('Clear the entire playground?')) clearCanvas();
            }}
            title="Clear Playground"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* AI Assistant */}
        <button
          onClick={onOpenAIModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 border border-purple-500/40 text-purple-200 text-xs font-medium transition-all shadow-sm active:scale-95"
        >
          <Sparkles size={14} className="text-purple-300" />
          <span className="hidden md:inline">FlexAI Assistant</span>
        </button>

        {/* Scaffold Project Modal Trigger */}
        <button
          onClick={onOpenScaffoldModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md active:scale-95"
        >
          <FolderDown size={14} />
          <span>Scaffold Project</span>
        </button>
      </div>
    </header>
  );
};
