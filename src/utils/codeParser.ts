import { FlexComponent, ComponentStyle } from '../types';

/**
 * Normalizes CSS property names to camelCase for FlexComponent styles
 */
function normalizeStyleKey(key: string): keyof ComponentStyle | string {
  const map: Record<string, keyof ComponentStyle> = {
    color: 'textColor',
    textcolor: 'textColor',
    backgroundcolor: 'backgroundColor',
    'background-color': 'backgroundColor',
    bordercolor: 'borderColor',
    'border-color': 'borderColor',
    borderwidth: 'borderWidth',
    'border-width': 'borderWidth',
    borderradius: 'borderRadius',
    'border-radius': 'borderRadius',
    borderstyle: 'borderStyle',
    'border-style': 'borderStyle',
    fontsize: 'fontSize',
    'font-size': 'fontSize',
    fontweight: 'fontWeight',
    'font-weight': 'fontWeight',
    textalign: 'textAlign',
    'text-align': 'textAlign',
    maxwidth: 'maxWidth',
    'max-width': 'maxWidth',
    minheight: 'minHeight',
    'min-height': 'minHeight',
    flexdirection: 'flexDirection',
    'flex-direction': 'flexDirection',
    justifycontent: 'justifyContent',
    'justify-content': 'justifyContent',
    alignitems: 'alignItems',
    'align-items': 'alignItems',
    boxshadow: 'boxShadow',
    'box-shadow': 'boxShadow',
    gridcolumns: 'gridColumns',
    'grid-columns': 'gridColumns',
    'grid-template-columns': 'gridColumns',
  };

  const cleanKey = key.trim().toLowerCase();
  if (map[cleanKey]) return map[cleanKey];

  return key.trim();
}

/**
 * Parses inline style string or JSON style object string into ComponentStyle
 */
export function parseStyles(styleAttr: string): ComponentStyle {
  const styles: ComponentStyle = {};
  if (!styleAttr || !styleAttr.trim()) return styles;

  const trimmed = styleAttr.trim();

  // Case 1: JSON style (e.g., from JSX: {"width":"100%","backgroundColor":"#1e293b"})
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const jsonStr = trimmed
        .replace(/(['"])?([a-zA-Z0-9_-]+)(['"])?\s*:/g, '"$2":')
        .replace(/'/g, '"');
      const obj = JSON.parse(jsonStr);
      for (const [k, v] of Object.entries(obj)) {
        const normKey = normalizeStyleKey(k);
        (styles as any)[normKey] = String(v);
      }
      return styles;
    } catch {
      // Fallback to css parsing if JSON parse fails
    }
  }

  // Case 2: Standard CSS declarations (e.g. width: 100%; background-color: #1e293b;)
  const declarations = trimmed.split(';').filter(Boolean);
  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx === -1) continue;
    const key = decl.slice(0, colonIdx).trim();
    const val = decl.slice(colonIdx + 1).trim();
    if (key && val) {
      const normKey = normalizeStyleKey(key);
      (styles as any)[normKey] = val;
    }
  }

  return styles;
}

/**
 * Flattens an existing component tree into a fast ID-lookup map
 */
function buildComponentMap(components: FlexComponent[]): Map<string, FlexComponent> {
  const map = new Map<string, FlexComponent>();

  function traverse(list: FlexComponent[]) {
    for (const comp of list) {
      map.set(comp.id, comp);
      if (comp.children && comp.children.length > 0) {
        traverse(comp.children);
      }
    }
  }

  traverse(components);
  return map;
}

/**
 * Pre-processes JSX or framework code into clean HTML parseable by DOMParser
 */
function prepareHtmlSnippet(code: string, language: string): string {
  let snippet = code;

  // React: Extract content inside return (...)
  if (language === 'typescript' || language === 'react' || code.includes('export default function')) {
    const returnMatch = snippet.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\}/);
    if (returnMatch) {
      snippet = returnMatch[1];
    }
  }

  // Vue: Extract content inside <template>...</template>
  if (language === 'vue' || snippet.includes('<template>')) {
    const tmplMatch = snippet.match(/<template>([\s\S]*?)<\/template>/);
    if (tmplMatch) {
      snippet = tmplMatch[1];
    }
  }

  // Angular: Extract template if inline
  if (language === 'angular' || snippet.includes('template:')) {
    const angularMatch = snippet.match(/template:\s*`([\s\S]*?)`/);
    if (angularMatch) {
      snippet = angularMatch[1];
    }
  }

  // Remove top-level min-h-screen / app-container outer wrapper if present
  snippet = snippet.replace(
    /^<div[^>]*className=["'][^"']*min-h-screen[^"']*["'][^>]*>([\s\S]*)<\/div>\s*$/i,
    '$1'
  );
  snippet = snippet.replace(
    /^<div[^>]*class=["'][^"']*min-h-screen[^"']*["'][^>]*>([\s\S]*)<\/div>\s*$/i,
    '$1'
  );

  // Strip JSX string literal braces: {"Some Text"} -> Some Text
  snippet = snippet.replace(/\{["'](.*?)["']\}/g, '$1');

  // Convert JSX style={{...}} to data-flex-style="..."
  snippet = snippet.replace(/style=\{+([\s\S]*?)\}+/g, (match, p1) => {
    try {
      let raw = p1.trim();
      if (!raw.startsWith('{')) raw = '{' + raw;
      if (!raw.endsWith('}')) raw = raw + '}';
      const jsonStr = raw
        .replace(/(['"])?([a-zA-Z0-9_-]+)(['"])?\s*:/g, '"$2":')
        .replace(/'/g, '"');
      const parsed = JSON.parse(jsonStr);
      return `data-flex-style="${encodeURIComponent(JSON.stringify(parsed))}"`;
    } catch {
      return `data-flex-style="${encodeURIComponent(p1.trim())}"`;
    }
  });

  // Extract navigate destination from onClick={() => navigate('/route')}
  snippet = snippet.replace(
    /onClick=\{\(\)\s*=>\s*navigate\(['"]([^'"]+)['"]\)\}/g,
    'data-target-route="$1"'
  );

  // Convert className to class
  snippet = snippet.replace(/\bclassName=/g, 'class=');

  return snippet.trim();
}

/**
 * Converts a DOM Element into a FlexComponent, reconciling with existing component if available
 */
function domElementToFlexComponent(
  el: Element,
  existingMap: Map<string, FlexComponent>
): FlexComponent | null {
  const tagName = el.tagName.toUpperCase();

  // Ignore script, style, comments, head
  if (['SCRIPT', 'STYLE', 'HEAD', 'META', 'LINK'].includes(tagName)) {
    return null;
  }

  const idAttr = el.getAttribute('id') || el.getAttribute('data-id') || el.getAttribute('data-component-id');
  const existingComp = idAttr ? existingMap.get(idAttr) : undefined;

  // Extract style
  let elementStyles: ComponentStyle = {};
  const flexStyleData = el.getAttribute('data-flex-style');
  if (flexStyleData) {
    try {
      const decoded = decodeURIComponent(flexStyleData);
      elementStyles = parseStyles(decoded);
    } catch {
      elementStyles = parseStyles(flexStyleData);
    }
  } else if (el.getAttribute('style')) {
    elementStyles = parseStyles(el.getAttribute('style') || '');
  }

  // Extract target route if any
  const targetRoute = el.getAttribute('data-target-route');

  // If existing component found, update it while preserving ID, events, bindings
  if (existingComp) {
    const updated: FlexComponent = JSON.parse(JSON.stringify(existingComp));

    // Merge styles
    updated.styles = { ...updated.styles, ...elementStyles };

    // Update props based on component type
    switch (updated.type) {
      case 'button':
      case 'button-outlined':
      case 'button-fab': {
        const text = el.textContent?.trim();
        if (text) updated.props.label = text;
        if (targetRoute) updated.props.targetRoute = targetRoute;
        break;
      }
      case 'heading': {
        const text = el.textContent?.trim();
        if (text) updated.props.text = text;
        if (/^H[1-6]$/.test(tagName)) {
          updated.props.level = tagName.toLowerCase();
        }
        break;
      }
      case 'paragraph': {
        const text = el.textContent?.trim();
        if (text) updated.props.text = text;
        break;
      }
      case 'badge': {
        const text = el.textContent?.trim();
        if (text) updated.props.text = text;
        break;
      }
      case 'input': {
        const placeholder = el.getAttribute('placeholder');
        const inputType = el.getAttribute('type');
        if (placeholder !== null) updated.props.placeholder = placeholder;
        if (inputType !== null) updated.props.inputType = inputType;
        break;
      }
      case 'textarea': {
        const placeholder = el.getAttribute('placeholder');
        const rows = el.getAttribute('rows');
        if (placeholder !== null) updated.props.placeholder = placeholder;
        if (rows !== null) updated.props.rows = Number(rows) || 3;
        break;
      }
      case 'avatar': {
        const src = el.getAttribute('src');
        const alt = el.getAttribute('alt');
        if (src) updated.props.src = src;
        if (alt) updated.props.name = alt;
        break;
      }
      case 'card': {
        const h3 = el.querySelector('h1, h2, h3, h4');
        if (h3 && h3.textContent) updated.props.title = h3.textContent.trim();
        const p = el.querySelector('p');
        if (p && p.textContent) updated.props.subtitle = p.textContent.trim();
        break;
      }
      case 'data-table': {
        const titleSpan = el.querySelector('.table-header span, h3, .font-bold');
        if (titleSpan && titleSpan.textContent) {
          updated.props.title = titleSpan.textContent.trim();
        }
        break;
      }
    }

    // Recursively parse children if element has child elements
    const childElements = Array.from(el.children).filter(
      (c) => !['H3', 'P', 'SPAN', 'DIV'].includes(c.tagName) || c.getAttribute('id') || c.children.length > 0
    );

    if (updated.isContainer && childElements.length > 0) {
      const parsedChildren: FlexComponent[] = [];
      for (const childEl of childElements) {
        // Skip card title/subtitle header container
        if (childEl.classList.contains('border-b') && childEl.querySelector('h3, p')) {
          continue;
        }
        const parsed = domElementToFlexComponent(childEl, existingMap);
        if (parsed) parsedChildren.push(parsed);
      }
      if (parsedChildren.length > 0) {
        updated.children = parsedChildren;
      }
    }

    return updated;
  }

  // Newly typed element in code (no matching ID)
  const newId = `comp-custom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  // Determine component type and defaults
  let compType: FlexComponent['type'] = 'container';
  let category: FlexComponent['category'] = 'layout';
  let isContainer = false;
  const props: Record<string, any> = {};

  if (tagName === 'BUTTON') {
    compType = 'button';
    category = 'buttons';
    props.label = el.textContent?.trim() || 'Button';
    props.variant = 'contained';
    if (targetRoute) props.targetRoute = targetRoute;
  } else if (/^H[1-6]$/.test(tagName)) {
    compType = 'heading';
    category = 'typography';
    props.text = el.textContent?.trim() || 'Heading';
    props.level = tagName.toLowerCase();
  } else if (tagName === 'P') {
    compType = 'paragraph';
    category = 'typography';
    props.text = el.textContent?.trim() || 'Paragraph text';
  } else if (tagName === 'INPUT') {
    compType = 'input';
    category = 'forms';
    props.placeholder = el.getAttribute('placeholder') || 'Enter text...';
    props.inputType = el.getAttribute('type') || 'text';
  } else if (tagName === 'TEXTAREA') {
    compType = 'textarea';
    category = 'forms';
    props.placeholder = el.getAttribute('placeholder') || 'Type here...';
    props.rows = Number(el.getAttribute('rows')) || 3;
  } else if (tagName === 'IMG') {
    compType = 'avatar';
    category = 'data-display';
    props.src = el.getAttribute('src') || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80';
    props.name = el.getAttribute('alt') || 'User Avatar';
  } else if (tagName === 'SPAN' || el.classList.contains('badge')) {
    compType = 'badge';
    category = 'data-display';
    props.text = el.textContent?.trim() || 'Badge';
  } else if (tagName === 'HR') {
    compType = 'divider';
    category = 'layout';
  } else if (tagName === 'TABLE' || el.querySelector('table')) {
    compType = 'data-table';
    category = 'data-display';
    props.title = 'Data Directory';
    props.columns = [
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status' },
    ];
  } else {
    // DIV or container
    isContainer = true;
    const hasCardClass =
      el.classList.contains('shadow-lg') ||
      el.classList.contains('card') ||
      el.classList.contains('bg-slate-900');

    compType = hasCardClass ? 'card' : 'container';
    category = 'layout';
  }

  // Parse children if container
  const children: FlexComponent[] = [];
  if (el.children.length > 0) {
    for (const child of Array.from(el.children)) {
      const parsedChild = domElementToFlexComponent(child, existingMap);
      if (parsedChild) children.push(parsedChild);
    }
  }

  return {
    id: newId,
    type: compType,
    name: props.label || props.text || props.title || `${compType.charAt(0).toUpperCase() + compType.slice(1)}`,
    category,
    isContainer: isContainer || children.length > 0,
    props,
    styles: elementStyles,
    events: [],
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * Main parser entry point: parses edited code into a clean FlexComponent array
 */
export function parseCodeToComponents(
  code: string,
  currentComponents: FlexComponent[],
  language: string = 'react'
): { success: boolean; components: FlexComponent[]; error?: string } {
  if (!code || !code.trim()) {
    return { success: false, components: [], error: 'Code editor is empty' };
  }

  try {
    const cleanSnippet = prepareHtmlSnippet(code, language);
    if (!cleanSnippet) {
      return { success: false, components: [], error: 'No renderable markup found' };
    }

    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
      return { success: false, components: currentComponents, error: 'DOMParser is not available' };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanSnippet, 'text/html');

    // Check for parse errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return {
        success: false,
        components: currentComponents,
        error: parserError.textContent || 'HTML/JSX parsing error',
      };
    }

    const bodyChildren = Array.from(doc.body.children);
    if (bodyChildren.length === 0) {
      return {
        success: false,
        components: currentComponents,
        error: 'No root elements found to render on canvas',
      };
    }

    const existingMap = buildComponentMap(currentComponents);
    const parsedComponents: FlexComponent[] = [];

    for (const el of bodyChildren) {
      const comp = domElementToFlexComponent(el, existingMap);
      if (comp) {
        parsedComponents.push(comp);
      }
    }

    if (parsedComponents.length === 0) {
      return {
        success: false,
        components: currentComponents,
        error: 'Could not extract valid components from markup',
      };
    }

    return {
      success: true,
      components: parsedComponents,
    };
  } catch (err: any) {
    return {
      success: false,
      components: currentComponents,
      error: err.message || 'Unknown error parsing code',
    };
  }
}
