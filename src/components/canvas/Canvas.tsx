import React, { useRef } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { CanvasComponent } from './CanvasComponent';
import { ContextMenu } from './ContextMenu';
import { QuickStylePopup } from './QuickStylePopup';
import { ScreenNavBar } from './ScreenNavBar';
import { PlusCircle, Sparkles, Layout } from 'lucide-react';
import { ComponentDefinition } from '../../types';

export const Canvas: React.FC = () => {
  const {
    components,
    viewportMode,
    isPreviewMode,
    draggedComponentId,
    setDraggedComponentId,
    reorderComponent,
    setSelectedComponentId,
    setContextMenu,
    addComponent,
    loadTemplate,
  } = useBuilder();

  const canvasRef = useRef<HTMLDivElement>(null);

  // Viewport width styling
  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
        return '1100px';
      case 'responsive':
      default:
        return '100%';
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).id === 'canvas-viewport') {
      setSelectedComponentId(null);
      setContextMenu((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Drag and Drop into root canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    // Check if an existing internal component was dragged onto the canvas root
    const internalId = draggedComponentId || e.dataTransfer.getData('meo/component-id') || e.dataTransfer.getData('flexui/component-id');
    if (internalId) {
      if (components.length > 0) {
        const lastComponent = components[components.length - 1];
        if (lastComponent.id !== internalId) {
          reorderComponent(internalId, lastComponent.id, 'after');
        }
      }
      setDraggedComponentId(null);
      return;
    }

    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const def: ComponentDefinition = JSON.parse(dataStr);
      addComponent(def, null);
    } catch (err) {
      console.error('Failed to parse dropped component:', err);
    }
  };

  return (
    <div
      ref={canvasRef}
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 h-full bg-[#090d16] canvas-dots overflow-auto relative p-6 flex flex-col items-center justify-start transition-all"
    >
      {/* Screen Navigation & Route Manager Bar */}
      <ScreenNavBar />

      {/* Device Frame Viewport */}
      <div
        id="canvas-viewport"
        style={{
          width: getViewportWidth(),
          maxWidth: '100%',
          minHeight: '85vh',
        }}
        className={`relative transition-all duration-300 rounded-xl bg-[#0d1322] border ${
          isPreviewMode
            ? 'border-emerald-500/40 shadow-2xl ring-1 ring-emerald-500/20'
            : 'border-slate-800 shadow-2xl'
        } p-6 flex flex-col gap-4 select-none`}
      >
        {/* Live Playground Status Banner */}
        <div className="flex items-center justify-between pb-3 mb-1 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isPreviewMode ? 'bg-emerald-400 animate-pulse' : 'bg-blue-500'
              }`}
            />
            <span className="font-medium">
              {isPreviewMode ? 'Interactive Preview Playground (Click & Test Functions)' : 'Visual Builder Playground'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500 uppercase">
            Viewport: {viewportMode} ({getViewportWidth()})
          </span>
        </div>

        {/* Components Rendering */}
        {components.length === 0 ? (
          <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-blue-500 mb-4 border border-slate-700">
              <Layout size={28} />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">Canvas is empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Drag Material components from the left sidebar and drop them here, or pick a starter template.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => loadTemplate('login-card')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
              >
                <Sparkles size={14} />
                <span>Load Login Template</span>
              </button>
              <button
                onClick={() => loadTemplate('user-profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
              >
                <PlusCircle size={14} />
                <span>Load Profile Template</span>
              </button>
            </div>
          </div>
        ) : (
          components.map((comp) => <CanvasComponent key={comp.id} component={comp} />)
        )}
      </div>

      {/* Floating Context Menu */}
      <ContextMenu />

      {/* Floating Quick Style / Props / Events Popup */}
      <QuickStylePopup />
    </div>
  );
};
