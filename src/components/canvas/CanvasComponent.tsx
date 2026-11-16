import React, { useState } from 'react';
import { FlexComponent } from '../../types';
import { useBuilder } from '../../context/BuilderContext';
import { Settings2, Trash2, Copy, Code2, ChevronUp, ChevronDown, GripVertical, Database, Table, Search, Sparkles } from 'lucide-react';
import { interpolateTokens } from '../../constants/dataSources';

interface CanvasComponentProps {
  component: FlexComponent;
  parentId?: string | null;
  dataItem?: Record<string, any>;
}

export const CanvasComponent: React.FC<CanvasComponentProps> = ({ component, parentId, dataItem }) => {
  const {
    selectedComponentId,
    hoveredComponentId,
    draggedComponentId,
    setSelectedComponentId,
    setHoveredComponentId,
    setDraggedComponentId,
    setContextMenu,
    setQuickPopup,
    isPreviewMode,
    duplicateComponent,
    removeComponent,
    moveComponent,
    reorderComponent,
    insertComponentAt,
    screens,
    setActiveScreenId,
    dataSources,
  } = useBuilder();

  // Local interactive state for preview mode
  const [inputValue, setInputValue] = useState(component.props.value || '');
  const [isChecked, setIsChecked] = useState(Boolean(component.props.checked));
  const [sliderValue, setSliderValue] = useState(component.props.value || 50);
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);

  // Active data record: if passed from a repeat parent, use it; otherwise, use first item from bound DataSource
  const boundDs = dataSources.find((d) => d.id === component.dataBinding?.dataSourceId) || dataSources[0];
  const activeRecord = dataItem || (boundDs?.data?.[0] ? boundDs.data[0] : {});

  const resolveText = (text: string | undefined): string => {
    if (!text || typeof text !== 'string') return text || '';
    return interpolateTokens(text, activeRecord);
  };

  // Drop position indicator state: 'before' | 'after' | 'inside' | null
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  const isSelected = selectedComponentId === component.id;
  const isHovered = hoveredComponentId === component.id && !isSelected;
  const isBeingDragged = draggedComponentId === component.id;

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    setDraggedComponentId(component.id);
    e.dataTransfer.setData('meo/component-id', component.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedComponentId(null);
    setDropPosition(null);
  };

  // Drag over target determination (before / after / inside)
  const handleDragOver = (e: React.DragEvent) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();

    // Do not allow dropping on self
    if (draggedComponentId === component.id) {
      setDropPosition(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const ratio = relY / rect.height;

    if (component.isContainer) {
      if (ratio < 0.2) {
        setDropPosition('before');
      } else if (ratio > 0.8) {
        setDropPosition('after');
      } else {
        setDropPosition('inside');
      }
    } else {
      if (ratio < 0.5) {
        setDropPosition('before');
      } else {
        setDropPosition('after');
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();

    const targetPos = dropPosition || (component.isContainer ? 'inside' : 'after');
    setDropPosition(null);

    // 1. Move an existing component within canvas
    const internalId = draggedComponentId || e.dataTransfer.getData('meo/component-id') || e.dataTransfer.getData('flexui/component-id');
    if (internalId) {
      if (internalId !== component.id) {
        reorderComponent(internalId, component.id, targetPos);
      }
      setDraggedComponentId(null);
      return;
    }

    // 2. Drop a new component from Left Sidebar
    const dataStr = e.dataTransfer.getData('application/json');
    if (dataStr) {
      try {
        const def = JSON.parse(dataStr);
        insertComponentAt(def, component.id, targetPos);
      } catch (err) {
        console.error('Failed to parse dropped component:', err);
      }
    }
  };

  // Handle Right Click -> Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedComponentId(component.id);
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      componentId: component.id,
    });
  };

  // Handle Click -> Selection & Quick Popup or Screen Routing
  const handleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) {
      // 1. Check if component is configured to navigate to another screen
      if (component.props.navigateToScreenId) {
        setActiveScreenId(component.props.navigateToScreenId);
        return;
      }
      if (component.props.targetRoute) {
        const target = screens.find((s) => s.route === component.props.targetRoute);
        if (target) {
          setActiveScreenId(target.id);
          return;
        }
      }

      // 2. Execute bound custom JS event if present
      triggerBoundEvent('onClick', e);
      return;
    }
    e.stopPropagation();
    setSelectedComponentId(component.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    setQuickPopup({
      isOpen: true,
      x: Math.min(e.clientX, window.innerWidth - 380),
      y: Math.min(e.clientY, window.innerHeight - 450),
      componentId: component.id,
      activeTab: 'styles',
    });
  };

  // Safe execution of bound JS functions during preview
  const triggerBoundEvent = (eventName: string, eventObj: any) => {
    const bound = component.events?.find((ev) => ev.event === eventName);
    if (bound && bound.customCode) {
      try {
        const fn = new Function('event', 'component', bound.customCode);
        fn(eventObj, component);
      } catch (err: any) {
        console.error(`Error executing ${bound.functionName}:`, err);
        alert(`Error executing ${bound.functionName}: ${err.message}`);
      }
    }
  };

  // Extract styles into React inline CSS
  const { styles } = component;
  const inlineStyles: React.CSSProperties = {
    width: styles.width,
    height: styles.height,
    minWidth: styles.minWidth,
    minHeight: styles.minHeight,
    maxWidth: styles.maxWidth,
    padding: styles.padding,
    margin: styles.margin,
    backgroundColor: styles.backgroundColor,
    color: styles.textColor,
    borderColor: styles.borderColor,
    borderWidth: styles.borderWidth,
    borderStyle: (styles.borderWidth ? styles.borderStyle || 'solid' : undefined) as any,
    borderRadius: styles.borderRadius,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight as any,
    textAlign: styles.textAlign,
    display: styles.display,
    flexDirection: styles.flexDirection,
    justifyContent: styles.justifyContent,
    alignItems: styles.alignItems,
    alignSelf: styles.alignSelf,
    flexWrap: styles.flexWrap,
    gap: styles.gap,
    gridTemplateColumns: styles.gridColumns,
    boxShadow: styles.boxShadow,
    cursor: isPreviewMode ? styles.cursor : 'grab',
    position: 'relative',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    opacity: isBeingDragged ? 0.4 : 1,
  };

  // In edit mode, controls are pointer-events-none so clicking/dragging anywhere on them moves the component!
  const pointerEventsClass = isPreviewMode ? 'pointer-events-auto' : 'pointer-events-none select-none';

  // Render Inner Content by Component Type
  const renderInner = () => {
    switch (component.type) {
      case 'data-table': {
        const ds = dataSources.find((d) => d.id === (component.dataBinding?.dataSourceId || 'ds-users')) || dataSources[0];
        const rawData = Array.isArray(ds?.data) ? ds.data : [];
        const columns =
          component.props.columns && component.props.columns.length > 0
            ? component.props.columns
            : (ds?.schema || []).slice(0, 4).map((f) => ({ key: f.name, label: f.name.toUpperCase() }));

        const filteredData = rawData.filter((row: any) => {
          if (!tableSearch) return true;
          return Object.values(row).some((v) =>
            String(v).toLowerCase().includes(tableSearch.toLowerCase())
          );
        });

        const pageSize = component.props.pageSize || 5;
        const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
        const pageData = filteredData.slice((tablePage - 1) * pageSize, tablePage * pageSize);

        return (
          <div className="w-full flex flex-col overflow-hidden text-xs">
            {/* Table Header Bar */}
            <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-700/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Table size={15} className="text-emerald-400" />
                <span className="font-bold text-white text-sm">
                  {component.props.title || ds?.name || 'Data Table'}
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                  {filteredData.length} records
                </span>
              </div>

              {component.props.searchable !== false && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={tableSearch}
                    disabled={!isPreviewMode}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                      setTablePage(1);
                    }}
                    className={`px-2.5 py-1 pl-7 bg-slate-950 border border-slate-700 rounded-md text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 ${pointerEventsClass}`}
                  />
                  <Search size={12} className="absolute left-2 top-2 text-slate-500 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Table Element */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {columns.map((col: any) => (
                      <th key={col.key} className="py-2.5 px-4 font-medium">
                        {col.label || col.key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pageData.length > 0 ? (
                    pageData.map((row: any, idx: number) => (
                      <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        {columns.map((col: any) => {
                          const val = row[col.key];
                          const isStatus = col.key.toLowerCase().includes('status');
                          return (
                            <td key={col.key} className="py-2.5 px-4 text-slate-300">
                              {isStatus ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                                    String(val).toLowerCase() === 'active' || String(val).toLowerCase() === 'completed'
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : String(val).toLowerCase() === 'online'
                                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  }`}
                                >
                                  {String(val || '')}
                                </span>
                              ) : col.key.toLowerCase().includes('avatar') || col.key.toLowerCase().includes('image') ? (
                                <img
                                  src={String(val)}
                                  alt=""
                                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                                />
                              ) : (
                                <span>{String(val !== undefined ? val : '')}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="py-6 text-center text-slate-500">
                        No matching records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {component.props.paginated !== false && totalPages > 1 && (
              <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Page {tablePage} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={tablePage <= 1 || !isPreviewMode}
                    onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                    className={`px-2 py-0.5 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 ${pointerEventsClass}`}
                  >
                    Prev
                  </button>
                  <button
                    disabled={tablePage >= totalPages || !isPreviewMode}
                    onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                    className={`px-2 py-0.5 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 ${pointerEventsClass}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'button':
      case 'button-outlined':
      case 'button-fab':
        return (
          <button
            type="button"
            className="flex items-center justify-center font-medium select-none active:opacity-90 w-full h-full bg-transparent border-0 text-inherit pointer-events-none"
          >
            {resolveText(component.props.label || 'Button')}
          </button>
        );

      case 'input':
        return (
          <div className="flex flex-col gap-1 w-full">
            {component.props.label && (
              <label className="text-xs font-medium text-slate-300 select-none">
                {component.props.label}
              </label>
            )}
            <input
              type={component.props.inputType || 'text'}
              placeholder={component.props.placeholder || ''}
              value={inputValue}
              disabled={!isPreviewMode}
              onChange={(e) => {
                setInputValue(e.target.value);
                triggerBoundEvent('onChange', e);
              }}
              className={`w-full px-3 py-2 bg-transparent text-inherit outline-none rounded ${pointerEventsClass}`}
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="flex flex-col gap-1 w-full">
            {component.props.label && (
              <label className="text-xs font-medium text-slate-300 select-none">
                {component.props.label}
              </label>
            )}
            <textarea
              rows={component.props.rows || 3}
              placeholder={component.props.placeholder || ''}
              disabled={!isPreviewMode}
              onChange={(e) => triggerBoundEvent('onChange', e)}
              className={`w-full px-3 py-2 bg-transparent text-inherit outline-none resize-none rounded ${pointerEventsClass}`}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className={`flex items-center gap-2 select-none ${pointerEventsClass}`}>
            <input
              type="checkbox"
              checked={isChecked}
              disabled={!isPreviewMode}
              onChange={(e) => {
                setIsChecked(e.target.checked);
                triggerBoundEvent('onChange', e);
              }}
              className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-sm font-medium text-inherit">{component.props.label || ''}</span>
          </div>
        );

      case 'switch':
        return (
          <div className={`flex items-center justify-between w-full select-none ${pointerEventsClass}`}>
            <span className="text-sm font-medium text-inherit">{component.props.label || 'Switch'}</span>
            <div
              onClick={() => {
                if (isPreviewMode) {
                  setIsChecked(!isChecked);
                  triggerBoundEvent('onChange', { checked: !isChecked });
                }
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                isChecked ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isChecked ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        );

      case 'radio-group':
        return (
          <div className={`flex flex-col gap-2 select-none ${pointerEventsClass}`}>
            {(component.props.options || []).map((opt: string, i: number) => (
              <label key={i} className="flex items-center gap-2 text-sm text-inherit cursor-pointer">
                <input
                  type="radio"
                  name={`radio-${component.id}`}
                  defaultChecked={i === (component.props.selectedIndex || 0)}
                  disabled={!isPreviewMode}
                  className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 cursor-pointer"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'select':
        return (
          <div className="flex flex-col gap-1 w-full">
            {component.props.label && (
              <label className="text-xs font-medium text-slate-300 select-none">
                {component.props.label}
              </label>
            )}
            <select
              disabled={!isPreviewMode}
              className={`w-full px-3 py-2 bg-transparent text-inherit outline-none cursor-pointer rounded ${pointerEventsClass}`}
            >
              {(component.props.options || []).map((opt: string, i: number) => (
                <option key={i} value={opt} className="bg-slate-900 text-slate-100">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );

      case 'slider':
        return (
          <div className="flex flex-col gap-1 w-full select-none">
            <div className="flex justify-between text-xs text-inherit">
              <span>{component.props.label || 'Slider'}</span>
              <span>{sliderValue}</span>
            </div>
            <input
              type="range"
              min={component.props.min || 0}
              max={component.props.max || 100}
              value={sliderValue}
              disabled={!isPreviewMode}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className={`w-full accent-blue-500 cursor-pointer ${pointerEventsClass}`}
            />
          </div>
        );

      case 'card':
        return (
          <div className="flex flex-col w-full h-full">
            {component.props.title && (
              <div className="border-b border-slate-700/60 pb-3 mb-2">
                <h3 className="text-base font-semibold text-white">{resolveText(component.props.title)}</h3>
                {component.props.subtitle && (
                  <p className="text-xs text-slate-400 mt-0.5">{resolveText(component.props.subtitle)}</p>
                )}
              </div>
            )}
            <div className="flex flex-col gap-3 w-full flex-1 min-h-[50px]">
              {component.dataBinding?.enabled && component.dataBinding?.mode === 'repeat' && isPreviewMode ? (
                (boundDs?.data || []).map((record: any, rIdx: number) => (
                  <div key={record.id || rIdx} className="w-full flex flex-col gap-2">
                    {component.children?.map((child) => (
                      <CanvasComponent
                        key={`${child.id}-repeat-${rIdx}`}
                        component={child}
                        parentId={component.id}
                        dataItem={record}
                      />
                    ))}
                  </div>
                ))
              ) : component.children && component.children.length > 0 ? (
                component.children.map((child) => (
                  <CanvasComponent
                    key={child.id}
                    component={child}
                    parentId={component.id}
                    dataItem={activeRecord}
                  />
                ))
              ) : (
                <div className="py-6 border-2 border-dashed border-slate-700/70 rounded-lg text-center text-xs text-slate-400">
                  Drop components inside Card
                </div>
              )}
            </div>
          </div>
        );

      case 'container':
      case 'grid':
        return (
          <div className="w-full h-full min-h-[40px]">
            {component.dataBinding?.enabled && component.dataBinding?.mode === 'repeat' && isPreviewMode ? (
              (boundDs?.data || []).map((record: any, rIdx: number) => (
                <div key={record.id || rIdx} className="w-full flex flex-col gap-2">
                  {component.children?.map((child) => (
                    <CanvasComponent
                      key={`${child.id}-repeat-${rIdx}`}
                      component={child}
                      parentId={component.id}
                      dataItem={record}
                    />
                  ))}
                </div>
              ))
            ) : component.children && component.children.length > 0 ? (
              component.children.map((child) => (
                <CanvasComponent
                  key={child.id}
                  component={child}
                  parentId={component.id}
                  dataItem={activeRecord}
                />
              ))
            ) : (
              <div className="py-4 border border-dashed border-slate-700/60 rounded flex items-center justify-center text-xs text-slate-500">
                Empty Container - Drag items here
              </div>
            )}
          </div>
        );

      case 'heading': {
        const Tag = (component.props.level || 'h2') as keyof JSX.IntrinsicElements;
        return <Tag className="text-inherit font-inherit m-0">{resolveText(component.props.text || 'Heading')}</Tag>;
      }

      case 'paragraph':
        return <p className="text-inherit font-inherit m-0 leading-relaxed">{resolveText(component.props.text || '')}</p>;

      case 'badge':
        return <span>{resolveText(component.props.text || 'Badge')}</span>;

      case 'alert':
        return (
          <div className="flex flex-col gap-1 w-full">
            <strong className="text-sm font-semibold">{resolveText(component.props.title || 'Notice')}</strong>
            <p className="text-xs opacity-90">{resolveText(component.props.message || '')}</p>
          </div>
        );

      case 'avatar':
        return (
          <img
            src={resolveText(component.props.src) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={resolveText(component.props.name || 'Avatar')}
            className="w-full h-full object-cover rounded-full"
          />
        );

      case 'divider':
        return <div className="w-full h-full bg-slate-700" />;

      case 'progress':
        return (
          <div className="w-full h-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${component.props.value || 50}%` }}
            />
          </div>
        );

      case 'appbar':
        return (
          <div className="flex items-center justify-between w-full">
            <span className="font-bold text-base text-white">{component.props.title || 'App'}</span>
            <div className="flex items-center gap-4 text-xs text-slate-300">
              {(component.props.navItems || []).map((item: string, i: number) => (
                <span key={i} className="hover:text-white cursor-pointer">
                  {item}
                </span>
              ))}
            </div>
          </div>
        );

      default: {
        if (component.props.customHtml) {
          return (
            <div
              dangerouslySetInnerHTML={{ __html: component.props.customHtml }}
              className="w-full overflow-hidden"
            />
          );
        }

        if (component.children && component.children.length > 0) {
          return (
            <div className="w-full flex flex-col gap-2">
              {component.props.title && (
                <h4 className="font-bold text-sm text-inherit">{component.props.title}</h4>
              )}
              {component.props.subtitle && (
                <p className="text-xs opacity-80">{component.props.subtitle}</p>
              )}
              {component.children.map((child) => (
                <CanvasComponent key={child.id} component={child} parentId={component.id} />
              ))}
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center font-medium select-none">
            {component.props.label || component.props.title || component.name}
          </div>
        );
      }
    }
  };

  return (
    <div
      id={component.id}
      draggable={!isPreviewMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => !isPreviewMode && setHoveredComponentId(component.id)}
      onMouseLeave={() => !isPreviewMode && setHoveredComponentId(null)}
      style={inlineStyles}
      className={`group relative transition-all ${
        !isPreviewMode && isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 shadow-xl z-20'
          : !isPreviewMode && isHovered
          ? 'ring-1 ring-blue-400/70 ring-dashed z-10'
          : ''
      }`}
    >
      {/* Drop Target Visual Line (Before) */}
      {!isPreviewMode && dropPosition === 'before' && (
        <div className="absolute -top-1.5 left-0 right-0 h-1 bg-blue-500 rounded-full z-40 shadow-sm animate-pulse" />
      )}

      {/* Drop Target Visual Line (After) */}
      {!isPreviewMode && dropPosition === 'after' && (
        <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-blue-500 rounded-full z-40 shadow-sm animate-pulse" />
      )}

      {/* Drop Target Visual Border (Inside Container) */}
      {!isPreviewMode && dropPosition === 'inside' && (
        <div className="absolute inset-0 border-2 border-emerald-500 bg-emerald-500/10 rounded-lg pointer-events-none z-30 flex items-center justify-center">
          <span className="text-[10px] font-bold text-emerald-300 bg-slate-900/90 px-2 py-0.5 rounded shadow border border-emerald-500/40">
            Drop inside container
          </span>
        </div>
      )}

      {/* Selection Label & Drag Toolbar */}
      {!isPreviewMode && isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-7 left-0 flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide shadow-md z-30 select-none animate-fadeIn"
        >
          {/* Drag Handle Icon */}
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-blue-700 rounded transition-colors flex items-center mr-0.5"
            title="Drag to reposition anywhere on canvas"
          >
            <GripVertical size={13} className="text-blue-100" />
          </div>

          <span className="truncate max-w-[120px]">{component.name}</span>

          <div className="flex items-center gap-0.5 ml-2 border-l border-blue-400 pl-1.5">
            <button
              title="Quick Style / Props (Double-click)"
              onClick={() =>
                setQuickPopup({
                  isOpen: true,
                  x: 350,
                  y: 120,
                  componentId: component.id,
                  activeTab: 'styles',
                })
              }
              className="p-0.5 hover:bg-blue-700 rounded transition-colors"
            >
              <Settings2 size={12} />
            </button>
            <button
              title="Move Up"
              onClick={() => moveComponent(component.id, 'up')}
              className="p-0.5 hover:bg-blue-700 rounded transition-colors"
            >
              <ChevronUp size={12} />
            </button>
            <button
              title="Move Down"
              onClick={() => moveComponent(component.id, 'down')}
              className="p-0.5 hover:bg-blue-700 rounded transition-colors"
            >
              <ChevronDown size={12} />
            </button>
            <button
              title="Duplicate"
              onClick={() => duplicateComponent(component.id)}
              className="p-0.5 hover:bg-blue-700 rounded transition-colors"
            >
              <Copy size={12} />
            </button>
            <button
              title="Delete"
              onClick={() => removeComponent(component.id)}
              className="p-0.5 hover:bg-red-600 rounded transition-colors text-red-200 hover:text-white"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Data Binding Badge */}
      {!isPreviewMode && component.dataBinding?.enabled && (
        <div className="absolute top-1 left-1 flex items-center gap-1 bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 px-1.5 py-0.5 rounded text-[10px] font-mono z-20 pointer-events-none shadow-sm">
          <Database size={10} className="text-emerald-400" />
          <span>
            {component.dataBinding.mode === 'repeat'
              ? `Repeat: ${boundDs?.name || 'API'} (${boundDs?.data?.length || 0})`
              : `Bound: ${boundDs?.name || 'API'}`}
          </span>
        </div>
      )}

      {/* Screen Route Navigation Badge */}
      {!isPreviewMode && (component.props.navigateToScreenId || component.props.targetRoute) && (
        <div className="absolute top-1 right-1 flex items-center gap-1 bg-purple-900/90 text-purple-200 border border-purple-500/60 px-1.5 py-0.5 rounded text-[10px] font-mono z-20 pointer-events-none shadow-sm">
          <span>↳ {component.props.targetRoute || screens.find((s) => s.id === component.props.navigateToScreenId)?.route || 'Route'}</span>
        </div>
      )}

      {renderInner()}
    </div>
  );
};
