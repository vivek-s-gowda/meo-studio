import React, { useState, useEffect } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { X, Palette, Sliders, Code2, Play, Check, Plus, Trash2, Compass, ArrowRight } from 'lucide-react';
import { ComponentEvent } from '../../types';

export const QuickStylePopup: React.FC = () => {
  const {
    quickPopup,
    setQuickPopup,
    findComponentById,
    updateComponentStyles,
    updateComponentProps,
    updateComponentEvents,
    screens,
  } = useBuilder();

  const [activeTab, setActiveTab] = useState<'styles' | 'props' | 'events'>('styles');

  useEffect(() => {
    if (quickPopup.activeTab) {
      setActiveTab(quickPopup.activeTab);
    }
  }, [quickPopup.activeTab]);

  if (!quickPopup.isOpen || !quickPopup.componentId) return null;

  const component = findComponentById(quickPopup.componentId);
  if (!component) return null;

  const { styles, props, events } = component;

  // Color preset swatches for quick material selection
  const COLOR_SWATCHES = [
    '#2563eb', // Blue
    '#3b82f6', // Light Blue
    '#10b981', // Emerald
    '#059669', // Dark Emerald
    '#8b5cf6', // Violet
    '#d946ef', // Fuchsia
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#1e293b', // Slate Dark
    '#0f172a', // Midnight
    '#ffffff', // White
    'transparent',
  ];

  return (
    <div
      style={{
        top: `${quickPopup.y}px`,
        left: `${quickPopup.x}px`,
      }}
      className="fixed z-50 w-96 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl select-none animate-fadeIn flex flex-col max-h-[580px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="font-semibold text-sm text-white">{component.name}</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
            {component.type}
          </span>
        </div>
        <button
          onClick={() => setQuickPopup((prev) => ({ ...prev, isOpen: false }))}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-medium">
        <button
          onClick={() => setActiveTab('styles')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'styles'
              ? 'border-blue-500 text-blue-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette size={14} />
          <span>Styles</span>
        </button>
        <button
          onClick={() => setActiveTab('props')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'props'
              ? 'border-blue-500 text-blue-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders size={14} />
          <span>Properties</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'events'
              ? 'border-blue-500 text-emerald-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 size={14} />
          <span>JS Binding</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 overflow-y-auto space-y-4 text-xs">
        {/* --- TAB 1: STYLES --- */}
        {activeTab === 'styles' && (
          <div className="space-y-4">
            {/* Dimensions */}
            <div>
              <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-2">
                Dimensions & Sizing
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Width</span>
                  <input
                    type="text"
                    value={styles.width || ''}
                    placeholder="e.g. 100%, 240px, auto"
                    onChange={(e) => updateComponentStyles(component.id, { width: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Height</span>
                  <input
                    type="text"
                    value={styles.height || ''}
                    placeholder="e.g. 48px, auto"
                    onChange={(e) => updateComponentStyles(component.id, { height: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-2">
                Colors & Appearance
              </label>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Background Color</span>
                    <span className="font-mono text-slate-400">{styles.backgroundColor || 'none'}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={styles.backgroundColor && styles.backgroundColor !== 'transparent' ? styles.backgroundColor : '#1e293b'}
                      onChange={(e) => updateComponentStyles(component.id, { backgroundColor: e.target.value })}
                      className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={styles.backgroundColor || ''}
                      onChange={(e) => updateComponentStyles(component.id, { backgroundColor: e.target.value })}
                      className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono text-xs outline-none"
                    />
                  </div>
                  {/* Swatches */}
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_SWATCHES.map((color, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => updateComponentStyles(component.id, { backgroundColor: color })}
                        style={{ backgroundColor: color }}
                        className={`w-5 h-5 rounded border border-slate-600 hover:scale-110 transition-transform ${
                          styles.backgroundColor === color ? 'ring-2 ring-blue-400' : ''
                        }`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Text Color</span>
                    <span className="font-mono text-slate-400">{styles.textColor || 'inherit'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styles.textColor || '#ffffff'}
                      onChange={(e) => updateComponentStyles(component.id, { textColor: e.target.value })}
                      className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={styles.textColor || ''}
                      onChange={(e) => updateComponentStyles(component.id, { textColor: e.target.value })}
                      className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Spacing & Borders */}
            <div>
              <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-2">
                Spacing & Borders
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Padding</span>
                  <input
                    type="text"
                    value={styles.padding || ''}
                    placeholder="e.g. 12px 16px"
                    onChange={(e) => updateComponentStyles(component.id, { padding: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Margin</span>
                  <input
                    type="text"
                    value={styles.margin || ''}
                    placeholder="e.g. 0 0 16px 0"
                    onChange={(e) => updateComponentStyles(component.id, { margin: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Border Radius</span>
                  <input
                    type="text"
                    value={styles.borderRadius || ''}
                    placeholder="e.g. 8px, 9999px"
                    onChange={(e) => updateComponentStyles(component.id, { borderRadius: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Border Width</span>
                  <input
                    type="text"
                    value={styles.borderWidth || ''}
                    placeholder="e.g. 1px"
                    onChange={(e) => updateComponentStyles(component.id, { borderWidth: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-2">
                Typography
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Font Size</span>
                  <input
                    type="text"
                    value={styles.fontSize || ''}
                    placeholder="e.g. 14px, 1.2rem"
                    onChange={(e) => updateComponentStyles(component.id, { fontSize: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Font Weight</span>
                  <select
                    value={styles.fontWeight || '400'}
                    onChange={(e) => updateComponentStyles(component.id, { fontWeight: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: PROPERTIES & CONTENT --- */}
        {activeTab === 'props' && (
          <div className="space-y-3">
            {/* Label / Title */}
            {('label' in props || 'title' in props || 'text' in props) && (
              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Text Content / Label
                </label>
                <input
                  type="text"
                  value={props.label || props.title || props.text || ''}
                  onChange={(e) => {
                    const key = 'label' in props ? 'label' : 'title' in props ? 'title' : 'text';
                    updateComponentProps(component.id, { [key]: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Subtitle / Description */}
            {('subtitle' in props || 'message' in props) && (
              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Subtitle / Message
                </label>
                <input
                  type="text"
                  value={props.subtitle || props.message || ''}
                  onChange={(e) => {
                    const key = 'subtitle' in props ? 'subtitle' : 'message';
                    updateComponentProps(component.id, { [key]: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none"
                />
              </div>
            )}

            {/* Placeholder */}
            {'placeholder' in props && (
              <div>
                <label className="text-slate-400 font-medium block mb-1">Placeholder</label>
                <input
                  type="text"
                  value={props.placeholder || ''}
                  onChange={(e) => updateComponentProps(component.id, { placeholder: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none"
                />
              </div>
            )}

            {/* Options List */}
            {Array.isArray(props.options) && (
              <div>
                <label className="text-slate-400 font-medium block mb-1">Options List (comma separated)</label>
                <textarea
                  rows={3}
                  value={props.options.join(', ')}
                  onChange={(e) =>
                    updateComponentProps(component.id, {
                      options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none"
                />
              </div>
            )}

            {/* Avatar URL */}
            {'src' in props && (
              <div>
                <label className="text-slate-400 font-medium block mb-1">Image Source URL</label>
                <input
                  type="text"
                  value={props.src || ''}
                  onChange={(e) => updateComponentProps(component.id, { src: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none"
                />
              </div>
            )}

            {/* Checked boolean */}
            {'checked' in props && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={Boolean(props.checked)}
                  onChange={(e) => updateComponentProps(component.id, { checked: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800"
                />
                <span className="text-slate-300">Checked by default</span>
              </div>
            )}

            {/* Screen Navigation / Route on Click */}
            <div className="pt-3 border-t border-slate-800">
              <label className="text-purple-400 font-semibold block mb-1 text-[11px] flex items-center gap-1.5">
                <Compass size={13} />
                <span>Navigate to Screen on Click (Routing)</span>
              </label>
              <select
                value={props.navigateToScreenId || ''}
                onChange={(e) => {
                  const targetScreenId = e.target.value;
                  const targetScreen = screens.find((s) => s.id === targetScreenId);
                  updateComponentProps(component.id, {
                    navigateToScreenId: targetScreenId || undefined,
                    targetRoute: targetScreen ? targetScreen.route : undefined,
                  });
                }}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none text-xs cursor-pointer focus:border-purple-500"
              >
                <option value="">None (No screen routing)</option>
                {screens.map((screen) => (
                  <option key={screen.id} value={screen.id}>
                    {screen.name} ({screen.route})
                  </option>
                ))}
              </select>
              {props.navigateToScreenId && (
                <div className="flex items-center gap-1.5 text-[10px] text-purple-300 bg-purple-950/40 border border-purple-500/30 p-2 rounded-md mt-2">
                  <ArrowRight size={12} className="shrink-0" />
                  <span>
                    When clicked in interactive preview, transitions to{' '}
                    <strong className="text-white font-mono">{props.targetRoute}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 3: JS FUNCTION BINDING --- */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                Bound JavaScript Functions
              </span>
              <button
                type="button"
                onClick={() => {
                  const newEvent: ComponentEvent = {
                    event: 'onClick',
                    functionName: `on_${component.type}_${Date.now().toString(36)}`,
                    customCode: `alert('Triggered from ${component.name}!');`,
                    description: 'Custom event handler',
                  };
                  updateComponentEvents(component.id, [...(events || []), newEvent]);
                }}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 transition-colors"
              >
                <Plus size={12} />
                <span>Add Event</span>
              </button>
            </div>

            {(!events || events.length === 0) ? (
              <div className="p-4 border border-dashed border-slate-800 rounded-lg text-center text-slate-400">
                <p className="text-xs mb-2">No JavaScript functions bound to this component yet.</p>
                <button
                  onClick={() => {
                    const defaultEv: ComponentEvent = {
                      event: 'onClick',
                      functionName: `handle_${component.id.replace(/-/g, '_')}`,
                      customCode: `console.log('Action on ${component.name}');\nalert('${component.name} clicked!');`,
                      description: 'Primary interaction handler',
                    };
                    updateComponentEvents(component.id, [defaultEv]);
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                >
                  Bind Default Click Function
                </button>
              </div>
            ) : (
              events.map((ev, index) => (
                <div key={index} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <select
                      value={ev.event}
                      onChange={(e) => {
                        const updated = [...events];
                        updated[index] = { ...updated[index], event: e.target.value as any };
                        updateComponentEvents(component.id, updated);
                      }}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-emerald-400 font-mono text-xs font-medium"
                    >
                      <option value="onClick">onClick</option>
                      <option value="onChange">onChange</option>
                      <option value="onSubmit">onSubmit</option>
                      <option value="onMouseEnter">onMouseEnter</option>
                      <option value="onFocus">onFocus</option>
                      <option value="onBlur">onBlur</option>
                    </select>

                    <button
                      onClick={() => {
                        const updated = events.filter((_, i) => i !== index);
                        updateComponentEvents(component.id, updated);
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove Event Binding"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Function Name</label>
                    <input
                      type="text"
                      value={ev.functionName}
                      onChange={(e) => {
                        const updated = [...events];
                        updated[index] = { ...updated[index], functionName: e.target.value };
                        updateComponentEvents(component.id, updated);
                      }}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] text-slate-400">Custom JavaScript Body</label>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const fn = new Function('event', ev.customCode);
                            fn({ type: ev.event });
                          } catch (err: any) {
                            alert('Execution Error: ' + err.message);
                          }
                        }}
                        className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        <Play size={10} />
                        <span>Test Run</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={ev.customCode}
                      onChange={(e) => {
                        const updated = [...events];
                        updated[index] = { ...updated[index], customCode: e.target.value };
                        updateComponentEvents(component.id, updated);
                      }}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-emerald-300 font-mono text-[11px] leading-relaxed outline-none"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">All changes apply instantly</span>
        <button
          onClick={() => setQuickPopup((prev) => ({ ...prev, isOpen: false }))}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
        >
          <Check size={13} />
          <span>Done</span>
        </button>
      </div>
    </div>
  );
};
