import React from 'react';
import { PRESET_TEMPLATES } from '../../constants/templates';
import { useBuilder } from '../../context/BuilderContext';
import { X, Layers, Check } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose }) => {
  const { loadTemplate } = useBuilder();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Starter UI Templates</h2>
              <p className="text-xs text-slate-400">Pick a pre-configured Material layout for the playground</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
          {PRESET_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                loadTemplate(tpl.id);
                onClose();
              }}
              className="p-4 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/60 rounded-xl cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {tpl.name}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  {tpl.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
