import { FlexComponent, DataSource } from '../../types';

export function generateHTML(components: FlexComponent[], dataSources: DataSource[] = []): string {
  function renderComponent(comp: FlexComponent, indent = 2): string {
    const spaces = ' '.repeat(indent);
    const classes = `flex-comp flex-comp-${comp.id}`;
    const idAttr = `id="${comp.id}"`;

    let innerContent = '';
    const hasChildren = comp.children && comp.children.length > 0;

    switch (comp.type) {
      case 'data-table': {
        const cols = (comp.props.columns || [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }])
          .map((c: any) => `${spaces}        <th>${c.label || c.key}</th>`)
          .join('\n');
        return `${spaces}<!-- Material Data Table -->
${spaces}<div ${idAttr} class="${classes} table-card">
${spaces}  <div class="table-header">
${spaces}    <h3>${comp.props.title || 'Data Directory'}</h3>
${spaces}    <input type="text" placeholder="Search records..." oninput="filterTable('${comp.id}', this.value)" class="table-search" />
${spaces}  </div>
${spaces}  <table class="data-table">
${spaces}    <thead>
${spaces}      <tr>
${cols}
${spaces}      </tr>
${spaces}    </thead>
${spaces}    <tbody id="tbody-${comp.id}">
${spaces}      <!-- Dynamic rows injected via loadDataSources() in script.js -->
${spaces}    </tbody>
${spaces}  </table>
${spaces}</div>`;
      }
      case 'button':
      case 'button-outlined':
      case 'button-fab': {
        const onclick = comp.events.find((e) => e.event === 'onClick')
          ? ` onclick="${comp.events.find((e) => e.event === 'onClick')?.functionName}()"`
          : '';
        return `${spaces}<button ${idAttr} class="${classes}"${onclick}>\n${spaces}  ${comp.props.label || 'Button'}\n${spaces}</button>`;
      }

      case 'input': {
        const onchange = comp.events.find((e) => e.event === 'onChange')
          ? ` oninput="${comp.events.find((e) => e.event === 'onChange')?.functionName}(event)"`
          : '';
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label for="${comp.id}">${comp.props.label || ''}</label>\n${spaces}  <input ${idAttr} type="${comp.props.inputType || 'text'}" placeholder="${comp.props.placeholder || ''}" class="${classes}"${onchange} />\n${spaces}</div>`;
      }

      case 'textarea': {
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label for="${comp.id}">${comp.props.label || ''}</label>\n${spaces}  <textarea ${idAttr} rows="${comp.props.rows || 3}" placeholder="${comp.props.placeholder || ''}" class="${classes}"></textarea>\n${spaces}</div>`;
      }

      case 'checkbox': {
        const checked = comp.props.checked ? ' checked' : '';
        const onchange = comp.events.find((e) => e.event === 'onChange')
          ? ` onchange="${comp.events.find((e) => e.event === 'onChange')?.functionName}(event)"`
          : '';
        return `${spaces}<label class="${classes}">\n${spaces}  <input ${idAttr} type="checkbox"${checked}${onchange} />\n${spaces}  <span>${comp.props.label || ''}</span>\n${spaces}</label>`;
      }

      case 'switch': {
        const checked = comp.props.checked ? ' checked' : '';
        return `${spaces}<div class="${classes}">\n${spaces}  <span>${comp.props.label || 'Switch'}</span>\n${spaces}  <input type="checkbox" class="toggle-checkbox"${checked} />\n${spaces}</div>`;
      }

      case 'radio-group': {
        const options = (comp.props.options || []).map((opt: string, i: number) => {
          const checked = i === (comp.props.selectedIndex || 0) ? ' checked' : '';
          return `${spaces}  <label><input type="radio" name="${comp.props.groupName || 'radio'}" value="${opt}"${checked}/> ${opt}</label>`;
        }).join('\n');
        return `${spaces}<div ${idAttr} class="${classes}">\n${options}\n${spaces}</div>`;
      }

      case 'select': {
        const options = (comp.props.options || []).map(
          (opt: string) => `${spaces}  <option value="${opt}">${opt}</option>`
        ).join('\n');
        return `${spaces}<div class="select-wrapper">\n${spaces}  <label>${comp.props.label || 'Select'}</label>\n${spaces}  <select ${idAttr} class="${classes}">\n${options}\n${spaces}  </select>\n${spaces}</div>`;
      }

      case 'slider': {
        return `${spaces}<div class="slider-wrapper">\n${spaces}  <label>${comp.props.label || 'Slider'}</label>\n${spaces}  <input ${idAttr} type="range" min="${comp.props.min || 0}" max="${comp.props.max || 100}" value="${comp.props.value || 50}" class="${classes}" />\n${spaces}</div>`;
      }

      case 'card': {
        const header = comp.props.title
          ? `\n${spaces}  <div class="card-header">\n${spaces}    <h3>${comp.props.title}</h3>\n${comp.props.subtitle ? `${spaces}    <p>${comp.props.subtitle}</p>\n` : ''}${spaces}  </div>`
          : '';
        const body = hasChildren
          ? '\n' + comp.children!.map((c) => renderComponent(c, indent + 2)).join('\n') + `\n${spaces}`
          : '';
        return `${spaces}<div ${idAttr} class="${classes} card">${header}${body}</div>`;
      }

      case 'container': {
        const body = hasChildren
          ? '\n' + comp.children!.map((c) => renderComponent(c, indent + 2)).join('\n') + `\n${spaces}`
          : '';
        return `${spaces}<div ${idAttr} class="${classes} container">${body}</div>`;
      }

      case 'grid': {
        const body = hasChildren
          ? '\n' + comp.children!.map((c) => renderComponent(c, indent + 2)).join('\n') + `\n${spaces}`
          : '';
        return `${spaces}<div ${idAttr} class="${classes} grid">${body}</div>`;
      }

      case 'heading': {
        const tag = comp.props.level || 'h2';
        return `${spaces}<${tag} ${idAttr} class="${classes}">${comp.props.text || 'Heading'}</${tag}>`;
      }

      case 'paragraph': {
        return `${spaces}<p ${idAttr} class="${classes}">${comp.props.text || ''}</p>`;
      }

      case 'badge': {
        return `${spaces}<span ${idAttr} class="${classes} badge">${comp.props.text || 'Badge'}</span>`;
      }

      case 'alert': {
        return `${spaces}<div ${idAttr} class="${classes} alert alert-${comp.props.variant || 'info'}">\n${spaces}  <strong>${comp.props.title || 'Notice'}</strong>\n${spaces}  <p>${comp.props.message || ''}</p>\n${spaces}</div>`;
      }

      case 'avatar': {
        return `${spaces}<img ${idAttr} src="${comp.props.src || ''}" alt="${comp.props.name || 'Avatar'}" class="${classes} avatar" />`;
      }

      case 'divider': {
        return `${spaces}<hr ${idAttr} class="${classes}" />`;
      }

      case 'progress': {
        return `${spaces}<div ${idAttr} class="${classes} progress-bar">\n${spaces}  <div class="progress-fill" style="width: ${comp.props.value || 50}%;"></div>\n${spaces}</div>`;
      }

      case 'appbar': {
        const nav = (comp.props.navItems || []).map((item: string) => `<a href="#">${item}</a>`).join(' ');
        return `${spaces}<header ${idAttr} class="${classes} app-bar">\n${spaces}  <h2>${comp.props.title || 'App'}</h2>\n${spaces}  <nav>${nav}</nav>\n${spaces}</header>`;
      }

      default: {
        if (hasChildren) {
          const body = comp.children!.map((c) => renderComponent(c, indent + 2)).join('\n');
          return `${spaces}<div ${idAttr} class="${classes}">\n${body}\n${spaces}</div>`;
        }
        return `${spaces}<div ${idAttr} class="${classes}">${comp.props.label || comp.props.title || comp.name}</div>`;
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Meo Export</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main class="flex-app-container">
${components.map((c) => renderComponent(c, 4)).join('\n\n')}
  </main>
  <script src="script.js"></script>
</body>
</html>`;
}

export function generateCSS(components: FlexComponent[]): string {
  const cssRules: string[] = [
    `/* Base Styles generated by Meo */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #0b0f19;
  color: #f8fafc;
  padding: 24px;
}

.flex-app-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-wrapper, .select-wrapper, .slider-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.input-wrapper label, .select-wrapper label, .slider-wrapper label {
  font-size: 13px;
  font-weight: 500;
  color: #cbd5e1;
}
`,
  ];

  function collectStyles(comp: FlexComponent) {
    const s = comp.styles;
    const rules: string[] = [];

    if (s.width) rules.push(`  width: ${s.width};`);
    if (s.height) rules.push(`  height: ${s.height};`);
    if (s.maxWidth) rules.push(`  max-width: ${s.maxWidth};`);
    if (s.minHeight) rules.push(`  min-height: ${s.minHeight};`);
    if (s.padding) rules.push(`  padding: ${s.padding};`);
    if (s.margin) rules.push(`  margin: ${s.margin};`);
    if (s.backgroundColor) rules.push(`  background-color: ${s.backgroundColor};`);
    if (s.textColor) rules.push(`  color: ${s.textColor};`);
    if (s.borderColor) rules.push(`  border-color: ${s.borderColor};`);
    if (s.borderWidth) rules.push(`  border-width: ${s.borderWidth};`);
    if (s.borderWidth && !s.borderStyle) rules.push(`  border-style: solid;`);
    if (s.borderRadius) rules.push(`  border-radius: ${s.borderRadius};`);
    if (s.fontSize) rules.push(`  font-size: ${s.fontSize};`);
    if (s.fontWeight) rules.push(`  font-weight: ${s.fontWeight};`);
    if (s.textAlign) rules.push(`  text-align: ${s.textAlign};`);
    if (s.boxShadow) rules.push(`  box-shadow: ${s.boxShadow};`);
    if (s.cursor) rules.push(`  cursor: ${s.cursor};`);

    // Flex / Grid
    if (s.display) rules.push(`  display: ${s.display};`);
    if (s.flexDirection) rules.push(`  flex-direction: ${s.flexDirection};`);
    if (s.justifyContent) rules.push(`  justify-content: ${s.justifyContent};`);
    if (s.alignItems) rules.push(`  align-items: ${s.alignItems};`);
    if (s.gap) rules.push(`  gap: ${s.gap};`);
    if (s.gridColumns) rules.push(`  grid-template-columns: ${s.gridColumns};`);

    if (rules.length > 0) {
      cssRules.push(`.flex-comp-${comp.id} {\n${rules.join('\n')}\n}`);
    }

    if (comp.children) {
      comp.children.forEach(collectStyles);
    }
  }

  components.forEach(collectStyles);
  return cssRules.join('\n\n');
}

export function generateJS(components: FlexComponent[], dataSources: DataSource[] = []): string {
  const functions: Map<string, string> = new Map();

  function collectEvents(comp: FlexComponent) {
    if (comp.events) {
      comp.events.forEach((ev) => {
        if (!functions.has(ev.functionName)) {
          const body = ev.customCode.trim() || `console.log('${ev.functionName} executed');`;
          functions.set(
            ev.functionName,
            `/**\n * ${ev.description || ev.event + ' handler'}\n */\nfunction ${ev.functionName}(event) {\n  ${body}\n}`
          );
        }
      });
    }
    if (comp.children) {
      comp.children.forEach(collectEvents);
    }
  }

  components.forEach(collectEvents);

  const defaultFunctions = [
    `// Auto-generated Meo Client Interaction Scripts`,
    `const DATA_SOURCES = ${JSON.stringify(
      dataSources.reduce((acc, d) => ({ ...acc, [d.id]: d.data || [] }), {}),
      null,
      2
    )};`,
    ``,
    `function filterTable(tableId, query) {`,
    `  const tbody = document.getElementById('tbody-' + tableId);`,
    `  if (!tbody) return;`,
    `  const rows = tbody.querySelectorAll('tr');`,
    `  rows.forEach(r => {`,
    `    const text = r.textContent.toLowerCase();`,
    `    r.style.display = text.includes(query.toLowerCase()) ? '' : 'none';`,
    `  });`,
    `}`,
    ``,
    `document.addEventListener('DOMContentLoaded', () => {`,
    `  console.log('Meo interactive application initialized with dynamic state.');`,
    `});`,
  ];

  const fnArray = Array.from(functions.values());
  return [...defaultFunctions, '', ...fnArray].join('\n\n');
}
