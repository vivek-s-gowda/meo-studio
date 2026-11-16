import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { parsePromptToComponents, AI_SYSTEM_PROMPTS } from '../../utils/aiService';
import { X, Sparkles, Copy, Check, Terminal, Play, Cpu, Code2 } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { addRawComponent, clearCanvas } = useBuilder();
  const [activeTab, setActiveTab] = useState<'prompt-ui' | 'stack-prompts' | 'python-service'>('prompt-ui');
  const [promptInput, setPromptInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedStack, setSelectedStack] = useState<'react' | 'vue' | 'angular' | 'nodeBackend' | 'pythonMicroservice'>('react');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleCopyPrompt = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateFromPrompt = () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const generatedComponents = parsePromptToComponents(promptInput);
      clearCanvas();
      generatedComponents.forEach((comp) => addRawComponent(comp, null));
      setIsGenerating(false);
      onClose();
    }, 400);
  };

  const SAMPLE_PROMPTS = [
    'Material Login card with email, password, remember me, and sign in button',
    'Contact Us form with name, email, message textarea, and send button',
    'Pro tier pricing card with 3 features and a trial button',
    'User settings panel with notification toggle and save button',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>FlexUI AI Suite</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                  Smart Assistant
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Natural language UI synthesis, stack architecture prompts & schematic analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('prompt-ui')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'prompt-ui'
                ? 'border-purple-500 text-purple-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} />
            <span>Prompt to UI Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('stack-prompts')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'stack-prompts'
                ? 'border-purple-500 text-purple-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={14} />
            <span>Stack Architecture Prompts</span>
          </button>

          <button
            onClick={() => setActiveTab('python-service')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'python-service'
                ? 'border-purple-500 text-purple-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu size={14} />
            <span>Python Microservice & Formatter</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: PROMPT TO UI BUILDER */}
          {activeTab === 'prompt-ui' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Describe the interface you want to create:
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="e.g. Create a sleek Material login card with email, password, and a remember me checkbox..."
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm outline-none focus:border-purple-500 transition-colors leading-relaxed"
                  />
                </div>
              </div>

              {/* Sample Suggestions */}
              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-2">
                  Or click one of these pre-tested prompt blueprints:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_PROMPTS.map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPromptInput(sample)}
                      className="p-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      &ldquo;{sample}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateFromPrompt}
                  disabled={!promptInput.trim() || isGenerating}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  <span>{isGenerating ? 'Synthesizing UI Hierarchy...' : 'Generate and Place on Canvas'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STACK ARCHITECTURE PROMPTS */}
          {activeTab === 'stack-prompts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Select stack to review and copy its system prompt:</span>
                <button
                  onClick={() => handleCopyPrompt(selectedStack, AI_SYSTEM_PROMPTS[selectedStack])}
                  className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {copiedKey === selectedStack ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedKey === selectedStack ? 'Copied!' : 'Copy System Prompt'}</span>
                </button>
              </div>

              <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedStack('react')}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    selectedStack === 'react' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  React 18+ (TSX)
                </button>
                <button
                  onClick={() => setSelectedStack('vue')}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    selectedStack === 'vue' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Vue 3 (SFC)
                </button>
                <button
                  onClick={() => setSelectedStack('angular')}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    selectedStack === 'angular' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Angular 17+
                </button>
                <button
                  onClick={() => setSelectedStack('nodeBackend')}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    selectedStack === 'nodeBackend' ? 'bg-amber-600 text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Node.js Backend
                </button>
                <button
                  onClick={() => setSelectedStack('pythonMicroservice')}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    selectedStack === 'pythonMicroservice' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Python Microservice
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-purple-200 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                {AI_SYSTEM_PROMPTS[selectedStack]}
              </div>
            </div>
          )}

          {/* TAB 3: PYTHON MICROSERVICE & SCHEMATIC ANALYSIS */}
          {activeTab === 'python-service' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <Cpu size={16} className="text-indigo-400" />
                  <span>Python AST & Schematic Code Analyzer Service</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  FlexUI includes a lightweight Python microservice located at{' '}
                  <code className="text-indigo-300 font-mono">python_service/app.py</code>. It performs AST
                  validation, token categorization (schematic highlighting), and code formatting for exported
                  code.
                </p>
                <div className="p-3 bg-slate-900 rounded-lg font-mono text-slate-300 text-[11px] space-y-1">
                  <div># Start the Python AST microservice:</div>
                  <div className="text-emerald-400 font-bold">python3 python_service/app.py</div>
                  <div className="text-slate-500">Service listens on http://localhost:5002/analyze</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
