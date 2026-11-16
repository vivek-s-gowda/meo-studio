import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  FlexComponent,
  ComponentDefinition,
  TargetLanguage,
  ViewportMode,
  ContextMenuState,
  QuickPopupState,
  ComponentStyle,
  ComponentEvent,
  Screen,
  DataSource,
  ComponentDataBinding,
} from '../types';
import { COMPONENT_CATALOG } from '../constants/componentCatalog';
import { PRESET_TEMPLATES } from '../constants/templates';
import { PRESET_DATA_SOURCES, inferSchema } from '../constants/dataSources';

interface BuilderContextType {
  screens: Screen[];
  activeScreenId: string;
  activeScreen: Screen;
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
  draggedComponentId: string | null;
  customComponents: ComponentDefinition[];
  isCreateComponentOpen: boolean;

  // Data Sources & Mock APIs
  dataSources: DataSource[];
  activeDataSourceId: string | null;
  isDataSourcesModalOpen: boolean;
  setIsDataSourcesModalOpen: (open: boolean) => void;
  setActiveDataSourceId: (id: string | null) => void;
  addDataSource: (source: Omit<DataSource, 'id'>) => string;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  deleteDataSource: (id: string) => void;
  fetchDataSourceData: (id: string) => Promise<void>;
  updateComponentDataBinding: (id: string, binding: ComponentDataBinding | undefined) => void;
  getDataSourceById: (id: string) => DataSource | undefined;

  // Modular Component Architecture
  isModularMode: boolean;
  setIsModularMode: (val: boolean) => void;
  toggleModularMode: () => void;

  // Actions
  addScreen: (name: string, route: string, starterTemplateId?: string) => string;
  updateScreen: (id: string, updates: Partial<Pick<Screen, 'name' | 'route'>>) => void;
  deleteScreen: (id: string) => void;
  duplicateScreen: (id: string) => string;
  setActiveScreenId: (id: string) => void;

  setSelectedComponentId: (id: string | null) => void;
  setHoveredComponentId: (id: string | null) => void;
  setDraggedComponentId: (id: string | null) => void;
  setTargetLanguage: (lang: TargetLanguage) => void;
  setViewportMode: (mode: ViewportMode) => void;
  setIsPreviewMode: (preview: boolean) => void;
  setIsCreateComponentOpen: (open: boolean) => void;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>;
  setQuickPopup: React.Dispatch<React.SetStateAction<QuickPopupState>>;

  registerCustomComponent: (def: ComponentDefinition) => void;
  deleteCustomComponent: (type: string) => void;
  saveComponentAsCustom: (componentId: string, name: string, description?: string) => boolean;

  addComponent: (def: ComponentDefinition, targetParentId?: string | null, targetIndex?: number) => string;
  insertComponentAt: (def: ComponentDefinition, targetId: string, position: 'before' | 'after' | 'inside') => string;
  addRawComponent: (component: FlexComponent, targetParentId?: string | null) => void;
  reorderComponent: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  updateComponentStyles: (id: string, styles: Partial<ComponentStyle>) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  updateComponentEvents: (id: string, events: ComponentEvent[]) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  moveComponent: (id: string, direction: 'up' | 'down') => void;
  wrapInContainer: (id: string) => void;
  clearCanvas: () => void;
  loadTemplate: (templateId: string) => void;
  setComponents: (action: React.SetStateAction<FlexComponent[]>) => void;
  updateScreenComponents: (screenId: string, components: FlexComponent[]) => void;
  undo: () => void;
  redo: () => void;

  findComponentById: (id: string) => FlexComponent | null;
  selectedComponent: FlexComponent | null;
}

const BuilderContext = createContext<BuilderContextType | null>(null);

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Screens state with route support
  const [screens, setScreens] = useState<Screen[]>(() => {
    try {
      const saved = localStorage.getItem('meo_screens') || localStorage.getItem('flexui_screens');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading screens from localStorage:', e);
    }
    const homeComponents: FlexComponent[] = JSON.parse(JSON.stringify(PRESET_TEMPLATES[0].components));
    // Link login button on Screen 1 to Dashboard Screen!
    const submitBtn = homeComponents[0]?.children?.find((c) => c.id === 'comp-login-submit');
    if (submitBtn) {
      submitBtn.props.navigateToScreenId = 'screen-dashboard';
      submitBtn.props.targetRoute = '/dashboard';
    }

    const dashboardComponents: FlexComponent[] = JSON.parse(JSON.stringify(PRESET_TEMPLATES[1].components));

    return [
      {
        id: 'screen-home',
        name: 'Home / Login',
        route: '/',
        components: homeComponents,
      },
      {
        id: 'screen-dashboard',
        name: 'User Dashboard',
        route: '/dashboard',
        components: dashboardComponents,
      },
    ];
  });

  const [activeScreenId, setActiveScreenIdState] = useState<string>('screen-home');

  // Auto-sync screens to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('meo_screens', JSON.stringify(screens));
    } catch (e) {
      console.error('Failed to sync screens to localStorage:', e);
    }
  }, [screens]);

  const activeScreen = useMemo(() => {
    return (
      screens.find((s) => s.id === activeScreenId) ||
      screens[0] || {
        id: 'default',
        name: 'Home Screen',
        route: '/',
        components: [],
      }
    );
  }, [screens, activeScreenId]);

  const components = activeScreen.components;

  const setComponents = useCallback(
    (action: React.SetStateAction<FlexComponent[]>) => {
      setScreens((prevScreens) => {
        return prevScreens.map((screen) => {
          if (screen.id === activeScreenId) {
            const nextComponents = typeof action === 'function' ? action(screen.components) : action;
            return { ...screen, components: nextComponents };
          }
          return screen;
        });
      });
    },
    [activeScreenId]
  );

  const updateScreenComponents = useCallback((screenId: string, newComps: FlexComponent[]) => {
    setScreens((prev) =>
      prev.map((s) => (s.id === screenId ? { ...s, components: newComps } : s))
    );
  }, []);

  const setActiveScreenId = useCallback((id: string) => {
    setActiveScreenIdState(id);
    setSelectedComponentId(null);
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
    setQuickPopup((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const addScreen = useCallback(
    (name: string, route: string, starterTemplateId?: string): string => {
      const id = `screen-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
      let initialComponents: FlexComponent[] = [];
      if (starterTemplateId) {
        const t = PRESET_TEMPLATES.find((p) => p.id === starterTemplateId);
        if (t) initialComponents = JSON.parse(JSON.stringify(t.components));
      }
      const cleanRoute = route.startsWith('/') ? route : `/${route}`;
      const newScreen: Screen = {
        id,
        name: name.trim() || 'New Screen',
        route: cleanRoute,
        components: initialComponents,
      };
      setScreens((prev) => [...prev, newScreen]);
      setActiveScreenId(id);
      return id;
    },
    [setActiveScreenId]
  );

  const updateScreen = useCallback((id: string, updates: Partial<Pick<Screen, 'name' | 'route'>>) => {
    setScreens((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const route = updates.route
            ? updates.route.startsWith('/')
              ? updates.route
              : `/${updates.route}`
            : s.route;
          return {
            ...s,
            name: updates.name !== undefined ? updates.name : s.name,
            route,
          };
        }
        return s;
      })
    );
  }, []);

  const deleteScreen = useCallback(
    (id: string) => {
      setScreens((prev) => {
        if (prev.length <= 1) {
          alert('At least one screen must remain in the project.');
          return prev;
        }
        const filtered = prev.filter((s) => s.id !== id);
        if (activeScreenId === id) {
          setActiveScreenIdState(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeScreenId]
  );

  const duplicateScreen = useCallback(
    (id: string): string => {
      const source = screens.find((s) => s.id === id);
      if (!source) return id;

      const newId = `screen-${Date.now().toString(36)}`;
      function cloneNodes(nodes: FlexComponent[]): FlexComponent[] {
        return nodes.map((n) => {
          const cId = `comp-${n.type}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
          return {
            ...n,
            id: cId,
            children: n.children ? cloneNodes(n.children) : undefined,
          };
        });
      }

      const dup: Screen = {
        id: newId,
        name: `${source.name} (Copy)`,
        route: `${source.route}-copy`,
        components: cloneNodes(source.components),
      };

      setScreens((prev) => [...prev, dup]);
      setActiveScreenId(newId);
      return newId;
    },
    [screens, setActiveScreenId]
  );

  // Dynamic Custom Components registered by user
  const [customComponents, setCustomComponents] = useState<ComponentDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('meo_custom_components') || localStorage.getItem('flexui_custom_components');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading custom components:', e);
    }
    return [
      {
        type: 'custom-hero-cta',
        name: 'Gradient Hero Banner',
        category: 'custom',
        icon: 'Sparkles',
        description: 'Dynamic gradient callout container with button',
        isContainer: true,
        isCustom: true,
        defaultProps: {
          title: '🚀 Launching Meo Custom Studio',
          subtitle: 'Create reusable components and export across modern frameworks.',
        },
        defaultStyles: {
          width: '100%',
          padding: '20px 24px',
          backgroundColor: '#3b0764',
          borderColor: '#9333ea',
          borderWidth: '1.5px',
          borderRadius: '14px',
          boxShadow: '0 10px 25px -5px rgba(147, 51, 234, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        },
        defaultEvents: [],
        defaultChildren: [
          {
            id: 'hero-badge-chip',
            type: 'badge',
            name: 'New Feature Chip',
            category: 'data-display',
            props: { text: '✨ DYNAMIC COMPONENT' },
            styles: { padding: '3px 10px', backgroundColor: '#9333ea', textColor: '#ffffff', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', alignSelf: 'flex-start' },
            events: [],
          },
          {
            id: 'hero-badge-title',
            type: 'heading',
            name: 'Hero Title',
            category: 'typography',
            props: { text: 'Build Reusable Components on the Fly', level: 'h2' },
            styles: { fontSize: '20px', fontWeight: '700', textColor: '#ffffff', margin: '0' },
            events: [],
          },
          {
            id: 'hero-badge-btn',
            type: 'button',
            name: 'Action Button',
            category: 'buttons',
            props: { label: 'Explore Custom Palette →', variant: 'contained' },
            styles: { padding: '10px 20px', backgroundColor: '#a855f7', textColor: '#ffffff', borderRadius: '8px', fontWeight: '600', alignSelf: 'flex-start', cursor: 'pointer' },
            events: [{ event: 'onClick', functionName: 'onHeroAction', customCode: "alert('Dynamic Component Action Triggered!');" }],
          },
        ],
      },
    ];
  });

  const [isCreateComponentOpen, setIsCreateComponentOpen] = useState<boolean>(false);
  const [isDataSourcesModalOpen, setIsDataSourcesModalOpen] = useState<boolean>(false);

  // Data Sources State
  const [dataSources, setDataSources] = useState<DataSource[]>(() => {
    try {
      const saved = localStorage.getItem('meo_datasources') || localStorage.getItem('flexui_datasources');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading data sources from localStorage:', e);
    }
    return PRESET_DATA_SOURCES;
  });

  const [activeDataSourceId, setActiveDataSourceId] = useState<string | null>('ds-users');

  useEffect(() => {
    try {
      localStorage.setItem('meo_datasources', JSON.stringify(dataSources));
    } catch (e) {
      console.error('Failed to sync data sources to localStorage:', e);
    }
  }, [dataSources]);

  const addDataSource = useCallback((source: Omit<DataSource, 'id'>): string => {
    const id = `ds-${source.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const newDs: DataSource = {
      ...source,
      id,
      schema: source.schema || inferSchema(source.data || []),
    };
    setDataSources((prev) => [...prev, newDs]);
    return id;
  }, []);

  const updateDataSource = useCallback((id: string, updates: Partial<DataSource>) => {
    setDataSources((prev) =>
      prev.map((ds) => {
        if (ds.id === id) {
          const nextData = updates.data !== undefined ? updates.data : ds.data;
          const nextSchema = updates.schema || (updates.data !== undefined ? inferSchema(nextData) : ds.schema);
          return {
            ...ds,
            ...updates,
            schema: nextSchema,
          };
        }
        return ds;
      })
    );
  }, []);

  const deleteDataSource = useCallback((id: string) => {
    setDataSources((prev) => prev.filter((ds) => ds.id !== id));
  }, []);

  const fetchDataSourceData = useCallback(async (id: string) => {
    setDataSources((prev) =>
      prev.map((ds) => (ds.id === id ? { ...ds, isLoading: true, error: null } : ds))
    );
    const target = dataSources.find((ds) => ds.id === id);
    if (!target || !target.endpoint) {
      setDataSources((prev) =>
        prev.map((ds) => (ds.id === id ? { ...ds, isLoading: false } : ds))
      );
      return;
    }

    try {
      const res = await fetch(target.endpoint, {
        method: target.method || 'GET',
        headers: target.headers || { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const arrayData = Array.isArray(json) ? json : json.data || json.items || [json];
      const newSchema = inferSchema(arrayData);

      setDataSources((prev) =>
        prev.map((ds) =>
          ds.id === id
            ? {
                ...ds,
                data: arrayData,
                schema: newSchema,
                isLoading: false,
                lastFetched: Date.now(),
              }
            : ds
        )
      );
    } catch (err: any) {
      console.error('Fetch error:', err);
      setDataSources((prev) =>
        prev.map((ds) =>
          ds.id === id
            ? {
                ...ds,
                isLoading: false,
                error: err.message || 'Failed to fetch endpoint',
              }
            : ds
        )
      );
    }
  }, [dataSources]);

  const getDataSourceById = useCallback((id: string) => {
    return dataSources.find((ds) => ds.id === id);
  }, [dataSources]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>('react');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Modular Component Architecture State
  const [isModularMode, setIsModularMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('meo_modular_mode') || localStorage.getItem('flexui_modular_mode');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return true; // Default to modular components mode
  });

  const toggleModularMode = useCallback(() => {
    setIsModularMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('meo_modular_mode', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

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

  // Register dynamic custom component
  const registerCustomComponent = useCallback((def: ComponentDefinition) => {
    setCustomComponents((prev) => {
      const existing = prev.filter((c) => c.type !== def.type);
      const updated = [def, ...existing];
      try {
        localStorage.setItem('meo_custom_components', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save custom component to localStorage:', e);
      }
      return updated;
    });
  }, []);

  // Delete dynamic custom component
  const deleteCustomComponent = useCallback((type: string) => {
    setCustomComponents((prev) => {
      const updated = prev.filter((c) => c.type !== type);
      try {
        localStorage.setItem('meo_custom_components', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to delete custom component from localStorage:', e);
      }
      return updated;
    });
  }, []);

  // Save selected canvas component as a reusable dynamic component
  const saveComponentAsCustom = useCallback(
    (componentId: string, name: string, description?: string): boolean => {
      const comp = findComponentById(componentId);
      if (!comp) return false;

      const typeSlug = `custom-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

      function sanitizeTree(node: FlexComponent): FlexComponent {
        return {
          ...node,
          children: node.children ? node.children.map(sanitizeTree) : undefined,
        };
      }

      const newDef: ComponentDefinition = {
        type: typeSlug,
        name: name.trim() || comp.name,
        category: 'custom',
        icon: 'Sparkles',
        description: description || `Custom reusable component based on ${comp.name}`,
        isContainer: comp.isContainer || (comp.children && comp.children.length > 0),
        isCustom: true,
        defaultProps: JSON.parse(JSON.stringify(comp.props)),
        defaultStyles: JSON.parse(JSON.stringify(comp.styles)),
        defaultEvents: JSON.parse(JSON.stringify(comp.events || [])),
        defaultChildren: comp.children ? comp.children.map(sanitizeTree) : undefined,
      };

      registerCustomComponent(newDef);
      return true;
    },
    [findComponentById, registerCustomComponent]
  );

  // Add Component from Catalog
  const addComponent = useCallback(
    (def: ComponentDefinition, targetParentId?: string | null, targetIndex?: number): string => {
      recordHistory(components);
      const newId = `comp-${def.type}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;

      function cloneChildrenTree(children: FlexComponent[], pId: string): FlexComponent[] {
        return children.map((c) => {
          const childId = `comp-${c.type}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
          return {
            ...c,
            id: childId,
            parentId: pId,
            children: c.children ? cloneChildrenTree(c.children, childId) : undefined,
          };
        });
      }

      const newComp: FlexComponent = {
        id: newId,
        type: def.type,
        name: def.name,
        category: def.category,
        isContainer: def.isContainer || (def.defaultChildren && def.defaultChildren.length > 0),
        props: JSON.parse(JSON.stringify(def.defaultProps)),
        styles: JSON.parse(JSON.stringify(def.defaultStyles)),
        events: JSON.parse(JSON.stringify(def.defaultEvents || [])),
        children: def.defaultChildren && def.defaultChildren.length > 0
          ? cloneChildrenTree(def.defaultChildren, newId)
          : def.isContainer
          ? []
          : undefined,
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

  const isAncestor = useCallback(
    (ancestorId: string, descendantId: string): boolean => {
      const ancestor = findInTree(components, ancestorId);
      if (!ancestor || !ancestor.children) return false;
      return !!findInTree(ancestor.children, descendantId);
    },
    [components, findInTree]
  );

  // Reorder / Move component anywhere inside the canvas
  const reorderComponent = useCallback(
    (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
      if (sourceId === targetId) return;
      if (isAncestor(sourceId, targetId)) return;

      recordHistory(components);

      let detached: FlexComponent | null = null;
      const detachRecursive = (list: FlexComponent[]): FlexComponent[] => {
        const next: FlexComponent[] = [];
        for (const item of list) {
          if (item.id === sourceId) {
            detached = item;
          } else {
            if (item.children) {
              next.push({ ...item, children: detachRecursive(item.children) });
            } else {
              next.push(item);
            }
          }
        }
        return next;
      };

      const treeWithoutSource = detachRecursive(components);
      if (!detached) return;

      if (position === 'inside') {
        const insertInside = (list: FlexComponent[]): FlexComponent[] => {
          return list.map((item) => {
            if (item.id === targetId) {
              return {
                ...item,
                children: [...(item.children || []), { ...detached!, parentId: targetId }],
              };
            }
            if (item.children) {
              return { ...item, children: insertInside(item.children) };
            }
            return item;
          });
        };
        setComponents(insertInside(treeWithoutSource));
      } else {
        const insertRelative = (
          list: FlexComponent[],
          parentId: string | null
        ): { list: FlexComponent[]; inserted: boolean } => {
          const index = list.findIndex((c) => c.id === targetId);
          if (index !== -1) {
            const next = [...list];
            const insertIndex = position === 'before' ? index : index + 1;
            next.splice(insertIndex, 0, { ...detached!, parentId });
            return { list: next, inserted: true };
          }
          let wasInserted = false;
          const updatedList = list.map((item) => {
            if (item.children && !wasInserted) {
              const res = insertRelative(item.children, item.id);
              if (res.inserted) {
                wasInserted = true;
                return { ...item, children: res.list };
              }
            }
            return item;
          });
          return { list: updatedList, inserted: wasInserted };
        };

        const result = insertRelative(treeWithoutSource, null);
        setComponents(result.list);
      }

      setSelectedComponentId(sourceId);
    },
    [components, isAncestor, recordHistory]
  );

  // Insert a new component relative to an existing target
  const insertComponentAt = useCallback(
    (def: ComponentDefinition, targetId: string, position: 'before' | 'after' | 'inside'): string => {
      recordHistory(components);
      const newId = `comp-${def.type}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;

      function cloneChildrenTree(children: FlexComponent[], pId: string): FlexComponent[] {
        return children.map((c) => {
          const childId = `comp-${c.type}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
          return {
            ...c,
            id: childId,
            parentId: pId,
            children: c.children ? cloneChildrenTree(c.children, childId) : undefined,
          };
        });
      }

      const newComp: FlexComponent = {
        id: newId,
        type: def.type,
        name: def.name,
        category: def.category,
        isContainer: def.isContainer || (def.defaultChildren && def.defaultChildren.length > 0),
        props: JSON.parse(JSON.stringify(def.defaultProps)),
        styles: JSON.parse(JSON.stringify(def.defaultStyles)),
        events: JSON.parse(JSON.stringify(def.defaultEvents || [])),
        children: def.defaultChildren && def.defaultChildren.length > 0
          ? cloneChildrenTree(def.defaultChildren, newId)
          : def.isContainer
          ? []
          : undefined,
        parentId: null,
      };

      if (position === 'inside') {
        const insertInside = (list: FlexComponent[]): FlexComponent[] => {
          return list.map((item) => {
            if (item.id === targetId) {
              return {
                ...item,
                children: [...(item.children || []), { ...newComp, parentId: targetId }],
              };
            }
            if (item.children) {
              return { ...item, children: insertInside(item.children) };
            }
            return item;
          });
        };
        setComponents(insertInside(components));
      } else {
        const insertRelative = (
          list: FlexComponent[],
          parentId: string | null
        ): { list: FlexComponent[]; inserted: boolean } => {
          const index = list.findIndex((c) => c.id === targetId);
          if (index !== -1) {
            const next = [...list];
            const insertIndex = position === 'before' ? index : index + 1;
            next.splice(insertIndex, 0, { ...newComp, parentId });
            return { list: next, inserted: true };
          }
          let wasInserted = false;
          const updatedList = list.map((item) => {
            if (item.children && !wasInserted) {
              const res = insertRelative(item.children, item.id);
              if (res.inserted) {
                wasInserted = true;
                return { ...item, children: res.list };
              }
            }
            return item;
          });
          return { list: updatedList, inserted: wasInserted };
        };
        setComponents(insertRelative(components, null).list);
      }

      setSelectedComponentId(newId);
      return newId;
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

  // Update Data Binding
  const updateComponentDataBinding = useCallback(
    (id: string, binding: ComponentDataBinding | undefined) => {
      recordHistory(components);
      const updateRecursive = (list: FlexComponent[]): FlexComponent[] => {
        return list.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              dataBinding: binding,
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
    screens,
    activeScreenId,
    activeScreen,
    addScreen,
    updateScreen,
    deleteScreen,
    duplicateScreen,
    setActiveScreenId,
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
    draggedComponentId,
    customComponents,
    isCreateComponentOpen,
    setSelectedComponentId,
    setHoveredComponentId,
    setDraggedComponentId,
    setTargetLanguage,
    setViewportMode,
    setIsPreviewMode,
    isModularMode,
    setIsModularMode,
    toggleModularMode,
    setIsCreateComponentOpen,
    setContextMenu,
    setQuickPopup,
    registerCustomComponent,
    deleteCustomComponent,
    saveComponentAsCustom,
    addComponent,
    insertComponentAt,
    addRawComponent,
    reorderComponent,
    updateComponentStyles,
    updateComponentProps,
    updateComponentEvents,
    updateComponentDataBinding,
    dataSources,
    activeDataSourceId,
    setActiveDataSourceId,
    isDataSourcesModalOpen,
    setIsDataSourcesModalOpen,
    addDataSource,
    updateDataSource,
    deleteDataSource,
    fetchDataSourceData,
    getDataSourceById,
    removeComponent,
    duplicateComponent,
    moveComponent,
    wrapInContainer,
    clearCanvas,
    loadTemplate,
    setComponents,
    updateScreenComponents,
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
