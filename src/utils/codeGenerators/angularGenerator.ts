import { FlexComponent } from '../../types';

export function generateAngularCode(components: FlexComponent[], componentName = 'FlexAppComponent'): string {
  const properties: Set<string> = new Set();
  const methods: Map<string, string> = new Map();

  function renderTemplate(comp: FlexComponent, indent = 4): string {
    const spaces = ' '.repeat(indent);
    const classes = `flex-comp-${comp.id}`;

    const eventProps: string[] = [];
    if (comp.events) {
      comp.events.forEach((ev) => {
        const ngEvent = ev.event === 'onClick' ? '(click)' : ev.event === 'onChange' ? '(change)' : `(${ev.event.toLowerCase().replace('on', '')})`;
        const handlerName = ev.functionName || `handle${comp.type}`;
        eventProps.push(`${ngEvent}="${handlerName}($event)"`);
        if (!methods.has(handlerName)) {
          methods.set(
            handlerName,
            `  ${handlerName}(event?: any): void {\n    ${ev.customCode.trim() || `console.log('${handlerName} called');`}\n  }`
          );
        }
      });
    }

    const eventString = eventProps.length > 0 ? ' ' + eventProps.join(' ') : '';
    const hasChildren = comp.children && comp.children.length > 0;

    switch (comp.type) {
      case 'button':
      case 'button-outlined':
      case 'button-fab':
        return `${spaces}<button class="${classes}"${eventString}>${comp.props.label || 'Button'}</button>`;

      case 'input': {
        const propName = `input_${comp.id.replace(/-/g, '_')}`;
        properties.add(`  ${propName}: string = '';`);
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label *ngIf="'${comp.props.label || ''}'">${comp.props.label}</label>\n${spaces}  <input [(ngModel)]="${propName}" type="${comp.props.inputType || 'text'}" placeholder="${comp.props.placeholder || ''}" class="${classes}"${eventString} />\n${spaces}</div>`;
      }

      case 'checkbox': {
        const propName = `checkbox_${comp.id.replace(/-/g, '_')}`;
        properties.add(`  ${propName}: boolean = ${Boolean(comp.props.checked)};`);
        return `${spaces}<label class="${classes}">\n${spaces}  <input type="checkbox" [(ngModel)]="${propName}"${eventString} />\n${spaces}  <span>${comp.props.label || ''}</span>\n${spaces}</label>`;
      }

      case 'switch': {
        const propName = `switch_${comp.id.replace(/-/g, '_')}`;
        properties.add(`  ${propName}: boolean = ${Boolean(comp.props.checked)};`);
        return `${spaces}<div class="${classes}">\n${spaces}  <span>${comp.props.label || 'Switch'}</span>\n${spaces}  <input type="checkbox" [(ngModel)]="${propName}"${eventString} />\n${spaces}</div>`;
      }

      case 'select': {
        const propName = `select_${comp.id.replace(/-/g, '_')}`;
        properties.add(`  ${propName}: string = '${(comp.props.options && comp.props.options[0]) || ''}';`);
        const opts = (comp.props.options || []).map((o: string) => `${spaces}    <option value="${o}">${o}</option>`).join('\n');
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label>${comp.props.label || 'Select'}</label>\n${spaces}  <select [(ngModel)]="${propName}" class="${classes}"${eventString}>\n${opts}\n${spaces}  </select>\n${spaces}</div>`;
      }

      case 'slider': {
        const propName = `slider_${comp.id.replace(/-/g, '_')}`;
        properties.add(`  ${propName}: number = ${comp.props.value || 50};`);
        return `${spaces}<div class="input-wrapper">\n${spaces}  <label>${comp.props.label || 'Slider'}: {{ ${propName} }}</label>\n${spaces}  <input type="range" min="${comp.props.min || 0}" max="${comp.props.max || 100}" [(ngModel)]="${propName}" class="${classes}" />\n${spaces}</div>`;
      }

      case 'card': {
        const children = hasChildren ? '\n' + comp.children!.map((c) => renderTemplate(c, indent + 2)).join('\n') + `\n${spaces}` : '';
        return `${spaces}<div class="${classes} card">\n${comp.props.title ? `${spaces}  <div class="card-header">\n${spaces}    <h3>${comp.props.title}</h3>\n${comp.props.subtitle ? `${spaces}    <p>${comp.props.subtitle}</p>\n` : ''}${spaces}  </div>\n` : ''}${children}</div>`;
      }

      case 'container':
      case 'grid': {
        const children = hasChildren ? '\n' + comp.children!.map((c) => renderTemplate(c, indent + 2)).join('\n') + `\n${spaces}` : '';
        return `${spaces}<div class="${classes}">${children}</div>`;
      }

      case 'heading': {
        const tag = comp.props.level || 'h2';
        return `${spaces}<${tag} class="${classes}">${comp.props.text || 'Heading'}</${tag}>`;
      }

      case 'paragraph': {
        return `${spaces}<p class="${classes}">${comp.props.text || ''}</p>`;
      }

      case 'badge': {
        return `${spaces}<span class="${classes}">${comp.props.text || 'Badge'}</span>`;
      }

      case 'alert': {
        return `${spaces}<div class="${classes} alert">\n${spaces}  <strong>${comp.props.title || 'Notice'}</strong>\n${spaces}  <p>${comp.props.message || ''}</p>\n${spaces}</div>`;
      }

      default: {
        if (hasChildren) {
          const children = comp.children!.map((c) => renderTemplate(c, indent + 2)).join('\n');
          return `${spaces}<div class="${classes}"${eventString}>\n${children}\n${spaces}</div>`;
        }
        return `${spaces}<div class="${classes}"${eventString}>${comp.props.label || comp.props.title || comp.name}</div>`;
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

  return `import { Component } from '@angular/core';
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
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }
${cssRules.join('\n\n')}
  \`]
})
export class ${componentName} {
${propertiesBlock}

${methodsBlock}
}
`;
}
