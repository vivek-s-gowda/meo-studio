import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { TargetLanguage } from '../../types';
import { exportProjectZip } from '../../utils/zipExporter';
import { X, Download, Terminal, Check, Folder, FileCode, Sparkles, Layers, Boxes } from 'lucide-react';

interface ScaffoldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScaffoldModal: React.FC<ScaffoldModalProps> = ({ isOpen, onClose }) => {
  const {
    targetLanguage,
    setTargetLanguage,
    components,
    screens,
    dataSources,
    isModularMode,
    toggleModularMode,
  } = useBuilder();
  const [selectedLang, setSelectedLang] = useState<TargetLanguage>(targetLanguage);
  const [isExporting, setIsExporting] = useState(false);
  const [projectName, setProjectName] = useState('flex-ui-app');

  if (!isOpen) return null;

  const handleScaffoldDownload = async () => {
    setIsExporting(true);
    try {
      const blob = await exportProjectZip(screens, selectedLang, projectName, dataSources, isModularMode);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}-${selectedLang}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Error scaffolding project: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const getLanguageDetails = (lang: TargetLanguage, modular: boolean) => {
    switch (lang) {
      case 'react':
        return {
          title: 'React 18+ (TypeScript & Vite)',
          description: modular
            ? 'Modular component architecture: UI elements in src/components/, screen pages in src/pages/, with react-router-dom configured.'
            : 'Ultra-fast Vite setup with TypeScript, Tailwind CSS, and interactive state hooks.',
          files: modular
            ? [
                'src/components/*.tsx',
                'src/pages/*Screen.tsx',
                'src/App.tsx (Router)',
                'src/data/mockData.json',
                'src/main.tsx',
                'package.json',
              ]
            : ['src/App.tsx', 'src/main.tsx', 'src/index.css', 'package.json', 'vite.config.ts'],
          commands: ['npm install', 'npm run dev'],
        };
      case 'vue':
        return {
          title: 'Vue 3 (Single File Component & Vite)',
          description: modular
            ? 'Modular component architecture: UI elements in src/components/, views in src/views/, with vue-router configured.'
            : 'Vue 3 with Composition API (<script setup lang="ts">), scoped styling, and reactivity.',
          files: modular
            ? [
                'src/components/*.vue',
                'src/views/*View.vue',
                'src/router/index.ts (Router)',
                'src/App.vue',
                'src/data/mockData.json',
                'package.json',
              ]
            : ['src/App.vue', 'src/main.ts', 'package.json', 'vite.config.ts'],
          commands: ['npm install', 'npm run dev'],
        };
      case 'angular':
        return {
          title: 'Angular 17+ (Standalone Component)',
          description: modular
            ? 'Modular component architecture: standalone components in src/app/components/, pages in src/app/pages/, with Angular Router routes.'
            : 'Modern standalone component structure with CommonModule and FormsModule bindings.',
          files: modular
            ? [
                'src/app/components/*/*.component.ts',
                'src/app/pages/*/*.component.ts',
                'src/app/app.routes.ts',
                'src/app/app.config.ts',
                'src/app/app.component.ts',
              ]
            : ['src/app/app.component.ts', 'src/main.ts', 'package.json'],
          commands: ['npm install', 'npm start'],
        };
      case 'html':
        return {
          title: 'Vanilla HTML5 / CSS3 / JavaScript',
          description: modular
            ? 'Modular architecture: components in components/, pages in pages/, and script.js.'
            : 'Clean, dependency-free separate index.html, style.css, and script.js files.',
          files: modular
            ? ['components/*.html', 'pages/*.html', 'index.html', 'style.css', 'script.js']
            : ['index.html', 'style.css', 'script.js', 'README.md'],
          commands: ['# Open index.html in any browser or use serve:', 'npx serve .'],
        };
    }
  };

  const details = getLanguageDetails(selectedLang, isModularMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Scaffold Full Project</h2>
              <p className="text-xs text-slate-400">Choose your stack and download a ready-to-run repo</p>
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
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Project Name Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-sm font-mono outline-none focus:border-blue-500"
            />
          </div>

          {/* Language Selection Grid */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Target Framework (Change anytime)
              </label>
              <span className="text-[11px] text-blue-400">Seamless multi-porting enabled</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(['react', 'vue', 'angular', 'html'] as TargetLanguage[]).map((lang) => {
                const isSelected = selectedLang === lang;
                return (
                  <div
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang);
                      setTargetLanguage(lang);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase text-white tracking-wider">
                        {lang === 'html' ? 'Vanilla HTML' : lang}
                      </span>
                      {isSelected && <Check size={14} className="text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {lang === 'react' && 'React 18 + TSX + Tailwind'}
                      {lang === 'vue' && 'Vue 3 SFC + Composition API'}
                      {lang === 'angular' && 'Angular 17+ Standalone'}
                      {lang === 'html' && 'Standard HTML5, CSS3 & JS'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modular Component Architecture Toggle */}
          <div
            onClick={toggleModularMode}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              isModularMode
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isModularMode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Boxes size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    Componentize Architecture (/components/ & /pages/)
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isModularMode ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isModularMode ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Converts UI controls into reusable component files and screens into pages with configured routes.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isModularMode}
              onChange={toggleModularMode}
              className="w-4 h-4 rounded accent-indigo-600 cursor-pointer shrink-0 ml-3"
            />
          </div>

          {/* Details & File Structure Preview */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Folder size={14} className="text-amber-400" />
              <span>Project Structure & Files Included</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {details.files.map((file, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                >
                  <FileCode size={12} className="text-blue-400" />
                  {file}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                Terminal Quickstart:
              </span>
              <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-xs text-emerald-400 space-y-1">
                {details.commands.map((cmd, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-slate-600 select-none">$</span>
                    <span>{cmd}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {screens.length} Screens ({screens.reduce((acc, s) => acc + s.components.length, 0)} components) compiled into {selectedLang.toUpperCase()}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleScaffoldDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download size={14} />
              <span>{isExporting ? 'Generating ZIP...' : `Download ${selectedLang.toUpperCase()} Bundle`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
