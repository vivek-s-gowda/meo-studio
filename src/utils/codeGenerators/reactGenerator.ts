import { FlexComponent, Screen, DataSource } from '../../types';

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toJSXToken(str: string | undefined, defaultVal = ''): string {
  if (!str) return JSON.stringify(defaultVal);
  if (/^\{\{\s*(?:item\.)?([a-zA-Z0-9_.]+)\s*\}\}$/.test(str)) {
    const field = str.replace(/\{\{\s*(?:item\.)?([a-zA-Z0-9_.]+)\s*\}\}/, '$1');
    return `item?.${field} ?? ''`;
  }
  if (/\{\{\s*(?:item\.)?([a-zA-Z0-9_.]+)\s*\}\}/.test(str)) {
    const templated = str.replace(/\{\{\s*(?:item\.)?([a-zA-Z0-9_.]+)\s*\}\}/g, '${item?.$1 ?? ""}');
    return `\`${templated}\``;
  }
  return JSON.stringify(str);
}

export function generateReactMultiRouter(screens: Screen[]): string {
  const imports = screens
    .map((s) => `import ${toPascalCase(s.name)}Screen from './pages/${toPascalCase(s.name)}Screen';`)
    .join('\n');

  const routes = screens
    .map((s) => `        <Route path="${s.route}" element={<${toPascalCase(s.name)}Screen />} />`)
    .join('\n');

  return `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
${imports}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
${routes}
      </Routes>
    </BrowserRouter>
  );
}
`;
}

export function generateReactCode(
  components: FlexComponent[],
  componentName = 'FlexApp',
  dataSources: DataSource[] = []
): string {
  const stateHooks: Set<string> = new Set();
  const effectHooks: Set<string> = new Set();
  const handlers: Map<string, string> = new Map();
  const usedDataSources: Set<string> = new Set();
  let usesRouter = false;
  let usesEffects = false;

  // Scan components to detect which data sources are in play
  function scanDataBindings(comps: FlexComponent[]) {
    for (const c of comps) {
      if (c.dataBinding?.enabled && c.dataBinding.dataSourceId) {
        usedDataSources.add(c.dataBinding.dataSourceId);
      }
      if (c.type === 'data-table') {
        usedDataSources.add(c.dataBinding?.dataSourceId || 'ds-users');
      }
      if (c.children) scanDataBindings(c.children);
    }
  }
  scanDataBindings(components);

  // Set up data source hooks and fetch logic
  dataSources.forEach((ds) => {
    if (usedDataSources.has(ds.id)) {
      const stateVar = `${ds.id.replace(/[^a-zA-Z0-9]/g, '_')}_data`;
      const setter = `set${stateVar.charAt(0).toUpperCase() + stateVar.slice(1)}`;
      stateHooks.add(`  const [${stateVar}, ${setter}] = useState<any[]>(${JSON.stringify(ds.data || [], null, 2)});`);

      if (ds.type === 'rest' && ds.endpoint) {
        usesEffects = true;
        effectHooks.add(`  useEffect(() => {
    // Fetch live data from ${ds.name}
    fetch('${ds.endpoint}')
      .then((res) => res.json())
      .then((json) => {
        const items = Array.isArray(json) ? json : json.data || json.items || [];
        ${setter}(items);
      })
      .catch((err) => console.error('Error fetching ${ds.name}:', err));
  }, []);`);
      }
    }
  });

  function toStyleObject(styles: FlexComponent['styles']): string {
    const validStyles: Record<string, string> = {};
    if (styles.width) validStyles.width = styles.width;
    if (styles.height) validStyles.height = styles.height;
    if (styles.maxWidth) validStyles.maxWidth = styles.maxWidth;
    if (styles.minHeight) validStyles.minHeight = styles.minHeight;
    if (styles.padding) validStyles.padding = styles.padding;
    if (styles.margin) validStyles.margin = styles.margin;
    if (styles.backgroundColor) validStyles.backgroundColor = styles.backgroundColor;
    if (styles.textColor) validStyles.color = styles.textColor;
    if (styles.borderColor) validStyles.borderColor = styles.borderColor;
    if (styles.borderWidth) {
      validStyles.borderWidth = styles.borderWidth;
      validStyles.borderStyle = styles.borderStyle || 'solid';
    }
    if (styles.borderRadius) validStyles.borderRadius = styles.borderRadius;
    if (styles.fontSize) validStyles.fontSize = styles.fontSize;
    if (styles.fontWeight) validStyles.fontWeight = styles.fontWeight;
    if (styles.textAlign) validStyles.textAlign = styles.textAlign;
    if (styles.display) validStyles.display = styles.display;
    if (styles.flexDirection) validStyles.flexDirection = styles.flexDirection;
    if (styles.justifyContent) validStyles.justifyContent = styles.justifyContent;
    if (styles.alignItems) validStyles.alignItems = styles.alignItems;
    if (styles.gap) validStyles.gap = styles.gap;
    if (styles.gridColumns) validStyles.gridTemplateColumns = styles.gridColumns;
    if (styles.boxShadow) validStyles.boxShadow = styles.boxShadow;
    if (styles.cursor) validStyles.cursor = styles.cursor;

    if (Object.keys(validStyles).length === 0) return '';
    return JSON.stringify(validStyles);
  }

  function renderJSX(comp: FlexComponent, indent = 4): string {
    const spaces = ' '.repeat(indent);
    const styleAttr = toStyleObject(comp.styles) ? ` style={${toStyleObject(comp.styles)}}` : '';

    // Collect event handlers
    const eventProps: string[] = [];
    if (comp.events) {
      comp.events.forEach((ev) => {
        const handlerName = ev.functionName || `on${comp.type.replace(/-/g, '_')}_${ev.event}`;
        eventProps.push(`${ev.event}={${handlerName}}`);
        if (!handlers.has(handlerName)) {
          const body = ev.customCode.trim() || `console.log('${handlerName} called');`;
          handlers.set(
            handlerName,
            `  const ${handlerName} = (e?: React.SyntheticEvent) => {\n    ${body}\n  };`
          );
        }
      });
    }

    const eventString = eventProps.length > 0 ? ' ' + eventProps.join(' ') : '';
    const hasChildren = comp.children && comp.children.length > 0;

    // Check if component has repeat binding enabled
    const isRepeatMode = comp.dataBinding?.enabled && comp.dataBinding.mode === 'repeat';
    const dsKey = `${(comp.dataBinding?.dataSourceId || 'ds-users').replace(/[^a-zA-Z0-9]/g, '_')}_data`;

    switch (comp.type) {
      case 'data-table': {
        const tableDsKey = `${(comp.dataBinding?.dataSourceId || 'ds-users').replace(/[^a-zA-Z0-9]/g, '_')}_data`;
        const searchStateKey = `search_${comp.id.replace(/-/g, '_')}`;
        stateHooks.add(`  const [${searchStateKey}, set${searchStateKey.charAt(0).toUpperCase() + searchStateKey.slice(1)}] = useState('');`);

        const cols = (comp.props.columns || [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }])
          .map((c: any) => `${spaces}        <th className="py-2.5 px-4 font-medium">${c.label || c.key}</th>`)
          .join('\n');

        const colCells = (comp.props.columns || [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }])
          .map((c: any) => `${spaces}            <td className="py-2.5 px-4 text-slate-400">{row.${c.key}}</td>`)
          .join('\n');

        return `${spaces}{/* Data Table (${comp.props.title || 'Data Table'}) */}
${spaces}<div id="${comp.id}"${styleAttr} className="w-full flex flex-col overflow-hidden text-xs bg-slate-900 border border-slate-700/80 rounded-xl">
${spaces}  <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
${spaces}    <span className="font-bold text-white text-sm">{${JSON.stringify(comp.props.title || 'Data Directory')}}</span>
${spaces}    <input
${spaces}      type="text"
${spaces}      placeholder="Search records..."
${spaces}      value={${searchStateKey}}
${spaces}      onChange={(e) => set${searchStateKey.charAt(0).toUpperCase() + searchStateKey.slice(1)}(e.target.value)}
${spaces}      className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs text-white outline-none focus:border-emerald-500"
${spaces}    />
${spaces}  </div>
${spaces}  <div className="overflow-x-auto w-full">
${spaces}    <table className="w-full text-left border-collapse">
${spaces}      <thead>
${spaces}        <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
${cols}
${spaces}        </tr>
${spaces}      </thead>
${spaces}      <tbody className="divide-y divide-slate-800/60">
${spaces}        {${tableDsKey}
${spaces}          .filter((row: any) => !${searchStateKey} || Object.values(row).some((v) => String(v).toLowerCase().includes(${searchStateKey}.toLowerCase())))
${spaces}          .map((row: any, idx: number) => (
${spaces}          <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
${colCells}
${spaces}          </tr>
${spaces}        ))}
${spaces}      </tbody>
${spaces}    </table>
${spaces}  </div>
${spaces}</div>`;
      }

      case 'button':
      case 'button-outlined':
      case 'button-fab': {
        const labelExpr = toJSXToken(comp.props.label, 'Button');
        if (comp.props.targetRoute) {
          usesRouter = true;
          return `${spaces}<button id="${comp.id}"${styleAttr} onClick={() => navigate('${comp.props.targetRoute}')} className="transition-all active:scale-95">\n${spaces}  {${labelExpr}}\n${spaces}</button>`;
        }
        return `${spaces}<button id="${comp.id}"${styleAttr}${eventString} className="transition-all active:scale-95">\n${spaces}  {${labelExpr}}\n${spaces}</button>`;
      }

      case 'input': {
        const stateKey = `inputValue_${comp.id.replace(/-/g, '_')}`;
        stateHooks.add(`  const [${stateKey}, set${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)}] = useState('');`);
        const labelExpr = toJSXToken(comp.props.label);
        const placeholderExpr = comp.props.placeholder ? toJSXToken(comp.props.placeholder) : '""';
        return `${spaces}<div id="${comp.id}" className="flex flex-col gap-1 w-full">\n${spaces}  {${labelExpr} && <label className="text-xs font-medium text-slate-400">{${labelExpr}}</label>}\n${spaces}  <input\n${spaces}    type="${comp.props.inputType || 'text'}"\n${spaces}    placeholder={${placeholderExpr}}\n${spaces}    value={${stateKey}}\n${spaces}    onChange={(e) => set${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)}(e.target.value)}\n${spaces}   ${styleAttr}${eventString}\n${spaces}    className="outline-none transition-colors focus:ring-2 focus:ring-blue-500"\n${spaces}  />\n${spaces}</div>`;
      }

      case 'textarea': {
        const labelExpr = toJSXToken(comp.props.label);
        const placeholderExpr = comp.props.placeholder ? toJSXToken(comp.props.placeholder) : '""';
        return `${spaces}<div id="${comp.id}" className="flex flex-col gap-1 w-full">\n${spaces}  {${labelExpr} && <label className="text-xs font-medium text-slate-400">{${labelExpr}}</label>}\n${spaces}  <textarea\n${spaces}    rows={${comp.props.rows || 3}}\n${spaces}    placeholder={${placeholderExpr}}\n${spaces}   ${styleAttr}${eventString}\n${spaces}    className="outline-none transition-colors focus:ring-2 focus:ring-blue-500"\n${spaces}  />\n${spaces}</div>`;
      }

      case 'checkbox': {
        const labelExpr = toJSXToken(comp.props.label);
        return `${spaces}<label id="${comp.id}"${styleAttr} className="cursor-pointer select-none">\n${spaces}  <input type="checkbox" defaultChecked={${Boolean(comp.props.checked)}}${eventString} className="rounded accent-blue-600" />\n${spaces}  <span>{${labelExpr}}</span>\n${spaces}</label>`;
      }

      case 'switch': {
        const switchState = `switch_${comp.id.replace(/-/g, '_')}`;
        stateHooks.add(`  const [${switchState}, set${switchState.charAt(0).toUpperCase() + switchState.slice(1)}] = useState(${Boolean(comp.props.checked)});`);
        const labelExpr = toJSXToken(comp.props.label, 'Toggle');
        return `${spaces}<div id="${comp.id}"${styleAttr} className="flex items-center justify-between">\n${spaces}  <span>{${labelExpr}}</span>\n${spaces}  <button\n${spaces}    type="button"\n${spaces}    onClick={() => set${switchState.charAt(0).toUpperCase() + switchState.slice(1)}(!${switchState})}\n${spaces}    className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${${switchState} ? 'bg-blue-600' : 'bg-slate-700'}\`}\n${spaces}  >\n${spaces}    <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${${switchState} ? 'translate-x-6' : 'translate-x-1'}\`} />\n${spaces}  </button>\n${spaces}</div>`;
      }

      case 'select': {
        const labelExpr = toJSXToken(comp.props.label);
        const opts = (comp.props.options || []).map((o: string) => `${spaces}    <option value="${o}">{${JSON.stringify(o)}}</option>`).join('\n');
        return `${spaces}<div id="${comp.id}" className="flex flex-col gap-1 w-full">\n${spaces}  {${labelExpr} && <label className="text-xs font-medium text-slate-400">{${labelExpr}}</label>}\n${spaces}  <select${styleAttr}${eventString} className="outline-none">\n${opts}\n${spaces}  </select>\n${spaces}</div>`;
      }

      case 'slider': {
        const labelExpr = toJSXToken(comp.props.label, 'Slider');
        return `${spaces}<div id="${comp.id}"${styleAttr} className="flex flex-col gap-1 w-full">\n${spaces}  <div className="flex justify-between text-xs text-slate-400">\n${spaces}    <span>{${labelExpr}}</span>\n${spaces}  </div>\n${spaces}  <input type="range" min={${comp.props.min || 0}} max={${comp.props.max || 100}} defaultValue={${comp.props.value || 50}} className="accent-blue-500" />\n${spaces}</div>`;
      }

      case 'card': {
        const titleExpr = comp.props.title ? toJSXToken(comp.props.title) : '';
        const subtitleExpr = comp.props.subtitle ? toJSXToken(comp.props.subtitle) : '';

        if (isRepeatMode) {
          const childrenJSX = hasChildren
            ? comp.children!.map((c) => renderJSX(c, indent + 4)).join('\n')
            : '';
          return `${spaces}{/* Repeat Card Loop */}\n${spaces}{${dsKey}.map((item: any, idx: number) => (\n${spaces}  <div key={item.id || idx} id="${comp.id}"${styleAttr} className="shadow-lg">\n${titleExpr ? `${spaces}    <div className="border-b border-slate-700/60 pb-3 mb-2">\n${spaces}      <h3 className="text-lg font-semibold text-white">{${titleExpr}}</h3>\n${subtitleExpr ? `${spaces}      <p className="text-xs text-slate-400 mt-0.5">{${subtitleExpr}}</p>\n` : ''}${spaces}    </div>\n` : ''}${childrenJSX ? `${childrenJSX}\n` : ''}${spaces}  </div>\n${spaces}))}`;
        }

        const childrenJSX = hasChildren
          ? comp.children!.map((c) => renderJSX(c, indent + 2)).join('\n')
          : '';
        return `${spaces}<div id="${comp.id}"${styleAttr} className="shadow-lg">\n${titleExpr ? `${spaces}  <div className="border-b border-slate-700/60 pb-3 mb-2">\n${spaces}    <h3 className="text-lg font-semibold text-white">{${titleExpr}}</h3>\n${subtitleExpr ? `${spaces}    <p className="text-xs text-slate-400 mt-0.5">{${subtitleExpr}}</p>\n` : ''}${spaces}  </div>\n` : ''}${childrenJSX ? `${childrenJSX}\n` : ''}${spaces}</div>`;
      }

      case 'container':
      case 'grid': {
        if (isRepeatMode) {
          const childrenJSX = hasChildren
            ? comp.children!.map((c) => renderJSX(c, indent + 4)).join('\n')
            : '';
          return `${spaces}<div id="${comp.id}"${styleAttr}>\n${spaces}  {${dsKey}.map((item: any, idx: number) => (\n${spaces}    <React.Fragment key={item.id || idx}>\n${childrenJSX}\n${spaces}    </React.Fragment>\n${spaces}  ))}\n${spaces}</div>`;
        }

        const childrenJSX = hasChildren
          ? '\n' + comp.children!.map((c) => renderJSX(c, indent + 2)).join('\n') + `\n${spaces}`
          : '';
        return `${spaces}<div id="${comp.id}"${styleAttr}>${childrenJSX}</div>`;
      }

      case 'heading': {
        const Tag = comp.props.level || 'h2';
        const textExpr = toJSXToken(comp.props.text, 'Heading');
        return `${spaces}<${Tag} id="${comp.id}"${styleAttr}>{${textExpr}}</${Tag}>`;
      }

      case 'paragraph': {
        const textExpr = toJSXToken(comp.props.text, '');
        return `${spaces}<p id="${comp.id}"${styleAttr}>{${textExpr}}</p>`;
      }

      case 'badge': {
        const textExpr = toJSXToken(comp.props.text, 'Badge');
        return `${spaces}<span id="${comp.id}"${styleAttr}>{${textExpr}}</span>`;
      }

      case 'alert': {
        const titleExpr = toJSXToken(comp.props.title, 'Notice');
        const messageExpr = toJSXToken(comp.props.message, '');
        return `${spaces}<div id="${comp.id}"${styleAttr}>\n${spaces}  <div className="font-semibold">{${titleExpr}}</div>\n${spaces}  <p className="text-xs mt-0.5">{${messageExpr}}</p>\n${spaces}</div>`;
      }

      case 'avatar': {
        const srcExpr = toJSXToken(comp.props.src, '');
        const nameExpr = toJSXToken(comp.props.name, 'Avatar');
        return `${spaces}<img id="${comp.id}" src={${srcExpr}} alt={${nameExpr}}${styleAttr} className="object-cover" />`;
      }

      case 'divider': {
        return `${spaces}<hr id="${comp.id}"${styleAttr} />`;
      }

      case 'progress': {
        return `${spaces}<div id="${comp.id}"${styleAttr} className="overflow-hidden">\n${spaces}  <div className="h-full bg-blue-500 rounded-full" style={{ width: '${comp.props.value || 50}%' }} />\n${spaces}</div>`;
      }

      default: {
        if (hasChildren) {
          const childrenJSX = comp.children!.map((c) => renderJSX(c, indent + 2)).join('\n');
          return `${spaces}<div id="${comp.id}"${styleAttr}${eventString}>\n${comp.props.title ? `${spaces}  <h3 className="font-bold">{${toJSXToken(comp.props.title)}}</h3>\n` : ''}${childrenJSX}\n${spaces}</div>`;
        }
        return `${spaces}<div id="${comp.id}"${styleAttr}${eventString}>{${toJSXToken(comp.props.label || comp.props.title || comp.name)}}</div>`;
      }
    }
  }

  const renderedElements = components.map((c) => renderJSX(c, 6)).join('\n\n');
  const hooksBlock = stateHooks.size > 0 ? Array.from(stateHooks).join('\n') + '\n\n' : '';
  const effectsBlock = effectHooks.size > 0 ? Array.from(effectHooks).join('\n\n') + '\n\n' : '';
  const handlersBlock = handlers.size > 0 ? Array.from(handlers.values()).join('\n\n') + '\n\n' : '';
  const navHook = usesRouter ? '  const navigate = useNavigate();\n' : '';
  const routerImport = usesRouter ? "import { useNavigate } from 'react-router-dom';\n" : '';
  const reactImports = usesEffects ? 'import React, { useState, useEffect } from ' : 'import React, { useState } from ';

  return `${reactImports}'react';
${routerImport}
export default function ${componentName}() {
${navHook}${hooksBlock}${effectsBlock}${handlersBlock}  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-4 max-w-5xl mx-auto">
${renderedElements}
    </div>
  );
}
`;
}
