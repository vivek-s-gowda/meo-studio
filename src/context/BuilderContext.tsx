import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  FlexComponent,
  ComponentDefinition,
  TargetLanguage,
  ViewportMode,
  ContextMenuState,
  QuickPopupState,
  ComponentStyle,
  ComponentEvent,
} from '../types';
import { COMPONENT_CATALOG } from '../constants/componentCatalog';
import { PRESET_TEMPLATES } from '../constants/templates';

interface BuilderContextType {
  components: FlexComponent[];
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  targetLanguage: TargetLanguage;
  viewportMode: ViewportMode;
  isPreviewMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  contextMenu: ContextMenuState;
  quickPopup: QuickPopupState;

  // Actions
  setSelectedComponentId: (id: string | null) => void;
  setHoveredComponentId: (id: string | null) => void;
  setTargetLanguage: (lang: TargetLanguage) => void;
  setViewportMode: (mode: ViewportMode) => void;
  setIsPreviewMode: (preview: boolean) => void;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>;
  setQuickPopup: React.Dispatch<React.SetStateAction<QuickPopupState>>;

  addComponent: (def: ComponentDefinition, targetParentId?: string | null, targetIndex?: number) => string;
  addRawComponent: (component: FlexComponent, targetParentId?: string | null) => void;
  updateComponentStyles: (id: string, styles: Partial<ComponentStyle>) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  updateComponentEvents: (id: string, events: ComponentEvent[]) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  moveComponent: (id: string, direction: 'up' | 'down') => void;
  wrapInContainer: (id: string) => void;
  clearCanvas: () => void;
  loadTemplate: (templateId: string) => void;
  undo: () => void;
  redo: () => void;

  findComponentById: (id: string) => FlexComponent | null;
  selectedComponent: FlexComponent | null;
}

const BuilderContext = createContext<BuilderContextType | null>(null);

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with the Login Card template so the user immediately sees a live, beautiful UI
  const [components, setComponents] = useState<FlexComponent[]>(() => {
    return JSON.parse(JSON.stringify(PRESET_TEMPLATES[0].components));
  });

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>('react');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // History for Undo / Redo
  const [historyPast, setHistoryPast] = useState<FlexComponent[][]>([]);
  const [historyFuture, setHistoryFuture] = useState<FlexComponent[][]>([]);

  // Popups & Context Menus
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    componentId: null,
  });

  const [quickPopup, setQuickPopup] = useState<QuickPopupState>({
    isOpen: false,
    x: 0,
    y: 0,
    componentId: null,
    activeTab: 'styles',
  });

  const recordHistory = useCallback((current: FlexComponent[]) => {
    setHistoryPast((prev) => [...prev.slice(-25), JSON.parse(JSON.stringify(current))]);
    setHistoryFuture([]);
  }, []);

  // Helper recursive search
  const findInTree = useCallback((nodes: FlexComponent[], id: string): FlexComponent | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children && node.children.length > 0) {
        const found = findInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const findComponentById = useCallback(
    (id: string): FlexComponent | null => {
      return findInTree(components, id);
    },
    [components, findInTree]
  );

  const selectedComponent = useMemo(() => {
    if (!selectedComponentId) return null;
    return findComponentById(selectedComponentId);
  }, [selectedComponentId, findComponentById]);

  // Add Component from Catalog
  const addComponent = useCallback(
    (def: ComponentDefinition, targetParentId?: string | null, targetIndex?: number): string => {
      recordHistory(components);
      const newId = `comp-${def.type}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
      const newComp: FlexComponent = {
        id: newId,
        type: def.type,
        name: def.name,
        category: def.category,
        isContainer: def.isContainer,
        props: JSON.parse(JSON.stringify(def.defaultProps)),
        styles: JSON.parse(JSON.stringify(def.defaultStyles)),
        events: JSON.parse(JSON.stringify(def.defaultEvents || [])),
        children: def.isContainer ? [] : undefined,
        parentId: targetParentId || null,
      };

      setComponents((prev) => {
        if (!targetParentId) {
          if (typeof targetIndex === 'number') {
            const next = [...prev];
            next.splice(targetIndex, 0, newComp);
            return next;
          }
          return [...prev, newComp];
        }

        // Add to nested container
        const insertRecursive = (list: FlexComponent[]): FlexComponent[] => {
          return list.map((item) => {
            if (item.id === targetParentId) {
              const children = item.children ? [...item.children] : [];
              if (typeof targetIndex === 'number') {
                children.splice(targetIndex, 0, newComp);
              } else {
                children.push(newComp);
              }
              return { ...item, children };
            }
            if (item.children && item.children.length > 0) {
              return { ...item, children: insertRecursive(item.children) };
            }
            return item;
          });
        };

        return insertRecursive(prev);
      });

      setSelectedComponentId(newId);
      return newId;
    },
    [components, recordHistory]
  );

  const addRawComponent = useCallback(
    (component: FlexComponent, targetParentId?: string | null) => {
      recordHistory(components);
      setComponents((prev) => {
        if (!targetParentId) {
          return [...prev, component];
        }
        const insertRecursive = (list: FlexComponent[]): FlexComponent[] => {
          return list.map((item) => {
            if (item.id === targetParentId) {
              return {
                ...item,
                children: [...(item.children || []), component],
              };
            }
            if (item.children) {
              return { ...item, children: insertRecursive(item.children) };
            }
            return item;
          });
        };
        return insertRecursive(prev);
      });
      setSelectedComponentId(component.id);
    },
    [components, recordHistory]
  );

  // Update styles
  const updateComponentStyles = useCallback(
    (id: string, styles: Partial<ComponentStyle>) => {
      recordHistory(components);
      const updateRecursive = (list: FlexComponent[]): FlexComponent[] => {
        return list.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              styles: { ...item.styles, ...styles },
            };
          }
          if (item.children) {
            return { ...item, children: updateRecursive(item.children) };
          }
          return item;
        });
      };
      setComponents((prev) => updateRecursive(prev));
    },
    [components, recordHistory]
  );

  // Update props
  const updateComponentProps = useCallback(
    (id: string, props: Record<string, any>) => {
      recordHistory(components);
      const updateRecursive = (list: FlexComponent[]): FlexComponent[] => {
        return list.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              props: { ...item.props, ...props },
            };
          }
          if (item.children) {
            return { ...item, children: updateRecursive(item.children) };
          }
          return item;
        });
      };
      setComponents((prev) => updateRecursive(prev));
    },
    [components, recordHistory]
  );

  // Update events
  const updateComponentEvents = useCallback(
    (id: string, events: ComponentEvent[]) => {
      recordHistory(components);
      const updateRecursive = (list: FlexComponent[]): FlexComponent[] => {
        return list.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              events,
            };
          }
          if (item.children) {
            return { ...item, children: updateRecursive(item.children) };
          }
          return item;
        });
      };
      setComponents((prev) => updateRecursive(prev));
    },
    [components, recordHistory]
  );

  // Remove Component
  const removeComponent = useCallback(
    (id: string) => {
      recordHistory(components);
      const removeRecursive = (list: FlexComponent[]): FlexComponent[] => {
        return list
          .filter((item) => item.id !== id)
          .map((item) => ({
            ...item,
            children: item.children ? removeRecursive(item.children) : undefined,
          }));
      };
      setComponents((prev) => removeRecursive(prev));
      if (selectedComponentId === id) {
        setSelectedComponentId(null);
      }
    },
    [components, recordHistory, selectedComponentId]
  );

  // Duplicate Component
  const duplicateComponent = useCallback(
    (id: string) => {
      const source = findComponentById(id);
      if (!source) return;
      recordHistory(components);

      function cloneDeep(node: FlexComponent): FlexComponent {
        const copyId = `comp-${node.type}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
        return {
          ...node,
          id: copyId,
          name: `${node.name} (Copy)`,
          children: node.children ? node.children.map(cloneDeep) : undefined,
        };
      }

      const duplicate = cloneDeep(source);

      const insertNextTo = (list: FlexComponent[]): FlexComponent[] => {
        const index = list.findIndex((c) => c.id === id);
        if (index !== -1) {
          const next = [...list];
          next.splice(index + 1, 0, duplicate);
          return next;
        }
        return list.map((item) => ({
          ...item,
          children: item.children ? insertNextTo(item.children) : undefined,
        }));
      };

      setComponents((prev) => insertNextTo(prev));
      setSelectedComponentId(duplicate.id);
    },
    [components, findComponentById, recordHistory]
  );

  // Move Up / Down
  const moveComponent = useCallback(
    (id: string, direction: 'up' | 'down') => {
      recordHistory(components);
      const moveInList = (list: FlexComponent[]): FlexComponent[] => {
        const index = list.findIndex((c) => c.id === id);
        if (index !== -1) {
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= list.length) return list;
          const updated = [...list];
          const [removed] = updated.splice(index, 1);
          updated.splice(targetIndex, 0, removed);
          return updated;
        }
        return list.map((item) => ({
          ...item,
          children: item.children ? moveInList(item.children) : undefined,
        }));
      };
      setComponents((prev) => moveInList(prev));
    },
    [components, recordHistory]
  );

  // Wrap in Container
  const wrapInContainer = useCallback(
    (id: string) => {
      const target = findComponentById(id);
      if (!target) return;
      recordHistory(components);

      const containerDef = COMPONENT_CATALOG.find((c) => c.type === 'container')!;
      const containerId = `comp-container-${Date.now().toString(36)}`;
      const newContainer: FlexComponent = {
        id: containerId,
        type: 'container',
        name: 'Flex Container',
        category: 'layout',
        isContainer: true,
        props: {},
        styles: JSON.parse(JSON.stringify(containerDef.defaultStyles)),
        events: [],
        children: [{ ...target, parentId: containerId }],
      };

      const replaceInList = (list: FlexComponent[]): FlexComponent[] => {
        const index = list.findIndex((c) => c.id === id);
        if (index !== -1) {
          const next = [...list];
          next[index] = newContainer;
          return next;
        }
        return list.map((item) => ({
          ...item,
          children: item.children ? replaceInList(item.children) : undefined,
        }));
      };

      setComponents((prev) => replaceInList(prev));
      setSelectedComponentId(containerId);
    },
    [components, findComponentById, recordHistory]
  );

  const clearCanvas = useCallback(() => {
    recordHistory(components);
    setComponents([]);
    setSelectedComponentId(null);
  }, [components, recordHistory]);

  const loadTemplate = useCallback(
    (templateId: string) => {
      const t = PRESET_TEMPLATES.find((p) => p.id === templateId);
      if (!t) return;
      recordHistory(components);
      setComponents(JSON.parse(JSON.stringify(t.components)));
      setSelectedComponentId(null);
    },
    [components, recordHistory]
  );

  const undo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((prev) => prev.slice(0, prev.length - 1));
    setHistoryFuture((prev) => [JSON.parse(JSON.stringify(components)), ...prev]);
    setComponents(previous);
  }, [components, historyPast]);

  const redo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture((prev) => prev.slice(1));
    setHistoryPast((prev) => [...prev, JSON.parse(JSON.stringify(components))]);
    setComponents(next);
  }, [components, historyFuture]);

  const value = {
    components,
    selectedComponentId,
    hoveredComponentId,
    targetLanguage,
    viewportMode,
    isPreviewMode,
    canUndo: historyPast.length > 0,
    canRedo: historyFuture.length > 0,
    contextMenu,
    quickPopup,
    setSelectedComponentId,
    setHoveredComponentId,
    setTargetLanguage,
    setViewportMode,
    setIsPreviewMode,
    setContextMenu,
    setQuickPopup,
    addComponent,
    addRawComponent,
    updateComponentStyles,
    updateComponentProps,
    updateComponentEvents,
    removeComponent,
    duplicateComponent,
    moveComponent,
    wrapInContainer,
    clearCanvas,
    loadTemplate,
    undo,
    redo,
    findComponentById,
    selectedComponent,
  };

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};
