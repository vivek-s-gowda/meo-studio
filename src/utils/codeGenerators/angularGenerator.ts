import { FlexComponent, DataSource } from '../../types';

function toAngularToken(str: string | undefined, defaultVal = ''): string {
  if (!str) return defaultVal;
  if (/^\{\{\s*(?:item\.)?([a-zA-Z0-9_.]+)\s*\}\}$/.test(str)) {
    const field = str.replace(/\{\{\s*(?:item\.)?([a-zA-Z0-9_.]+)\s*\}\}/, '$1');
    return `{{ item?.${field} }}`;
  }
  if (/\{\{\s*(?:item\.)?([a-zA-Z0-9_.]+)\s*\}\}/.test(str)) {
    return str.replace(/\{\{\s*(?:item\.)?([a-zA-Z0-9_.]+)\s*\}\}/g, '{{ item?.$1 }}');
  }
  return str;
}

export function generateAngularCode(
  components: FlexComponent[],
  componentName = 'FlexAppComponent',
  dataSources: DataSource[] = []
): string {
  const properties: Set<string> = new Set();
  const methods: Map<string, string> = new Map();
  const onInitStatements: Set<string> = new Set();
  const usedDataSources: Set<string> = new Set();

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

  dataSources.forEach((ds) => {
    if (usedDataSources.has(ds.id)) {
      const propKey = `${ds.id.replace(/[^a-zA-Z0-9]/g, '_')}_data`;
      properties.add(`  ${propKey}: any[] = ${JSON.stringify(ds.data || [], null, 2)};`);

      if (ds.type === 'rest' && ds.endpoint) {
        onInitStatements.add(`    // Fetch ${ds.name}
    fetch('${ds.endpoint}')
      .then(r => r.json())
      .then(json => {
        this.${propKey} = Array.isArray(json) ? json : json.data || [];
      })
      .catch(err => console.error(err));`);
      }
    }
  });

  function renderTemplate(comp: FlexComponent, indent = 4): string {
    const spaces = ' '.repeat(indent);
    const classes = `flex-comp-${comp.id}`;

    const eventProps: string[] = [];
    if (comp.events) {
      comp.events.forEach((ev) => {
        const ngEvent =
          ev.event === 'onClick'
            ? '(click)'
            : ev.event === 'onChange'
            ? '(change)'
            : `(${ev.event.toLowerCase().replace('on', '')})`;
        const handlerName = ev.functionName || `handle${comp.type.replace(/-/g, '_')}`;
        eventProps.push(`${ngEvent}="${handlerName}($event)"`);
        if (!methods.has(handlerName)) {
          methods.set(
            handlerName,
            `  ${handlerName}(event?: any): void {\n    ${
              ev.customCode.trim() || `console.log('${handlerName} called');`
            }\n  }`
          );
        }
      });
    }

    const eventString = eventProps.length > 0 ? ' ' + eventProps.join(' ') : '';
    const hasChildren = comp.children && comp.children.length > 0;
    const isRepeatMode = comp.dataBinding?.enabled && comp.dataBinding.mode === 'repeat';
    const dsKey = `${(comp.dataBinding?.dataSourceId || 'ds-users').replace(/[^a-zA-Z0-9]/g, '_')}_data`;

    switch (comp.type) {
      case 'data-table': {
        const tableDsKey = `${(comp.dataBinding?.dataSourceId || 'ds-users').replace(/[^a-zA-Z0-9]/g, '_')}_data`;
        const searchProp = `search_${comp.id.replace(/-/g, '_')}`;
        properties.add(`  ${searchProp}: string = '';`);

        const cols = (comp.props.columns || [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }])
          .map((c: any) => `${spaces}        <th>${c.label || c.key}</th>`)
          .join('\n');

        const colCells = (comp.props.columns || [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }])
          .map((c: any) => `${spaces}          <td>{{ row.${c.key} }}</td>`)
          .join('\n');

        return `${spaces}<!-- Angular 17+ Material Data Table -->
${spaces}<div class="${classes} table-card">
${spaces}  <div class="table-header">
${spaces}    <h3>${comp.props.title || 'Data Table'}</h3>
${spaces}    <input [(ngModel)]="${searchProp}" placeholder="Search records..." class="table-search" />
${spaces}  </div>
${spaces}  <table class="data-table">
${spaces}    <thead>
${spaces}      <tr>
${cols}
${spaces}      </tr>
${spaces}    </thead>
${spaces}    <tbody>
${spaces}      @for (row of ${tableDsKey}; track row.id || $index) {
${spaces}        <tr>
${colCells}
${spaces}        </tr>
${spaces}      }
${spaces}    </tbody>
${spaces}  </table>
${spaces}</div>`;
      }

      case 'button':
      case 'button-outlined':
      case 'button-fab':
        return `${spaces}<button class="${classes}"${eventString}>${toAngularToken(comp.props.label, 'Button')}</button>`;

      case 'input': {
        const propName = `input_${comp.id.replace(/-/g, '_')}`;
        properties.add(`  ${propName}: string = '';`);
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label *ngIf="'${comp.props.label || ''}'">${toAngularToken(comp.props.label)}</label>\n${spaces}  <input [(ngModel)]="${propName}" type="${comp.props.inputType || 'text'}" placeholder="${toAngularToken(comp.props.placeholder)}" class="${classes}"${eventString} />\n${spaces}</div>`;
      }

      case 'checkbox': {
        const propName = `checkbox_${comp.id.replace(/-/g, '_')}`;
        properties.add(`  ${propName}: boolean = ${Boolean(comp.props.checked)};`);
        return `${spaces}<label class="${classes}">\n${spaces}  <input type="checkbox" [(ngModel)]="${propName}"${eventString} />\n${spaces}  <span>${toAngularToken(comp.props.label)}</span>\n${spaces}</label>`;
      }

      case 'switch': {
        const propName = `switch_${comp.id.replace(/-/g, '_')}`;
        properties.add(`  ${propName}: boolean = ${Boolean(comp.props.checked)};`);
        return `${spaces}<div class="${classes}">\n${spaces}  <span>${toAngularToken(comp.props.label, 'Switch')}</span>\n${spaces}  <input type="checkbox" [(ngModel)]="${propName}"${eventString} />\n${spaces}</div>`;
      }

      case 'select': {
        const propName = `select_${comp.id.replace(/-/g, '_')}`;
        properties.add(`  ${propName}: string = '${(comp.props.options && comp.props.options[0]) || ''}';`);
        const opts = (comp.props.options || []).map((o: string) => `${spaces}    <option value="${o}">${o}</option>`).join('\n');
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label>${toAngularToken(comp.props.label, 'Select')}</label>\n${spaces}  <select [(ngModel)]="${propName}" class="${classes}"${eventString}>\n${opts}\n${spaces}  </select>\n${spaces}</div>`;
      }

      case 'slider': {
        const propName = `slider_${comp.id.replace(/-/g, '_')}`;
        properties.add(`  ${propName}: number = ${comp.props.value || 50};`);
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label>${toAngularToken(comp.props.label, 'Slider')}: {{ ${propName} }}</label>\n${spaces}  <input type="range" min="${comp.props.min || 0}" max="${comp.props.max || 100}" [(ngModel)]="${propName}" class="${classes}" />\n${spaces}</div>`;
      }

      case 'card': {
        if (isRepeatMode) {
          const children = hasChildren ? '\n' + comp.children!.map((c) => renderTemplate(c, indent + 4)).join('\n') + `\n${spaces}  ` : '';
          return `${spaces}@for (item of ${dsKey}; track item.id || $index) {\n${spaces}  <div class="${classes} card">\n${comp.props.title ? `${spaces}    <div class="card-header">\n${spaces}      <h3>${toAngularToken(comp.props.title)}</h3>\n${comp.props.subtitle ? `${spaces}      <p>${toAngularToken(comp.props.subtitle)}</p>\n` : ''}${spaces}    </div>\n` : ''}${children}</div>\n${spaces}}`;
        }

        const children = hasChildren ? '\n' + comp.children!.map((c) => renderTemplate(c, indent + 2)).join('\n') + `\n${spaces}` : '';
        return `${spaces}<div class="${classes} card">\n${comp.props.title ? `${spaces}  <div class="card-header">\n${spaces}    <h3>${toAngularToken(comp.props.title)}</h3>\n${comp.props.subtitle ? `${spaces}    <p>${toAngularToken(comp.props.subtitle)}</p>\n` : ''}${spaces}  </div>\n` : ''}${children}</div>`;
      }

      case 'container':
      case 'grid': {
        if (isRepeatMode) {
          const children = hasChildren ? '\n' + comp.children!.map((c) => renderTemplate(c, indent + 4)).join('\n') + `\n${spaces}  ` : '';
          return `${spaces}<div class="${classes}">\n${spaces}  @for (item of ${dsKey}; track item.id || $index) {\n${spaces}    <div class="repeat-item">${children}</div>\n${spaces}  }\n${spaces}</div>`;
        }

        const children = hasChildren ? '\n' + comp.children!.map((c) => renderTemplate(c, indent + 2)).join('\n') + `\n${spaces}` : '';
        return `${spaces}<div class="${classes}">${children}</div>`;
      }

      case 'heading': {
        const tag = comp.props.level || 'h2';
        return `${spaces}<${tag} class="${classes}">${toAngularToken(comp.props.text, 'Heading')}</${tag}>`;
      }

      case 'paragraph': {
        return `${spaces}<p class="${classes}">${toAngularToken(comp.props.text, '')}</p>`;
      }

      case 'badge': {
        return `${spaces}<span class="${classes}">${toAngularToken(comp.props.text, 'Badge')}</span>`;
      }

      case 'alert': {
        return `${spaces}<div class="${classes} alert">\n${spaces}  <strong>${toAngularToken(comp.props.title, 'Notice')}</strong>\n${spaces}  <p>${toAngularToken(comp.props.message, '')}</p>\n${spaces}</div>`;
      }

      case 'avatar': {
        return `${spaces}<img [src]="'${comp.props.src || ''}'" alt="${toAngularToken(comp.props.name, 'Avatar')}" class="${classes}" />`;
      }

      case 'divider': {
        return `${spaces}<hr class="${classes}" />`;
      }

      default: {
        if (hasChildren) {
          const children = comp.children!.map((c) => renderTemplate(c, indent + 2)).join('\n');
          return `${spaces}<div class="${classes}"${eventString}>\n${children}\n${spaces}</div>`;
        }
        return `${spaces}<div class="${classes}"${eventString}>${toAngularToken(comp.props.label || comp.props.title || comp.name)}</div>`;
      }
    }
  }

  // Styles
  const cssRules: string[] = [];
  function collectStyles(comp: FlexComponent) {
    const s = comp.styles;
    const rules: string[] = [];
    if (s.width) rules.push(`      width: ${s.width};`);
    if (s.height) rules.push(`      height: ${s.height};`);
    if (s.maxWidth) rules.push(`      max-width: ${s.maxWidth};`);
    if (s.minHeight) rules.push(`      min-height: ${s.minHeight};`);
    if (s.padding) rules.push(`      padding: ${s.padding};`);
    if (s.margin) rules.push(`      margin: ${s.margin};`);
    if (s.backgroundColor) rules.push(`      background-color: ${s.backgroundColor};`);
    if (s.textColor) rules.push(`      color: ${s.textColor};`);
    if (s.borderColor) rules.push(`      border-color: ${s.borderColor};`);
    if (s.borderWidth) rules.push(`      border-width: ${s.borderWidth};`);
    if (s.borderWidth && !s.borderStyle) rules.push(`      border-style: solid;`);
    if (s.borderRadius) rules.push(`      border-radius: ${s.borderRadius};`);
    if (s.fontSize) rules.push(`      font-size: ${s.fontSize};`);
    if (s.fontWeight) rules.push(`      font-weight: ${s.fontWeight};`);
    if (s.textAlign) rules.push(`      text-align: ${s.textAlign};`);
    if (s.boxShadow) rules.push(`      box-shadow: ${s.boxShadow};`);
    if (s.display) rules.push(`      display: ${s.display};`);
    if (s.flexDirection) rules.push(`      flex-direction: ${s.flexDirection};`);
    if (s.justifyContent) rules.push(`      justify-content: ${s.justifyContent};`);
    if (s.alignItems) rules.push(`      align-items: ${s.alignItems};`);
    if (s.gap) rules.push(`      gap: ${s.gap};`);
    if (s.gridColumns) rules.push(`      grid-template-columns: ${s.gridColumns};`);

    if (rules.length > 0) {
      cssRules.push(`    .flex-comp-${comp.id} {\n${rules.join('\n')}\n    }`);
    }
    if (comp.children) {
      comp.children.forEach(collectStyles);
    }
  }

  components.forEach(collectStyles);

  const renderedTemplate = components.map((c) => renderTemplate(c, 4)).join('\n\n');
  const propertiesBlock = Array.from(properties).join('\n');
  const methodsBlock = Array.from(methods.values()).join('\n\n');
  const hasOnInit = onInitStatements.size > 0;
  const initMethod = hasOnInit
    ? `  ngOnInit(): void {\n${Array.from(onInitStatements).join('\n\n')}\n  }`
    : '';

  return `import { Component${hasOnInit ? ', OnInit' : ''} } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-flex-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
    <div class="flex-app-container">
${renderedTemplate}
    </div>
  \`,
  styles: [\`
    .flex-app-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .table-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      overflow: hidden;
    }
    .table-header {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      border-bottom: 1px solid #334155;
    }
    .table-search {
      padding: 6px 12px;
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 6px;
      color: #fff;
      font-size: 12px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th, .data-table td {
      padding: 10px 16px;
      text-align: left;
    }
    .data-table thead {
      background: #0f172a;
      color: #94a3b8;
      font-size: 11px;
      text-transform: uppercase;
    }
    .data-table tbody tr {
      border-bottom: 1px solid #334155;
    }
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }
${cssRules.join('\n\n')}
  \`]
})
export class ${componentName}${hasOnInit ? ' implements OnInit' : ''} {
${propertiesBlock}

${initMethod}

${methodsBlock}
}
`;
}
