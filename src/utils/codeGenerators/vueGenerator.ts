import { FlexComponent, DataSource } from '../../types';

function toVueToken(str: string | undefined, defaultVal = ''): string {
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

export function generateVueCode(
  components: FlexComponent[],
  componentName = 'FlexApp',
  dataSources: DataSource[] = []
): string {
  const refs: Set<string> = new Set();
  const onMountedHooks: Set<string> = new Set();
  const methods: Map<string, string> = new Map();
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
      const refKey = `${ds.id.replace(/[^a-zA-Z0-9]/g, '_')}_data`;
      refs.add(`const ${refKey} = ref<any[]>(${JSON.stringify(ds.data || [], null, 2)});`);

      if (ds.type === 'rest' && ds.endpoint) {
        onMountedHooks.add(`  // Fetch ${ds.name}
  try {
    const res = await fetch('${ds.endpoint}');
    const json = await res.json();
    ${refKey}.value = Array.isArray(json) ? json : json.data || json.items || [];
  } catch (err) {
    console.error('Failed to load ${ds.name}:', err);
  }`);
      }
    }
  });

  function renderTemplate(comp: FlexComponent, indent = 4): string {
    const spaces = ' '.repeat(indent);
    const classes = `flex-comp-${comp.id}`;

    const eventProps: string[] = [];
    if (comp.events) {
      comp.events.forEach((ev) => {
        const vueEvent =
          ev.event === 'onClick'
            ? '@click'
            : ev.event === 'onChange'
            ? '@change'
            : `@${ev.event.toLowerCase().replace('on', '')}`;
        const handlerName = ev.functionName || `handle_${comp.type.replace(/-/g, '_')}`;
        eventProps.push(`${vueEvent}="${handlerName}"`);
        if (!methods.has(handlerName)) {
          methods.set(
            handlerName,
            `const ${handlerName} = (event?: Event) => {\n  ${
              ev.customCode.trim() || `console.log('${handlerName} executed');`
            }\n};`
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
        const searchRef = `search_${comp.id.replace(/-/g, '_')}`;
        refs.add(`const ${searchRef} = ref('');`);

        const cols = (comp.props.columns || [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }])
          .map((c: any) => `${spaces}        <th>${c.label || c.key}</th>`)
          .join('\n');

        const colCells = (comp.props.columns || [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }])
          .map((c: any) => `${spaces}          <td>{{ row.${c.key} }}</td>`)
          .join('\n');

        return `${spaces}<!-- Data Table (${comp.props.title || 'Data Table'}) -->
${spaces}<div class="${classes} table-card">
${spaces}  <div class="table-header">
${spaces}    <h3>${comp.props.title || 'Data Table'}</h3>
${spaces}    <input v-model="${searchRef}" placeholder="Search records..." class="table-search" />
${spaces}  </div>
${spaces}  <table class="data-table">
${spaces}    <thead>
${spaces}      <tr>
${cols}
${spaces}      </tr>
${spaces}    </thead>
${spaces}    <tbody>
${spaces}      <tr v-for="(row, idx) in ${tableDsKey}.filter(r => !${searchRef} || Object.values(r).some(v => String(v).toLowerCase().includes(${searchRef}.toLowerCase())))" :key="row.id || idx">
${colCells}
${spaces}      </tr>
${spaces}    </tbody>
${spaces}  </table>
${spaces}</div>`;
      }

      case 'button':
      case 'button-outlined':
      case 'button-fab':
        return `${spaces}<button class="${classes}"${eventString}>${toVueToken(comp.props.label, 'Button')}</button>`;

      case 'input': {
        const refName = `input_${comp.id.replace(/-/g, '_')}`;
        refs.add(`const ${refName} = ref('');`);
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label v-if="'${comp.props.label || ''}'">${toVueToken(comp.props.label)}</label>\n${spaces}  <input v-model="${refName}" type="${comp.props.inputType || 'text'}" placeholder="${toVueToken(comp.props.placeholder)}" class="${classes}"${eventString} />\n${spaces}</div>`;
      }

      case 'textarea': {
        const refName = `textarea_${comp.id.replace(/-/g, '_')}`;
        refs.add(`const ${refName} = ref('');`);
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label v-if="'${comp.props.label || ''}'">${toVueToken(comp.props.label)}</label>\n${spaces}  <textarea v-model="${refName}" rows="${comp.props.rows || 3}" placeholder="${toVueToken(comp.props.placeholder)}" class="${classes}"${eventString}></textarea>\n${spaces}</div>`;
      }

      case 'checkbox': {
        const refName = `checkbox_${comp.id.replace(/-/g, '_')}`;
        refs.add(`const ${refName} = ref(${Boolean(comp.props.checked)});`);
        return `${spaces}<label class="${classes}">\n${spaces}  <input type="checkbox" v-model="${refName}"${eventString} />\n${spaces}  <span>${toVueToken(comp.props.label)}</span>\n${spaces}</label>`;
      }

      case 'switch': {
        const refName = `switch_${comp.id.replace(/-/g, '_')}`;
        refs.add(`const ${refName} = ref(${Boolean(comp.props.checked)});`);
        return `${spaces}<div class="${classes}">\n${spaces}  <span>${toVueToken(comp.props.label, 'Switch')}</span>\n${spaces}  <input type="checkbox" v-model="${refName}"${eventString} />\n${spaces}</div>`;
      }

      case 'select': {
        const refName = `select_${comp.id.replace(/-/g, '_')}`;
        refs.add(`const ${refName} = ref('${(comp.props.options && comp.props.options[0]) || ''}');`);
        const opts = (comp.props.options || []).map((o: string) => `${spaces}    <option value="${o}">${o}</option>`).join('\n');
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label>${toVueToken(comp.props.label, 'Select')}</label>\n${spaces}  <select v-model="${refName}" class="${classes}"${eventString}>\n${opts}\n${spaces}  </select>\n${spaces}</div>`;
      }

      case 'slider': {
        const refName = `slider_${comp.id.replace(/-/g, '_')}`;
        refs.add(`const ${refName} = ref(${comp.props.value || 50});`);
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label>${toVueToken(comp.props.label, 'Slider')}: {{ ${refName} }}</label>\n${spaces}  <input type="range" min="${comp.props.min || 0}" max="${comp.props.max || 100}" v-model="${refName}" class="${classes}" />\n${spaces}</div>`;
      }

      case 'card': {
        if (isRepeatMode) {
          const children = hasChildren ? '\n' + comp.children!.map((c) => renderTemplate(c, indent + 2)).join('\n') + `\n${spaces}` : '';
          return `${spaces}<div v-for="(item, idx) in ${dsKey}" :key="item.id || idx" class="${classes} card">\n${comp.props.title ? `${spaces}  <div class="card-header">\n${spaces}    <h3>${toVueToken(comp.props.title)}</h3>\n${comp.props.subtitle ? `${spaces}    <p>${toVueToken(comp.props.subtitle)}</p>\n` : ''}${spaces}  </div>\n` : ''}${children}</div>`;
        }

        const children = hasChildren ? '\n' + comp.children!.map((c) => renderTemplate(c, indent + 2)).join('\n') + `\n${spaces}` : '';
        return `${spaces}<div class="${classes} card">\n${comp.props.title ? `${spaces}  <div class="card-header">\n${spaces}    <h3>${toVueToken(comp.props.title)}</h3>\n${comp.props.subtitle ? `${spaces}    <p>${toVueToken(comp.props.subtitle)}</p>\n` : ''}${spaces}  </div>\n` : ''}${children}</div>`;
      }

      case 'container':
      case 'grid': {
        if (isRepeatMode) {
          const children = hasChildren ? '\n' + comp.children!.map((c) => renderTemplate(c, indent + 4)).join('\n') + `\n${spaces}  ` : '';
          return `${spaces}<div class="${classes}">\n${spaces}  <div v-for="(item, idx) in ${dsKey}" :key="item.id || idx" class="repeat-item">${children}</div>\n${spaces}</div>`;
        }

        const children = hasChildren ? '\n' + comp.children!.map((c) => renderTemplate(c, indent + 2)).join('\n') + `\n${spaces}` : '';
        return `${spaces}<div class="${classes}">${children}</div>`;
      }

      case 'heading': {
        const tag = comp.props.level || 'h2';
        return `${spaces}<${tag} class="${classes}">${toVueToken(comp.props.text, 'Heading')}</${tag}>`;
      }

      case 'paragraph': {
        return `${spaces}<p class="${classes}">${toVueToken(comp.props.text, '')}</p>`;
      }

      case 'badge': {
        return `${spaces}<span class="${classes}">${toVueToken(comp.props.text, 'Badge')}</span>`;
      }

      case 'alert': {
        return `${spaces}<div class="${classes} alert">\n${spaces}  <strong>${toVueToken(comp.props.title, 'Notice')}</strong>\n${spaces}  <p>${toVueToken(comp.props.message, '')}</p>\n${spaces}</div>`;
      }

      case 'avatar': {
        return `${spaces}<img :src="'${comp.props.src || ''}'.startsWith('{{') ? item?.${(comp.props.src || '').replace(/[^a-zA-Z0-9]/g, '')} : '${comp.props.src || ''}'" alt="${toVueToken(comp.props.name, 'Avatar')}" class="${classes}" />`;
      }

      case 'divider': {
        return `${spaces}<hr class="${classes}" />`;
      }

      default: {
        if (hasChildren) {
          const children = comp.children!.map((c) => renderTemplate(c, indent + 2)).join('\n');
          return `${spaces}<div class="${classes}"${eventString}>\n${children}\n${spaces}</div>`;
        }
        return `${spaces}<div class="${classes}"${eventString}>${toVueToken(comp.props.label || comp.props.title || comp.name)}</div>`;
      }
    }
  }

  // Generate scoped CSS
  const cssRules: string[] = [];
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

  const renderedTemplate = components.map((c) => renderTemplate(c, 4)).join('\n\n');
  const refsBlock = Array.from(refs).join('\n');
  const methodsBlock = Array.from(methods.values()).join('\n\n');
  const hasMounted = onMountedHooks.size > 0;
  const mountedBlock = hasMounted
    ? `onMounted(async () => {\n${Array.from(onMountedHooks).join('\n\n')}\n});`
    : '';
  const vueImports = hasMounted ? 'import { ref, onMounted } from ' : 'import { ref } from ';

  return `<script setup lang="ts">
${vueImports}'vue';

${refsBlock}

${mountedBlock}

${methodsBlock}
</script>

<template>
  <div class="flex-app-wrapper">
${renderedTemplate}
  </div>
</template>

<style scoped>
.flex-app-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: system-ui, -apple-system, sans-serif;
  color: #f8fafc;
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
</style>
`;
}
