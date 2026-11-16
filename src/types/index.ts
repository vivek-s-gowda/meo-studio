export type ComponentCategory =
  | 'layout'
  | 'forms'
  | 'buttons'
  | 'typography'
  | 'data-display'
  | 'feedback'
  | 'navigation'
  | 'custom';

export type TargetLanguage = 'react' | 'angular' | 'vue' | 'html';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile' | 'responsive';

export interface ComponentStyle {
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  borderStyle?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  display?: 'block' | 'flex' | 'grid' | 'inline-block' | 'inline-flex';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'baseline' | 'stretch';
  flexWrap?: 'nowrap' | 'wrap';
  gap?: string;
  gridColumns?: string;
  boxShadow?: string;
  elevation?: number;
  opacity?: string;
  cursor?: string;
  customCss?: string;
}

export interface ComponentEvent {
  event: 'onClick' | 'onChange' | 'onSubmit' | 'onMouseEnter' | 'onFocus' | 'onBlur';
  functionName: string;
  customCode: string;
  description?: string;
}

export interface FlexComponent {
  id: string;
  type: string;
  name: string;
  category: ComponentCategory;
  isContainer?: boolean;
  content?: string;
  props: Record<string, any>;
  styles: ComponentStyle;
  events: ComponentEvent[];
  children?: FlexComponent[];
  parentId?: string | null;
}

export interface ComponentDefinition {
  type: string;
  name: string;
  category: ComponentCategory;
  icon: string;
  description: string;
  isContainer?: boolean;
  isCustom?: boolean;
  customHtml?: string;
  defaultProps: Record<string, any>;
  defaultStyles: ComponentStyle;
  defaultEvents?: ComponentEvent[];
  defaultChildren?: FlexComponent[];
}

export interface GlobalFunction {
  id: string;
  name: string;
  params: string;
  code: string;
  description: string;
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  componentId: string | null;
}

export interface QuickPopupState {
  isOpen: boolean;
  x: number;
  y: number;
  componentId: string | null;
  activeTab?: 'styles' | 'props' | 'events';
}
