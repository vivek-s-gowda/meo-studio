import React, { useEffect, useRef } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import {
  Palette,
  Code2,
  Sliders,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  BoxSelect,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ContextMenu: React.FC = () => {
  const {
    contextMenu,
    setContextMenu,
    setQuickPopup,
    findComponentById,
    duplicateComponent,
    removeComponent,
    moveComponent,
    wrapInContainer,
    saveComponentAsCustom,
  } = useBuilder();

  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };

    if (contextMenu.isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.isOpen, setContextMenu]);

  if (!contextMenu.isOpen || !contextMenu.componentId) return null;

  const component = findComponentById(contextMenu.componentId);
  if (!component) return null;

  const openPopupTab = (tab: 'styles' | 'props' | 'events') => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
    setQuickPopup({
      isOpen: true,
      x: Math.min(contextMenu.x + 20, window.innerWidth - 380),
      y: Math.min(contextMenu.y, window.innerHeight - 520),
      componentId: component.id,
      activeTab: tab,
    });
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
      className="fixed z-50 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 text-xs text-slate-200 backdrop-blur-md animate-scaleIn select-none"
    >
      <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 font-semibold flex items-center justify-between">
        <span className="truncate">{component.name}</span>
        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono">
          {component.type}
        </span>
      </div>

      {/* Main Feature Actions Requested by User */}
      <div className="p-1 space-y-0.5">
        <button
          onClick={() => openPopupTab('styles')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-left font-medium text-slate-100"
        >
          <Palette size={15} className="text-blue-400 group-hover:text-white" />
          <span>Change Styles (Height, Color, Font...)</span>
        </button>

        <button
          onClick={() => openPopupTab('props')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-left font-medium text-slate-100"
        >
          <Sliders size={15} className="text-purple-400 group-hover:text-white" />
          <span>Edit Properties & Content</span>
        </button>

        <button
          onClick={() => openPopupTab('events')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors text-left font-medium text-emerald-300"
        >
          <Code2 size={15} className="text-emerald-400 group-hover:text-white" />
          <span>Bind to JS Functions & Events</span>
        </button>
      </div>

      <div className="my-1 border-t border-slate-800/80" />

      {/* Structure & Hierarchy Actions */}
      <div className="p-1 space-y-0.5">
        <button
          onClick={() => {
            const compName = prompt('Enter a name for this reusable custom component:', component.name);
            if (compName) {
              saveComponentAsCustom(component.id, compName);
              alert(`Component "${compName}" saved to your Custom Palette! You can now drag it from the left sidebar anytime.`);
            }
            setContextMenu((prev) => ({ ...prev, isOpen: false }));
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-purple-600 hover:text-white text-purple-300 text-left transition-colors font-medium"
        >
          <Sparkles size={14} className="text-purple-400" />
          <span>Save as Reusable Component</span>
        </button>

        <button
          onClick={() => {
            wrapInContainer(component.id);
            setContextMenu((prev) => ({ ...prev, isOpen: false }));
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-left transition-colors"
        >
          <BoxSelect size={14} className="text-amber-400" />
          <span>Wrap in Flex Container</span>
        </button>

        <button
          onClick={() => {
            moveComponent(component.id, 'up');
            setContextMenu((prev) => ({ ...prev, isOpen: false }));
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-left transition-colors"
        >
          <ChevronUp size={14} className="text-slate-400" />
          <span>Move Up</span>
        </button>

        <button
          onClick={() => {
            moveComponent(component.id, 'down');
            setContextMenu((prev) => ({ ...prev, isOpen: false }));
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-left transition-colors"
        >
          <ChevronDown size={14} className="text-slate-400" />
          <span>Move Down</span>
        </button>

        <button
          onClick={() => {
            duplicateComponent(component.id);
            setContextMenu((prev) => ({ ...prev, isOpen: false }));
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-left transition-colors"
        >
          <Copy size={14} className="text-slate-400" />
          <span>Duplicate</span>
        </button>
      </div>

      <div className="my-1 border-t border-slate-800/80" />

      <div className="p-1">
        <button
          onClick={() => {
            removeComponent(component.id);
            setContextMenu((prev) => ({ ...prev, isOpen: false }));
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-rose-600/90 hover:text-white text-rose-400 text-left transition-colors font-medium"
        >
          <Trash2 size={14} />
          <span>Delete Component</span>
        </button>
      </div>
    </div>
  );
};
