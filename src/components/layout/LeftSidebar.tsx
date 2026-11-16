import React, { useState } from 'react';
import { COMPONENT_CATALOG } from '../../constants/componentCatalog';
import { ComponentCategory, ComponentDefinition } from '../../types';
import { useBuilder } from '../../context/BuilderContext';
import { DynamicIcon } from '../ui/Icons';
import { Search, Plus, Layers, Sparkles, Trash2, Wand2 } from 'lucide-react';

const CATEGORIES: { id: ComponentCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'custom', label: 'Custom' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'forms', label: 'Form Controls' },
  { id: 'layout', label: 'Layout' },
  { id: 'typography', label: 'Typography' },
  { id: 'data-display', label: 'Display' },
  { id: 'feedback', label: 'Feedback' },
];

export const LeftSidebar: React.FC = () => {
  const { addComponent, customComponents, deleteCustomComponent, setIsCreateComponentOpen } =
    useBuilder();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');

  // Combined Catalog: Built-in + User's Dynamic Custom Components
  const allComponents = [...customComponents, ...COMPONENT_CATALOG];

  const filteredComponents = allComponents.filter((comp) => {
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    e.dataTransfer.setData('application/json', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-72 h-full bg-[#0d1322] border-r border-slate-800 flex flex-col select-none z-10">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">UI Components</h2>
              <p className="text-[11px] text-slate-400">Material & Dynamic Palette</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            {filteredComponents.length} items
          </span>
        </div>

        {/* Dynamic Component Creator Button */}
        <button
          onClick={() => setIsCreateComponentOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-blue-600/30 hover:from-purple-600/50 hover:via-indigo-600/50 hover:to-blue-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold shadow-sm transition-all active:scale-95 group"
        >
          <Sparkles size={14} className="text-purple-300 group-hover:rotate-12 transition-transform" />
          <span>+ Create Custom Component</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search controls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-3 py-2 border-b border-slate-800 overflow-x-auto flex gap-1.5 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isCustomTab = cat.id === 'custom';
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? isCustomTab
                    ? 'bg-purple-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              {isCustomTab && customComponents.length > 0 && (
                <span className="text-[9px] bg-purple-400/30 text-purple-200 px-1 rounded-full font-mono">
                  {customComponents.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Draggable Component List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
        {filteredComponents.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            {selectedCategory === 'custom' ? (
              <div className="space-y-3">
                <p>No custom components created yet.</p>
                <button
                  onClick={() => setIsCreateComponentOpen(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium inline-block"
                >
                  Create Your First Component
                </button>
              </div>
            ) : (
              'No components match your search.'
            )}
          </div>
        ) : (
          filteredComponents.map((comp) => {
            const isUserCustom = comp.isCustom || comp.category === 'custom';
            return (
              <div
                key={comp.type}
                draggable
                onDragStart={(e) => handleDragStart(e, comp)}
                className={`group flex items-start gap-3 p-2.5 border rounded-xl cursor-grab active:cursor-grabbing transition-all hover:shadow-lg select-none ${
                  isUserCustom
                    ? 'bg-purple-950/20 hover:bg-purple-900/30 border-purple-800/40 hover:border-purple-500/60'
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-blue-500/50'
                }`}
              >
                {/* Component Icon */}
                <div
                  className={`p-2 rounded-lg transition-colors shrink-0 ${
                    isUserCustom
                      ? 'bg-purple-900/50 group-hover:bg-purple-600 text-purple-300 group-hover:text-white'
                      : 'bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white'
                  }`}
                >
                  <DynamicIcon name={comp.icon} size={16} />
                </div>

                {/* Title & Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {comp.name}
                      </span>
                      {isUserCustom && (
                        <span className="text-[9px] bg-purple-500/30 text-purple-300 px-1 py-0.2 rounded font-mono font-medium">
                          CUSTOM
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isUserCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete custom component "${comp.name}"?`)) {
                              deleteCustomComponent(comp.type);
                            }
                          }}
                          title="Delete custom component"
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-red-400 transition-all text-[10px]"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => addComponent(comp)}
                        title="Click to add to canvas"
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white transition-all text-[10px]"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{comp.description}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Helper Note */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>💡 Drag & drop onto canvas</span>
        <span className="text-purple-400 font-mono text-[10px]">
          {customComponents.length} Custom
        </span>
      </div>
    </aside>
  );
};
