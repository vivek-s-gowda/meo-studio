import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { ComponentDefinition, ComponentCategory } from '../../types';
import { DynamicIcon } from '../ui/Icons';
import { X, Sparkles, Check, Palette, Sliders, Code2, Layers, Eye } from 'lucide-react';

interface CreateCustomComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  'Sparkles',
  'Star',
  'Rocket',
  'Flame',
  'Shield',
  'Heart',
  'Zap',
  'Box',
  'Tag',
  'Layout',
  'CreditCard',
  'MousePointerClick',
];

export const CreateCustomComponentModal: React.FC<CreateCustomComponentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { registerCustomComponent, addComponent } = useBuilder();

  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [name, setName] = useState('Gradient Glow Button');
  const [description, setDescription] = useState('Custom elevated button with rich gradient background and hover glow');
  const [category, setCategory] = useState<ComponentCategory>('custom');
  const [selectedIcon, setSelectedIcon] = useState('Sparkles');
  const [baseType, setBaseType] = useState<'button' | 'card' | 'input' | 'badge' | 'custom-html'>('button');

  // Visual Styling state
  const [label, setLabel] = useState('Explore Special Offer ✦');
  const [bgColor, setBgColor] = useState('#7c3aed');
  const [textColor, setTextColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#a855f7');
  const [borderWidth, setBorderWidth] = useState('1px');
  const [borderRadius, setBorderRadius] = useState('10px');
  const [padding, setPadding] = useState('12px 24px');
  const [fontSize, setFontSize] = useState('14px');
  const [fontWeight, setFontWeight] = useState('600');
  const [boxShadow, setBoxShadow] = useState('0 10px 25px -5px rgba(124, 58, 237, 0.4)');
  const [customJsCode, setCustomJsCode] = useState("alert('Dynamic custom component clicked!');");

  // Raw HTML snippet mode
  const [htmlSnippet, setHtmlSnippet] = useState(
    `<div class="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white shadow-xl flex items-center justify-between gap-4">
  <div>
    <h4 class="font-bold text-sm">✨ Special Upgrade Banner</h4>
    <p class="text-xs text-violet-200">Unlock full capabilities with zero configuration</p>
  </div>
  <button class="px-3 py-1.5 bg-white text-violet-700 rounded-lg text-xs font-bold hover:bg-violet-50 transition-colors">
    Claim Now
  </button>
</div>`
  );

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;

    const typeSlug = `custom-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const isContainer = baseType === 'card' || baseType === 'custom-html';

    const newDef: ComponentDefinition = {
      type: typeSlug,
      name: name.trim(),
      category,
      icon: selectedIcon,
      description: description.trim() || 'Custom registered component',
      isContainer,
      isCustom: true,
      customHtml: activeTab === 'code' ? htmlSnippet : undefined,
      defaultProps: {
        label: baseType === 'button' || baseType === 'badge' ? label : undefined,
        title: baseType === 'card' ? name : undefined,
        placeholder: baseType === 'input' ? 'Custom placeholder...' : undefined,
      },
      defaultStyles: {
        width: baseType === 'button' || baseType === 'badge' ? 'auto' : '100%',
        padding,
        backgroundColor: bgColor,
        textColor,
        borderColor: borderWidth !== '0px' ? borderColor : undefined,
        borderWidth,
        borderRadius,
        fontSize,
        fontWeight,
        boxShadow,
        display: baseType === 'button' || baseType === 'badge' ? 'inline-flex' : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      },
      defaultEvents: [
        {
          event: 'onClick',
          functionName: `on_${typeSlug.replace(/-/g, '_')}`,
          customCode: customJsCode,
          description: `Custom click handler for ${name}`,
        },
      ],
    };

    registerCustomComponent(newDef);
    onClose();
  };

  const handleCreateAndAdd = () => {
    if (!name.trim()) return;
    const typeSlug = `custom-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const isContainer = baseType === 'card' || baseType === 'custom-html';

    const newDef: ComponentDefinition = {
      type: typeSlug,
      name: name.trim(),
      category,
      icon: selectedIcon,
      description: description.trim() || 'Custom registered component',
      isContainer,
      isCustom: true,
      customHtml: activeTab === 'code' ? htmlSnippet : undefined,
      defaultProps: {
        label: baseType === 'button' || baseType === 'badge' ? label : undefined,
        title: baseType === 'card' ? name : undefined,
        placeholder: baseType === 'input' ? 'Custom placeholder...' : undefined,
      },
      defaultStyles: {
        width: baseType === 'button' || baseType === 'badge' ? 'auto' : '100%',
        padding,
        backgroundColor: bgColor,
        textColor,
        borderColor: borderWidth !== '0px' ? borderColor : undefined,
        borderWidth,
        borderRadius,
        fontSize,
        fontWeight,
        boxShadow,
        display: baseType === 'button' || baseType === 'badge' ? 'inline-flex' : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      },
      defaultEvents: [
        {
          event: 'onClick',
          functionName: `on_${typeSlug.replace(/-/g, '_')}`,
          customCode: customJsCode,
        },
      ],
    };

    registerCustomComponent(newDef);
    addComponent(newDef, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Create Dynamic Custom Component</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                  Custom Registry
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Design custom components and make them permanently draggable in your left palette
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'visual'
                ? 'border-purple-500 text-purple-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette size={14} />
            <span>Visual Designer Mode</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'code'
                ? 'border-purple-500 text-purple-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 size={14} />
            <span>HTML & Tailwind Snippet Mode</span>
          </button>
        </div>

        {/* Body 2-Column Layout: Controls & Live Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Form Controls */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 border-r border-slate-800 text-xs scrollbar-thin">
            {/* Identity */}
            <div className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Component Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Floating Card, Gradient Button"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description..."
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 outline-none"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="text-slate-400 block mb-1.5">Palette Icon</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      className={`p-2 rounded-lg border transition-colors ${
                        selectedIcon === iconName
                          ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-500/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                      title={iconName}
                    >
                      <DynamicIcon name={iconName} size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TAB 1: Visual Mode */}
            {activeTab === 'visual' ? (
              <div className="space-y-4 pt-3 border-t border-slate-800">
                {/* Base Archetype */}
                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">Base Archetype</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'button', label: 'Button' },
                      { id: 'card', label: 'Card' },
                      { id: 'badge', label: 'Badge' },
                      { id: 'input', label: 'Input' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBaseType(item.id as any)}
                        className={`py-1.5 px-2 rounded-md font-medium text-[11px] transition-colors border ${
                          baseType === item.id
                            ? 'bg-purple-600/30 text-purple-200 border-purple-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content / Label */}
                <div>
                  <label className="text-slate-300 block mb-1">Text / Label Content</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none"
                  />
                </div>

                {/* Sizing & Borders */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Padding</label>
                    <input
                      type="text"
                      value={padding}
                      onChange={(e) => setPadding(e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Border Radius</label>
                    <input
                      type="text"
                      value={borderRadius}
                      onChange={(e) => setBorderRadius(e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-7 h-7 border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-7 h-7 border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* JS Function Binding */}
                <div>
                  <label className="text-emerald-400 font-medium block mb-1">
                    Default JS Click Function Body
                  </label>
                  <textarea
                    rows={2}
                    value={customJsCode}
                    onChange={(e) => setCustomJsCode(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded font-mono text-xs text-emerald-300 outline-none"
                  />
                </div>
              </div>
            ) : (
              /* TAB 2: Raw HTML & Tailwind Snippet */
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <label className="text-slate-300 font-semibold block">
                  Paste or Write Custom HTML / Tailwind Snippet:
                </label>
                <textarea
                  rows={8}
                  value={htmlSnippet}
                  onChange={(e) => setHtmlSnippet(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-purple-200 leading-relaxed outline-none"
                />
              </div>
            )}
          </div>

          {/* Right Live Interactive Preview Box */}
          <div className="w-full md:w-96 bg-[#090d16] p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-800 relative select-none">
            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Eye size={14} className="text-purple-400" />
              <span>Live Visual Preview</span>
            </div>

            <div className="w-full max-w-sm flex items-center justify-center p-6 bg-slate-950/70 border border-slate-800/80 rounded-2xl shadow-inner min-h-[160px]">
              {activeTab === 'visual' ? (
                <div
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    padding,
                    borderRadius,
                    borderColor,
                    borderWidth,
                    borderStyle: 'solid',
                    fontSize,
                    fontWeight: fontWeight as any,
                    boxShadow,
                    display: baseType === 'button' || baseType === 'badge' ? 'inline-flex' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    width: baseType === 'button' || baseType === 'badge' ? 'auto' : '100%',
                    minHeight: baseType === 'card' ? '100px' : 'auto',
                  }}
                  className="transition-all active:scale-95"
                >
                  {baseType === 'card' ? (
                    <div className="flex flex-col gap-2 w-full">
                      <h4 className="font-bold text-sm text-inherit">{name}</h4>
                      <p className="text-xs opacity-80">{description}</p>
                    </div>
                  ) : (
                    <span>{label}</span>
                  )}
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{ __html: htmlSnippet }}
                  className="w-full overflow-hidden"
                />
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-4 text-center">
              This component will be added permanently to your Left Palette under the &ldquo;Custom&rdquo; shelf.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Icon: {selectedIcon} | Type: custom-{name.toLowerCase().replace(/[^a-z0-9]/g, '-')}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-500/40 text-xs font-semibold transition-colors"
            >
              <span>Save to Palette</span>
            </button>
            <button
              onClick={handleCreateAndAdd}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all active:scale-95"
            >
              <Check size={14} />
              <span>Save & Place on Canvas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
