import React, { useState } from 'react';
import { COMPONENT_CATALOG } from '../../constants/componentCatalog';
import { ComponentCategory, ComponentDefinition } from '../../types';
import { useBuilder } from '../../context/BuilderContext';
import { DynamicIcon } from '../ui/Icons';
import { Search, Plus, Layers, Sparkles } from 'lucide-react';

const CATEGORIES: { id: ComponentCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'forms', label: 'Form Controls' },
  { id: 'layout', label: 'Layout' },
  { id: 'typography', label: 'Typography' },
  { id: 'data-display', label: 'Display' },
  { id: 'feedback', label: 'Feedback' },
];

export const LeftSidebar: React.FC = () => {
  const { addComponent } = useBuilder();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');

  const filteredComponents = COMPONENT_CATALOG.filter((comp) => {
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
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">UI Components</h2>
              <p className="text-[11px] text-slate-400">Material Design Palette</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            {filteredComponents.length} items
          </span>
        </div>

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
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Draggable Component List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
        {filteredComponents.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">No components match your search.</div>
        ) : (
          filteredComponents.map((comp) => (
            <div
              key={comp.type}
              draggable
              onDragStart={(e) => handleDragStart(e, comp)}
              className="group flex items-start gap-3 p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:shadow-lg select-none"
            >
              {/* Component Icon */}
              <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white transition-colors shrink-0">
                <DynamicIcon name={comp.icon} size={16} />
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                    {comp.name}
                  </span>
                  <button
                    onClick={() => addComponent(comp)}
                    title="Click to add to canvas"
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white transition-all text-[10px]"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{comp.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Helper Note */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>💡 Drag & drop onto playground</span>
        <span className="text-blue-400 font-mono text-[10px]">Material 3</span>
      </div>
    </aside>
  );
};
