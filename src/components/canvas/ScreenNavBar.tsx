import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import {
  Plus,
  Compass,
  Trash2,
  Copy,
  Edit2,
  Check,
  X,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const ScreenNavBar: React.FC = () => {
  const {
    screens,
    activeScreenId,
    setActiveScreenId,
    addScreen,
    updateScreen,
    deleteScreen,
    duplicateScreen,
    isPreviewMode,
  } = useBuilder();

  const [isAddingScreen, setIsAddingScreen] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenRoute, setNewScreenRoute] = useState('');
  const [newScreenTemplate, setNewScreenTemplate] = useState<'blank' | 'login' | 'profile'>('blank');

  // Inline editing of active screen
  const [editingScreenId, setEditingScreenId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoute, setEditRoute] = useState('');

  const handleStartEdit = (screenId: string, currentName: string, currentRoute: string) => {
    setEditingScreenId(screenId);
    setEditName(currentName);
    setEditRoute(currentRoute);
  };

  const handleSaveEdit = (screenId: string) => {
    if (editName.trim()) {
      updateScreen(screenId, { name: editName.trim(), route: editRoute.trim() || '/' });
    }
    setEditingScreenId(null);
  };

  const handleCreateScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScreenName.trim()) return;

    const route = newScreenRoute.trim()
      ? newScreenRoute.trim().startsWith('/')
        ? newScreenRoute.trim()
        : `/${newScreenRoute.trim()}`
      : `/${newScreenName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const templateId =
      newScreenTemplate === 'login'
        ? 'login-card'
        : newScreenTemplate === 'profile'
        ? 'user-profile'
        : undefined;

    addScreen(newScreenName.trim(), route, templateId);
    setNewScreenName('');
    setNewScreenRoute('');
    setIsAddingScreen(false);
  };

  return (
    <div className="w-full max-w-full flex flex-col gap-2 mb-3 select-none">
      {/* Screens Tabs Ribbon */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 shadow-sm">
        {/* Left: Screens Tab List */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 py-0.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 pl-2 pr-1 uppercase tracking-wider shrink-0">
            <Compass size={13} className="text-blue-400" />
            <span className="hidden sm:inline">Screens:</span>
          </div>

          {screens.map((screen) => {
            const isActive = screen.id === activeScreenId;
            const isEditing = screen.id === editingScreenId;

            if (isEditing) {
              return (
                <div
                  key={screen.id}
                  className="flex items-center gap-1 bg-slate-950 border border-blue-500 rounded-lg px-2 py-1 shrink-0"
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Screen Name"
                    className="w-24 px-1 py-0.5 bg-slate-900 rounded text-xs text-white outline-none"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editRoute}
                    onChange={(e) => setEditRoute(e.target.value)}
                    placeholder="/route"
                    className="w-20 px-1 py-0.5 bg-slate-900 rounded text-xs text-blue-300 font-mono outline-none"
                  />
                  <button
                    onClick={() => handleSaveEdit(screen.id)}
                    className="p-1 hover:bg-emerald-600 rounded text-emerald-400 hover:text-white"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => setEditingScreenId(null)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={screen.id}
                onClick={() => setActiveScreenId(screen.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                    : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate max-w-[130px]">{screen.name}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-blue-700/80 text-blue-100' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {screen.route}
                  </span>
                </div>

                {/* Edit & Delete hover icons */}
                {!isPreviewMode && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(screen.id, screen.name, screen.route);
                      }}
                      className="p-0.5 rounded hover:bg-black/30 text-inherit transition-colors"
                      title="Edit Screen Name & Route"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateScreen(screen.id);
                      }}
                      className="p-0.5 rounded hover:bg-black/30 text-inherit transition-colors"
                      title="Duplicate Screen"
                    >
                      <Copy size={11} />
                    </button>
                    {screens.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete screen "${screen.name}" (${screen.route})?`)) {
                            deleteScreen(screen.id);
                          }
                        }}
                        className="p-0.5 rounded hover:bg-red-600 hover:text-white text-inherit transition-colors"
                        title="Delete Screen"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Screen Button (Icon with tooltip to prevent ribbon overflow) */}
          {!isPreviewMode && (
            <button
              onClick={() => setIsAddingScreen(true)}
              title="Add New Screen (Route & Starter Template)"
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-blue-400 hover:text-blue-300 transition-all shrink-0 active:scale-95 flex items-center justify-center"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {/* Right Info: Interactive routing indicator */}
        {isPreviewMode && (
          <div className="flex items-center gap-2 px-2 text-xs font-medium text-emerald-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden md:inline">Interactive Routing Active:</span>
            <span className="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/30">
              Active: {screens.find((s) => s.id === activeScreenId)?.route}
            </span>
          </div>
        )}
      </div>

      {/* Add Screen Popover Form */}
      {isAddingScreen && (
        <form
          onSubmit={handleCreateScreen}
          className="p-3 bg-slate-950 border border-blue-500/60 rounded-xl shadow-xl flex flex-col sm:flex-row items-center gap-3 text-xs animate-fadeIn"
        >
          <div className="flex-1 w-full sm:w-auto">
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Screen Name</label>
            <input
              type="text"
              placeholder="e.g. Settings, Product Detail"
              value={newScreenName}
              onChange={(e) => {
                setNewScreenName(e.target.value);
                if (!newScreenRoute || newScreenRoute === '/') {
                  setNewScreenRoute(`/${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);
                }
              }}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          <div className="w-full sm:w-44">
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Route Path</label>
            <input
              type="text"
              placeholder="/settings"
              value={newScreenRoute}
              onChange={(e) => setNewScreenRoute(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-blue-300 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div className="w-full sm:w-40">
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Starter Layout</label>
            <select
              value={newScreenTemplate}
              onChange={(e) => setNewScreenTemplate(e.target.value as any)}
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 outline-none cursor-pointer"
            >
              <option value="blank">Blank Canvas</option>
              <option value="login">Login Form</option>
              <option value="profile">User Profile</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end mt-2 sm:mt-4">
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              Create Screen
            </button>
            <button
              type="button"
              onClick={() => setIsAddingScreen(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
