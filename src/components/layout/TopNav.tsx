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
  Boxes,
} from 'lucide-react';

interface TopNavProps {
  onOpenScaffoldModal: () => void;
  onOpenAIModal: () => void;
  onOpenTemplatesModal: () => void;
  onNavigateToLanding?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenScaffoldModal,
  onOpenAIModal,
  onOpenTemplatesModal,
  onNavigateToLanding,
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
    isModularMode,
    toggleModularMode,
  } = useBuilder();

  return (
    <header className="h-14 w-full bg-[#0d1322] border-b border-slate-800 flex items-center justify-between px-4 select-none z-20">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div
          onClick={onNavigateToLanding}
          className={`flex items-center gap-2 ${onNavigateToLanding ? 'cursor-pointer group' : ''}`}
          title={onNavigateToLanding ? '← Return to Meo Landing Page' : 'Meo Studio'}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
            {/* Stylized Cat Paw Brand Logo */}
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
            >
              <ellipse cx="6.3" cy="9.1" rx="1.5" ry="2.15" transform="rotate(-28 6.3 9.1)" />
              <ellipse cx="10.1" cy="6.8" rx="1.65" ry="2.35" transform="rotate(-9 10.1 6.8)" />
              <ellipse cx="13.9" cy="6.8" rx="1.65" ry="2.35" transform="rotate(9 13.9 6.8)" />
              <ellipse cx="17.7" cy="9.1" rx="1.5" ry="2.15" transform="rotate(28 17.7 9.1)" />
              <path d="M 12 12.2 C 11 11.2 8.7 11.2 7.5 12.8 C 6.3 14.3 6.7 16.4 8 18.2 C 9.4 19.8 14.6 19.8 16 18.2 C 17.3 16.4 17.7 14.3 16.5 12.8 C 15.3 11.2 13 11.2 12 12.2 Z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">Meo</h1>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded font-mono font-medium">
                v0.1.0-alpha
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Visual Studio & Framework Scaffolder</p>
          </div>
        </div>

        {/* Templates Picker Button */}
        <button
          onClick={onOpenTemplatesModal}
          title="Starter Templates Gallery: Forms, Dashboards, Settings"
          className="ml-2.5 p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-blue-400 hover:text-white transition-colors flex items-center justify-center shrink-0 active:scale-95"
        >
          <Layers size={14} />
        </button>

        {/* Mock APIs & Data Sources Button */}
        <button
          onClick={() => setIsDataSourcesModalOpen(true)}
          className="ml-1.5 p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-emerald-400 hover:text-white transition-colors flex items-center gap-1 shrink-0 active:scale-95"
          title={`Mock APIs & Data Sources (${dataSources.length} active models)`}
        >
          <Database size={14} />
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded-full font-mono font-semibold">
            {dataSources.length}
          </span>
        </button>

        {/* Componentize UI (Modular Architecture & Route Config) */}
        <button
          onClick={toggleModularMode}
          className={`ml-1.5 p-1.5 rounded-md border text-xs font-medium transition-all flex items-center gap-1 shrink-0 active:scale-95 ${
            isModularMode
              ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300 shadow-sm shadow-indigo-500/10'
              : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white'
          }`}
          title={`Componentize UI: Modular Components & Routes (${isModularMode ? 'ACTIVE' : 'OFF'})`}
        >
          <Boxes size={14} className={isModularMode ? 'text-indigo-400' : 'text-slate-400'} />
          <span
            className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
              isModularMode ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {isModularMode ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Center: Language Porting Dropdown & Viewport Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Language Porting Dropdown */}
        <div
          title="Target Framework for Code Generation & Scaffolding"
          className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 shrink-0"
        >
          <Code2 size={14} className="text-blue-400 shrink-0" />
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
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => setIsPreviewMode(false)}
            title="Edit Mode: Drag & drop controls and style components"
            className={`p-1.5 rounded-md transition-colors ${
              !isPreviewMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setIsPreviewMode(true)}
            title="Interactive Preview: Click to test buttons, inputs & live routing"
            className={`p-1.5 rounded-md transition-colors ${
              isPreviewMode ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play size={13} />
          </button>
        </div>
      </div>

      {/* Right Actions: Undo/Redo, AI Formatter, Scaffold */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5 border-r border-slate-800 pr-1.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Redo2 size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm('Clear the entire playground?')) clearCanvas();
            }}
            title="Clear Canvas Playground"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* AI Assistant */}
        <button
          onClick={onOpenAIModal}
          title="FlexAI Assistant: Layout Formatter & Prompt Stacks"
          className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 border border-purple-500/40 text-purple-200 transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Sparkles size={14} className="text-purple-300" />
        </button>

        {/* Scaffold Project Modal Trigger */}
        <button
          onClick={onOpenScaffoldModal}
          title="Scaffold Full Project: Export ZIP with modular components & router configuration"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md active:scale-95 shrink-0"
        >
          <FolderDown size={14} />
          <span className="hidden xl:inline">Scaffold</span>
        </button>
      </div>
    </header>
  );
};
