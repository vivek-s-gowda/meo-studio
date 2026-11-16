import React, { useState, useMemo, useCallback } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { CodeEditor } from '../ui/CodeEditor';
import { parseCodeToComponents } from '../../utils/codeParser';
import { generateHTML, generateCSS, generateJS } from '../../utils/codeGenerators/htmlCssJsGenerator';
import { generateReactCode, generateReactMultiRouter } from '../../utils/codeGenerators/reactGenerator';
import { generateVueCode } from '../../utils/codeGenerators/vueGenerator';
import { generateAngularCode } from '../../utils/codeGenerators/angularGenerator';
import { exportProjectZip } from '../../utils/zipExporter';
import {
  decomposeScreens,
  generateModularReactScreen,
  generateModularVueScreen,
  generateModularVueRouter,
  generateModularAngularScreen,
  generateModularAngularRoutes,
} from '../../utils/componentDecomposer';
import { FlexComponent } from '../../types';
import {
  FolderTree,
  Code2,
  Sliders,
  Copy,
  Download,
  Trash2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Check,
  Database,
  Boxes,
} from 'lucide-react';

export const RightSidebar: React.FC = () => {
  const {
    screens,
    activeScreen,
    components,
    selectedComponentId,
    setSelectedComponentId,
    targetLanguage,
    setTargetLanguage,
    removeComponent,
    duplicateComponent,
    moveComponent,
    selectedComponent,
    updateComponentStyles,
    updateComponentProps,
    setComponents,
    updateScreenComponents,
    dataSources,
    setQuickPopup,
    isModularMode,
    toggleModularMode,
  } = useBuilder();

  const decomposed = useMemo(() => decomposeScreens(screens), [screens]);

  // Primary Right Sidebar Mode: 'tree' | 'code' | 'inspector'
  const [activePanel, setActivePanel] = useState<'tree' | 'code' | 'inspector'>('code');

  // Subtabs for Code View (HTML, CSS, JS or Unified Framework)
  const [codeSubTab, setCodeSubTab] = useState<'html' | 'css' | 'js' | 'all'>('html');
  const [selectedScreenView, setSelectedScreenView] = useState<'active' | 'router' | string>('active');
  const [isExporting, setIsExporting] = useState(false);

  // Bi-directional Code -> Canvas Synchronization Handler
  const handleApplyToCanvas = useCallback(
    (newCode: string): { success: boolean; error?: string } => {
      // 1. Router View is structural, cannot map directly to single canvas component list
      if (selectedScreenView === 'router') {
        return { success: false, error: 'App Router is generated from screen routes.' };
      }

      // 2. Editing a modular component
      if (selectedScreenView.startsWith('comp:')) {
        const compName = selectedScreenView.replace('comp:', '');
        const foundComp = decomposed.allComponents.find((c) => c.pascalName === compName);
        if (!foundComp) {
          return { success: false, error: `Component ${compName} not found` };
        }
        const parseRes = parseCodeToComponents(newCode, [foundComp.component], targetLanguage);
        if (parseRes.success && parseRes.components.length > 0) {
          const updated = parseRes.components[0];
          updateComponentProps(foundComp.component.id, updated.props);
          updateComponentStyles(foundComp.component.id, updated.styles);
          return { success: true };
        }
        return { success: false, error: parseRes.error || 'Failed to parse component' };
      }

      // 3. Editing a specific screen page or active screen
      const targetScreenId = selectedScreenView.startsWith('page:')
        ? selectedScreenView.replace('page:', '')
        : activeScreen.id;
      const targetScreen = screens.find((s) => s.id === targetScreenId) || activeScreen;

      const parseRes = parseCodeToComponents(
        newCode,
        targetScreen.components,
        targetLanguage
      );

      if (parseRes.success) {
        if (targetScreenId === activeScreen.id) {
          setComponents(parseRes.components);
        } else {
          updateScreenComponents(targetScreenId, parseRes.components);
        }
        return { success: true };
      }

      return { success: false, error: parseRes.error || 'Parsing error' };
    },
    [
      selectedScreenView,
      decomposed,
      targetLanguage,
      screens,
      activeScreen,
      components,
      setComponents,
      updateScreenComponents,
      updateComponentProps,
      updateComponentStyles,
    ]
  );

  // Tree View node component
  const renderTreeNode = (comp: FlexComponent, depth = 0) => {
    const isSelected = selectedComponentId === comp.id;
    const hasChildren = comp.children && comp.children.length > 0;

    return (
      <div key={comp.id} className="flex flex-col">
        <div
          onClick={() => setSelectedComponentId(comp.id)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-md cursor-pointer transition-colors text-xs ${
            isSelected
              ? 'bg-blue-600/30 text-blue-300 font-medium border border-blue-500/50'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {hasChildren ? (
              <ChevronDown size={12} className="text-slate-500 shrink-0" />
            ) : (
              <span className="w-3 shrink-0" />
            )}
            <span className="truncate">{comp.name}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-mono">{comp.type}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveComponent(comp.id, 'up');
              }}
              className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-300"
              title="Move Up"
            >
              <ChevronUp size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveComponent(comp.id, 'down');
              }}
              className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-300"
              title="Move Down"
            >
              <ChevronDown size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeComponent(comp.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 text-slate-400 hover:text-red-400"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {hasChildren && (
          <div className="flex flex-col border-l border-slate-800/80 ml-3">
            {comp.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      const blob = await exportProjectZip(screens, targetLanguage, 'flex-ui-project', dataSources, isModularMode);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flex-ui-${targetLanguage}-project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export zip:', err);
      alert('Error exporting project zip: ' + err);
    } finally {
      setIsExporting(false);
    }
  };

  // Active Code Content based on selected file view
  const activeCodeContent = useMemo(() => {
    // 1. Router View
    if (selectedScreenView === 'router') {
      if (targetLanguage === 'react') {
        return {
          code: generateReactMultiRouter(screens),
          title: 'src/App.tsx (Router Setup)',
          language: 'typescript',
        };
      }
      if (targetLanguage === 'vue') {
        return {
          code: generateModularVueRouter(decomposed.screens),
          title: 'src/router/index.ts (Vue Router)',
          language: 'typescript',
        };
      }
      if (targetLanguage === 'angular') {
        return {
          code: generateModularAngularRoutes(decomposed.screens),
          title: 'src/app/app.routes.ts (Angular Routes)',
          language: 'typescript',
        };
      }
      return {
        code: generateJS(components, dataSources),
        title: 'script.js (Router & State)',
        language: 'javascript',
      };
    }

    // 2. Modular Component View (comp:PascalName)
    if (selectedScreenView.startsWith('comp:')) {
      const compName = selectedScreenView.replace('comp:', '');
      const foundComp =
        decomposed.allComponents.find((c) => c.pascalName === compName) || decomposed.allComponents[0];
      if (foundComp) {
        if (targetLanguage === 'react') {
          return {
            code: generateReactCode([foundComp.component], foundComp.pascalName, dataSources),
            title: `src/components/${foundComp.pascalName}.tsx`,
            language: 'typescript',
          };
        }
        if (targetLanguage === 'vue') {
          return {
            code: generateVueCode([foundComp.component], foundComp.pascalName, dataSources),
            title: `src/components/${foundComp.pascalName}.vue`,
            language: 'vue',
          };
        }
        if (targetLanguage === 'angular') {
          return {
            code: generateAngularCode(
              [foundComp.component],
              `${foundComp.pascalName}Component`,
              dataSources
            ),
            title: `src/app/components/${foundComp.kebabName}/${foundComp.kebabName}.component.ts`,
            language: 'typescript',
          };
        }
        return {
          code: generateHTML([foundComp.component], dataSources),
          title: `components/${foundComp.kebabName}.html`,
          language: 'html',
        };
      }
    }

    // 3. Screen View (page:ScreenId or 'active')
    const targetScreenId = selectedScreenView.startsWith('page:')
      ? selectedScreenView.replace('page:', '')
      : activeScreen.id;
    const foundScreen =
      decomposed.screens.find((s) => s.id === targetScreenId) || decomposed.screens[0];
    const rawScreen = screens.find((s) => s.id === targetScreenId) || activeScreen;

    if (isModularMode && foundScreen) {
      if (targetLanguage === 'react') {
        return {
          code: generateModularReactScreen(foundScreen, screens),
          title: `src/pages/${foundScreen.screenPascalName}.tsx`,
          language: 'typescript',
        };
      }
      if (targetLanguage === 'vue') {
        return {
          code: generateModularVueScreen(foundScreen),
          title: `src/views/${foundScreen.pascalName}View.vue`,
          language: 'vue',
        };
      }
      if (targetLanguage === 'angular') {
        return {
          code: generateModularAngularScreen(foundScreen),
          title: `src/app/pages/${foundScreen.kebabName}/${foundScreen.kebabName}.component.ts`,
          language: 'typescript',
        };
      }
      return {
        code: generateHTML(
          foundScreen.components.map((c) => c.component),
          dataSources
        ),
        title: `pages/${foundScreen.kebabName}.html`,
        language: 'html',
      };
    }

    // 4. Classic Single-Screen View
    if (targetLanguage === 'react') {
      return {
        code: generateReactCode(
          rawScreen.components,
          `${(rawScreen.name || 'Screen').replace(/[^a-zA-Z0-9]/g, '')}Screen`,
          dataSources
        ),
        title: `${rawScreen.name}Screen.tsx`,
        language: 'typescript',
      };
    }
    if (targetLanguage === 'vue') {
      return {
        code: generateVueCode(rawScreen.components, 'FlexApp', dataSources),
        title: `${rawScreen.name}.vue`,
        language: 'vue',
      };
    }
    if (targetLanguage === 'angular') {
      return {
        code: generateAngularCode(
          rawScreen.components,
          `${(rawScreen.name || 'Screen').replace(/[^a-zA-Z0-9]/g, '')}Component`,
          dataSources
        ),
        title: `${rawScreen.name}.component.ts`,
        language: 'typescript',
      };
    }
    if (codeSubTab === 'css') {
      return {
        code: generateCSS(rawScreen.components),
        title: 'style.css',
        language: 'css',
      };
    }
    if (codeSubTab === 'js') {
      return {
        code: generateJS(rawScreen.components, dataSources),
        title: 'script.js',
        language: 'javascript',
      };
    }
    return {
      code: generateHTML(rawScreen.components, dataSources),
      title: `${rawScreen.name}.html`,
      language: 'html',
    };
  }, [
    selectedScreenView,
    targetLanguage,
    isModularMode,
    decomposed,
    screens,
    activeScreen,
    components,
    dataSources,
    codeSubTab,
  ]);

  return (
    <aside className="w-96 h-full bg-[#0d1322] border-l border-slate-800 flex flex-col select-none z-10">
      {/* Top Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-medium">
        <button
          onClick={() => setActivePanel('code')}
          title="Code Inspector & Live Canvas Synchronizer"
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activePanel === 'code'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 size={15} />
          <span>Code</span>
        </button>

        <button
          onClick={() => setActivePanel('tree')}
          title="DOM Hierarchy Structure Tree (Component nesting & selection)"
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activePanel === 'tree'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderTree size={15} />
          <span>Tree</span>
        </button>

        <button
          onClick={() => setActivePanel('inspector')}
          title="Quick Component Property & Style Inspector"
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activePanel === 'inspector'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders size={15} />
          <span>Inspect</span>
        </button>
      </div>

      {/* --- PANEL 1: CODE INSPECTOR --- */}
      {activePanel === 'code' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Language Switcher Bar */}
          <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Target:</span>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as any)}
                className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-md text-xs font-semibold text-blue-400 outline-none cursor-pointer"
              >
                <option value="react">React (TSX)</option>
                <option value="angular">Angular 17+</option>
                <option value="vue">Vue 3 (SFC)</option>
                <option value="html">HTML / CSS / JS</option>
              </select>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              title={isExporting ? 'Packaging ZIP Archive...' : 'Scaffold & Download Project ZIP'}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
            >
              <Download size={14} />
            </button>
          </div>

          {/* Screen & Component Scope Selector */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 text-[11px]">
            <div
              className="flex items-center gap-1.5 shrink-0 cursor-help"
              title="Select File or Component View to Edit"
            >
              <Boxes size={13} className={isModularMode ? 'text-indigo-400' : 'text-slate-500'} />
            </div>
            <select
              value={selectedScreenView}
              onChange={(e) => setSelectedScreenView(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded px-2 py-0.5 text-xs text-blue-300 font-medium outline-none cursor-pointer w-full ml-2 truncate"
            >
              {isModularMode ? (
                <>
                  <optgroup label="📄 Screens / Page Views (Editable)">
                    <option value="active">Active: {activeScreen.name}Screen</option>
                    {decomposed.screens.map((s) => (
                      <option key={`page:${s.id}`} value={`page:${s.id}`}>
                        {s.screenPascalName} ({s.route})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🧩 Modular UI Components (Editable)">
                    {decomposed.allComponents.map((c) => (
                      <option key={`comp:${c.pascalName}`} value={`comp:${c.pascalName}`}>
                        {c.pascalName} (from {c.screenName})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🧭 App & Router Setup">
                    <option value="router">App Router ({targetLanguage === 'vue' ? 'router/index.ts' : targetLanguage === 'angular' ? 'app.routes.ts' : 'App.tsx'})</option>
                  </optgroup>
                </>
              ) : (
                <>
                  <option value="active">Active Screen: {activeScreen.name} ({activeScreen.route})</option>
                  {screens.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.route})
                    </option>
                  ))}
                  {screens.length > 1 && <option value="router">App & Router ({screens.length} Screens)</option>}
                </>
              )}
            </select>
          </div>

          {/* HTML / CSS / JS Sub-tabs when language is 'html' and not in modular file view */}
          {targetLanguage === 'html' && !isModularMode ? (
            <div className="flex border-b border-slate-800 bg-slate-950 text-xs">
              <button
                onClick={() => setCodeSubTab('html')}
                className={`flex-1 py-1.5 text-center font-mono font-medium transition-colors ${
                  codeSubTab === 'html' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setCodeSubTab('css')}
                className={`flex-1 py-1.5 text-center font-mono font-medium transition-colors ${
                  codeSubTab === 'css' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400'
                }`}
              >
                CSS
              </button>
              <button
                onClick={() => setCodeSubTab('js')}
                className={`flex-1 py-1.5 text-center font-mono font-medium transition-colors ${
                  codeSubTab === 'js' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400'
                }`}
              >
                JS
              </button>
            </div>
          ) : null}

          {/* Interactive Code Editor with Live Canvas Sync */}
          <div className="flex-1 overflow-hidden p-2.5 flex flex-col min-h-0">
            <CodeEditor
              key={`${activeCodeContent.title}-${targetLanguage}-${selectedScreenView}-${codeSubTab}`}
              initialCode={activeCodeContent.code}
              language={activeCodeContent.language as any}
              title={activeCodeContent.title}
              maxHeight="calc(100vh - 230px)"
              onApplyToCanvas={handleApplyToCanvas}
            />
          </div>
        </div>
      )}

      {/* --- PANEL 2: STRUCTURE TREE --- */}
      {activePanel === 'tree' && (
        <div className="flex-1 flex flex-col min-h-0 p-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
            <span>DOM Hierarchy ({components.length} roots)</span>
            <span className="text-[10px] text-slate-500">Click to select</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {components.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No components on canvas.</div>
            ) : (
              components.map((comp) => renderTreeNode(comp))
            )}
          </div>
        </div>
      )}

      {/* --- PANEL 3: QUICK INSPECTOR --- */}
      {activePanel === 'inspector' && (
        <div className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto space-y-4 text-xs">
          {selectedComponent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="font-semibold text-white">{selectedComponent.name}</h3>
                  <span className="text-[10px] text-blue-400 font-mono">{selectedComponent.type}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => duplicateComponent(selectedComponent.id)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Duplicate"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={() => removeComponent(selectedComponent.id)}
                    className="p-1 rounded bg-slate-800 hover:bg-red-600 text-red-400 hover:text-white"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Sizing */}
              <div>
                <label className="text-slate-400 font-semibold uppercase text-[10px] block mb-1.5">
                  Dimensions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Width</span>
                    <input
                      type="text"
                      value={selectedComponent.styles.width || ''}
                      placeholder="auto / 100%"
                      onChange={(e) => updateComponentStyles(selectedComponent.id, { width: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Height</span>
                    <input
                      type="text"
                      value={selectedComponent.styles.height || ''}
                      placeholder="auto"
                      onChange={(e) => updateComponentStyles(selectedComponent.id, { height: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="text-slate-400 font-semibold uppercase text-[10px] block mb-1.5">Colors</label>
                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Background</span>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedComponent.styles.backgroundColor || '#1e293b'}
                        onChange={(e) => updateComponentStyles(selectedComponent.id, { backgroundColor: e.target.value })}
                        className="w-6 h-6 border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedComponent.styles.backgroundColor || ''}
                        onChange={(e) => updateComponentStyles(selectedComponent.id, { backgroundColor: e.target.value })}
                        className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Text Color</span>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedComponent.styles.textColor || '#ffffff'}
                        onChange={(e) => updateComponentStyles(selectedComponent.id, { textColor: e.target.value })}
                        className="w-6 h-6 border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedComponent.styles.textColor || ''}
                        onChange={(e) => updateComponentStyles(selectedComponent.id, { textColor: e.target.value })}
                        className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Data Binding Section */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <Database size={13} className="text-emerald-400" />
                    <span>Dynamic Data Binding</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      selectedComponent.dataBinding?.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {selectedComponent.dataBinding?.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                {selectedComponent.dataBinding?.enabled && (
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>
                      Source:{' '}
                      <span className="text-emerald-300 font-medium">
                        {dataSources.find((d) => d.id === selectedComponent.dataBinding?.dataSourceId)?.name || 'Default'}
                      </span>
                    </div>
                    <div>
                      Mode: <span className="text-slate-300 capitalize">{selectedComponent.dataBinding.mode}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={() =>
                    setQuickPopup({
                      isOpen: true,
                      x: 380,
                      y: 150,
                      componentId: selectedComponent.id,
                      activeTab: 'data',
                    })
                  }
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-slate-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Database size={12} className="text-emerald-400" />
                  <span>Configure Data Binding...</span>
                </button>
              </div>

              {/* Bound Events */}
              <div>
                <label className="text-emerald-400 font-semibold uppercase text-[10px] block mb-1.5">
                  JS Event Handlers
                </label>
                {selectedComponent.events && selectedComponent.events.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedComponent.events.map((ev, i) => (
                      <div key={i} className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[11px]">
                        <span className="text-purple-400">{ev.event}</span> &rarr;{' '}
                        <span className="text-emerald-400">{ev.functionName}()</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">Right-click component to bind JS functions.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Select a component on the playground to inspect and modify properties.
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
