import { FlexComponent } from '../../types';

export function generateReactCode(components: FlexComponent[], componentName = 'FlexApp'): string {
  const stateHooks: Set<string> = new Set();
  const handlers: Map<string, string> = new Map();

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
        const handlerName = ev.functionName || `on${comp.type}_${ev.event}`;
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

    switch (comp.type) {
      case 'button':
      case 'button-outlined':
      case 'button-fab': {
        return `${spaces}<button${styleAttr}${eventString} className="transition-all active:scale-95">\n${spaces}  {${JSON.stringify(comp.props.label || 'Button')}}\n${spaces}</button>`;
      }

      case 'input': {
        const stateKey = `inputValue_${comp.id.replace(/-/g, '_')}`;
        stateHooks.add(`  const [${stateKey}, set${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)}] = useState('');`);
        return `${spaces}<div className="flex flex-col gap-1 w-full">\n${spaces}  {${JSON.stringify(comp.props.label || '')} && <label className="text-xs font-medium text-slate-300">{${JSON.stringify(comp.props.label)}}\n${spaces}  </label>}\n${spaces}  <input\n${spaces}    type="${comp.props.inputType || 'text'}"\n${spaces}    placeholder="${comp.props.placeholder || ''}"\n${spaces}    value={${stateKey}}\n${spaces}    onChange={(e) => set${stateKey.charAt(0).toUpperCase() + stateKey.slice(1)}(e.target.value)}\n${spaces}   ${styleAttr}${eventString}\n${spaces}    className="outline-none transition-colors focus:ring-2 focus:ring-blue-500"\n${spaces}  />\n${spaces}</div>`;
      }

      case 'textarea': {
        return `${spaces}<div className="flex flex-col gap-1 w-full">\n${spaces}  {${JSON.stringify(comp.props.label || '')} && <label className="text-xs font-medium text-slate-300">{${JSON.stringify(comp.props.label)}}\n${spaces}  </label>}\n${spaces}  <textarea\n${spaces}    rows={${comp.props.rows || 3}}\n${spaces}    placeholder="${comp.props.placeholder || ''}"\n${spaces}   ${styleAttr}${eventString}\n${spaces}    className="outline-none transition-colors focus:ring-2 focus:ring-blue-500"\n${spaces}  />\n${spaces}</div>`;
      }

      case 'checkbox': {
        return `${spaces}<label${styleAttr} className="cursor-pointer select-none">\n${spaces}  <input type="checkbox" defaultChecked={${Boolean(comp.props.checked)}}${eventString} className="rounded accent-blue-600" />\n${spaces}  <span>{${JSON.stringify(comp.props.label || '')}}</span>\n${spaces}</label>`;
      }

      case 'switch': {
        const switchState = `switch_${comp.id.replace(/-/g, '_')}`;
        stateHooks.add(`  const [${switchState}, set${switchState.charAt(0).toUpperCase() + switchState.slice(1)}] = useState(${Boolean(comp.props.checked)});`);
        return `${spaces}<div${styleAttr} className="flex items-center justify-between">\n${spaces}  <span>{${JSON.stringify(comp.props.label || 'Toggle')}}</span>\n${spaces}  <button\n${spaces}    type="button"\n${spaces}    onClick={() => set${switchState.charAt(0).toUpperCase() + switchState.slice(1)}(!${switchState})}\n${spaces}    className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${${switchState} ? 'bg-blue-600' : 'bg-slate-700'}\`}\n${spaces}  >\n${spaces}    <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${${switchState} ? 'translate-x-6' : 'translate-x-1'}\`} />\n${spaces}  </button>\n${spaces}</div>`;
      }

      case 'select': {
        const opts = (comp.props.options || []).map((o: string) => `${spaces}    <option value="${o}">{${JSON.stringify(o)}}</option>`).join('\n');
        return `${spaces}<div className="flex flex-col gap-1 w-full">\n${spaces}  {${JSON.stringify(comp.props.label || '')} && <label className="text-xs font-medium text-slate-300">{${JSON.stringify(comp.props.label)}}\n${spaces}  </label>}\n${spaces}  <select${styleAttr}${eventString} className="outline-none">\n${opts}\n${spaces}  </select>\n${spaces}</div>`;
      }

      case 'slider': {
        return `${spaces}<div${styleAttr} className="flex flex-col gap-1 w-full">\n${spaces}  <div className="flex justify-between text-xs text-slate-300">\n${spaces}    <span>{${JSON.stringify(comp.props.label || 'Slider')}}</span>\n${spaces}  </div>\n${spaces}  <input type="range" min={${comp.props.min || 0}} max={${comp.props.max || 100}} defaultValue={${comp.props.value || 50}} className="accent-blue-500" />\n${spaces}</div>`;
      }

      case 'card': {
        const childrenJSX = hasChildren
          ? comp.children!.map((c) => renderJSX(c, indent + 2)).join('\n')
          : '';
        return `${spaces}<div${styleAttr} className="shadow-lg">\n${comp.props.title ? `${spaces}  <div className="border-b border-slate-700/60 pb-3 mb-2">\n${spaces}    <h3 className="text-lg font-semibold text-white">{${JSON.stringify(comp.props.title)}}</h3>\n${comp.props.subtitle ? `${spaces}    <p className="text-xs text-slate-400 mt-0.5">{${JSON.stringify(comp.props.subtitle)}}</p>\n` : ''}${spaces}  </div>\n` : ''}${childrenJSX ? `${childrenJSX}\n` : ''}${spaces}</div>`;
      }

      case 'container': {
        const childrenJSX = hasChildren
          ? '\n' + comp.children!.map((c) => renderJSX(c, indent + 2)).join('\n') + `\n${spaces}`
          : '';
        return `${spaces}<div${styleAttr}>${childrenJSX}</div>`;
      }

      case 'grid': {
        const childrenJSX = hasChildren
          ? '\n' + comp.children!.map((c) => renderJSX(c, indent + 2)).join('\n') + `\n${spaces}`
          : '';
        return `${spaces}<div${styleAttr}>${childrenJSX}</div>`;
      }

      case 'heading': {
        const Tag = comp.props.level || 'h2';
        return `${spaces}<${Tag}${styleAttr}>{${JSON.stringify(comp.props.text || 'Heading')}}</${Tag}>`;
      }

      case 'paragraph': {
        return `${spaces}<p${styleAttr}>{${JSON.stringify(comp.props.text || '')}}</p>`;
      }

      case 'badge': {
        return `${spaces}<span${styleAttr}>{${JSON.stringify(comp.props.text || 'Badge')}}</span>`;
      }

      case 'alert': {
        return `${spaces}<div${styleAttr}>\n${spaces}  <div className="font-semibold">{${JSON.stringify(comp.props.title || 'Notice')}}</div>\n${spaces}  <p className="text-xs mt-0.5">{${JSON.stringify(comp.props.message || '')}}</p>\n${spaces}</div>`;
      }

      case 'avatar': {
        return `${spaces}<img src="${comp.props.src || ''}" alt="${comp.props.name || 'Avatar'}"${styleAttr} className="object-cover" />`;
      }

      case 'divider': {
        return `${spaces}<hr${styleAttr} />`;
      }

      case 'progress': {
        return `${spaces}<div${styleAttr} className="overflow-hidden">\n${spaces}  <div className="h-full bg-blue-500 rounded-full" style={{ width: '${comp.props.value || 50}%' }} />\n${spaces}</div>`;
      }

      default: {
        if (hasChildren) {
          const childrenJSX = comp.children!.map((c) => renderJSX(c, indent + 2)).join('\n');
          return `${spaces}<div${styleAttr}${eventString}>\n${comp.props.title ? `${spaces}  <h3 className="font-bold">{${JSON.stringify(comp.props.title)}}</h3>\n` : ''}${childrenJSX}\n${spaces}</div>`;
        }
        return `${spaces}<div${styleAttr}${eventString}>{${JSON.stringify(comp.props.label || comp.props.title || comp.name)}}</div>`;
      }
    }
  }

  const renderedElements = components.map((c) => renderJSX(c, 6)).join('\n\n');
  const hooksBlock = stateHooks.size > 0 ? Array.from(stateHooks).join('\n') + '\n\n' : '';
  const handlersBlock = handlers.size > 0 ? Array.from(handlers.values()).join('\n\n') + '\n\n' : '';

  return `import React, { useState } from 'react';

export default function ${componentName}() {
${hooksBlock}${handlersBlock}  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-4 max-w-5xl mx-auto">
${renderedElements}
    </div>
  );
}
`;
}
