import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Copy,
  Check,
  WrapText,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Code2,
} from 'lucide-react';

interface CodeEditorProps {
  initialCode: string;
  language: 'html' | 'css' | 'javascript' | 'typescript' | 'vue' | 'angular' | 'json';
  title?: string;
  maxHeight?: string;
  onCodeChange?: (newCode: string) => void;
  onApplyToCanvas?: (code: string) => { success: boolean; error?: string };
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode,
  language,
  title,
  maxHeight = 'calc(100vh - 240px)',
  onCodeChange,
  onApplyToCanvas,
}) => {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [isWrapText, setIsWrapText] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const lastCanvasCodeRef = useRef(initialCode);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external code updates (e.g., when switching files or when canvas changed from visual drag-and-drop)
  useEffect(() => {
    // Only update if external code genuinely changed from our last known canvas code
    if (initialCode !== lastCanvasCodeRef.current) {
      setCode(initialCode);
      lastCanvasCodeRef.current = initialCode;
      setSyncStatus('synced');
      setErrorMessage(null);
    }
  }, [initialCode]);

  // Synchronize scroll between line numbers gutter and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Track cursor position (Line & Column)
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = code.substring(0, pos);
    const lines = textBefore.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  // Apply code to canvas
  const applyChanges = useCallback(
    (codeToApply: string) => {
      if (!onApplyToCanvas) return;
      const result = onApplyToCanvas(codeToApply);
      if (result.success) {
        lastCanvasCodeRef.current = codeToApply;
        setSyncStatus('synced');
        setErrorMessage(null);
      } else {
        setSyncStatus('error');
        setErrorMessage(result.error || 'Parsing error');
      }
    },
    [onApplyToCanvas]
  );

  // Handle direct text typing / changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    setSyncStatus('pending');
    updateCursorPosition();
    if (onCodeChange) onCodeChange(val);

    // Auto-sync debouncing (450ms)
    if (autoSync && onApplyToCanvas) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        applyChanges(val);
      }, 450);
    }
  };

  // Manual Trigger: Force Sync to Canvas
  const handleManualSync = () => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    applyChanges(code);
  };

  // Reset to original Canvas code
  const handleReset = () => {
    setCode(initialCode);
    lastCanvasCodeRef.current = initialCode;
    setSyncStatus('synced');
    setErrorMessage(null);
    if (onCodeChange) onCodeChange(initialCode);
  };

  // Copy code to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard enhancements: Tab indentation, Shift+Tab outdent, Enter indent
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (!e.shiftKey) {
        // Tab: Insert 2 spaces
        const newCode = code.substring(0, start) + '  ' + code.substring(end);
        setCode(newCode);
        setSyncStatus('pending');
        if (onCodeChange) onCodeChange(newCode);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
          updateCursorPosition();
        }, 0);
      } else {
        // Shift + Tab: Outdent
        const linesBefore = code.substring(0, start).split('\n');
        const currentLineIdx = linesBefore.length - 1;
        const allLines = code.split('\n');
        const currentLine = allLines[currentLineIdx];

        if (currentLine.startsWith('  ')) {
          allLines[currentLineIdx] = currentLine.substring(2);
          const newCode = allLines.join('\n');
          setCode(newCode);
          setSyncStatus('pending');
          if (onCodeChange) onCodeChange(newCode);

          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(0, start - 2);
            updateCursorPosition();
          }, 0);
        }
      }
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      const start = textarea.selectionStart;
      const textBefore = code.substring(0, start);
      const currentLine = textBefore.split('\n').pop() || '';
      const match = currentLine.match(/^\s+/);
      const indent = match ? match[0] : '';

      // If previous line ends with '{', '(', '[', or '>'
      const extraIndent = /[{\(\[\>]$/.test(currentLine.trim()) ? '  ' : '';

      if (indent || extraIndent) {
        e.preventDefault();
        const insertText = '\n' + indent + extraIndent;
        const newCode = code.substring(0, start) + insertText + code.substring(textarea.selectionEnd);
        setCode(newCode);
        setSyncStatus('pending');
        if (onCodeChange) onCodeChange(newCode);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
          updateCursorPosition();
        }, 0);
      }
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-[#090d16] border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      {/* Top Editor Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/95 border-b border-slate-800 text-xs select-none">
        {/* File & Target Info */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Code2 size={13} className="text-blue-400 shrink-0" />
          <span
            title={title}
            className="font-mono font-medium text-slate-300 text-[11px] truncate max-w-[130px]"
          >
            {title || `${language}.ts`}
          </span>

          {/* Sync Status Badge (Icon with descriptive tooltip) */}
          {syncStatus === 'synced' && (
            <span
              title="Canvas Synced: Playground matches this code"
              className="p-1 rounded text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 cursor-pointer shrink-0"
            >
              <CheckCircle2 size={11} />
            </span>
          )}
          {syncStatus === 'pending' && (
            <span
              title="Syncing code edits to Canvas playground..."
              className="p-1 rounded text-amber-400 bg-amber-950/80 border border-amber-500/30 animate-pulse shrink-0"
            >
              <Sparkles size={11} />
            </span>
          )}
          {syncStatus === 'error' && (
            <span
              title={errorMessage || 'Syntax incomplete (Canvas preserved)'}
              className="p-1 rounded text-rose-400 bg-rose-950/80 border border-rose-500/30 cursor-help shrink-0"
            >
              <AlertTriangle size={11} />
            </span>
          )}
        </div>

        {/* Action Controls (Icons only with descriptive tooltips to prevent overflowing) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Manual Sync Button */}
          {onApplyToCanvas && (
            <button
              onClick={handleManualSync}
              title="Sync code edits to Canvas (⚡)"
              className="p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm active:scale-95 shrink-0"
            >
              <Zap size={12} className="fill-white" />
            </button>
          )}

          {/* Live Auto-Sync Toggle */}
          {onApplyToCanvas && (
            <button
              onClick={() => setAutoSync(!autoSync)}
              title={
                autoSync
                  ? 'Live Canvas Sync: ON (click to pause)'
                  : 'Live Canvas Sync: PAUSED (click to resume)'
              }
              className={`p-1.5 rounded transition-colors active:scale-95 border flex items-center justify-center shrink-0 ${
                autoSync
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full inline-block ${
                  autoSync ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
            </button>
          )}

          {/* Reset Code */}
          <button
            onClick={handleReset}
            title="Reset code to match canvas (revert code edits)"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors shrink-0 active:scale-95"
          >
            <RotateCcw size={12} />
          </button>

          {/* Wrap Toggle */}
          <button
            onClick={() => setIsWrapText(!isWrapText)}
            title={isWrapText ? 'Disable line wrap' : 'Enable line wrap'}
            className={`p-1.5 rounded transition-colors shrink-0 active:scale-95 ${
              isWrapText ? 'bg-blue-600/30 text-blue-300' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <WrapText size={12} />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard!' : 'Copy code to clipboard'}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors font-mono active:scale-95 shrink-0"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Editor Main Body */}
      <div
        className="flex-1 relative flex overflow-hidden font-mono text-xs leading-6"
        style={{ maxHeight }}
      >
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-10 select-none py-3 pr-2.5 text-right font-mono text-[11px] leading-6 text-slate-600 bg-[#070b12] border-r border-slate-800/80 overflow-hidden shrink-0"
        >
          {lineNumbers.map((num) => (
            <div
              key={num}
              className={`h-6 ${cursorPos.line === num ? 'text-blue-400 font-bold bg-blue-500/10' : ''}`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Editable Code Surface */}
        <div className="flex-1 relative h-full overflow-hidden bg-[#0a0e1a]">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onScroll={handleScroll}
            onClick={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={`w-full h-full p-3 bg-transparent text-slate-100 font-mono text-xs leading-6 outline-none resize-none scrollbar-thin select-text caret-blue-400 ${
              isWrapText ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
            }`}
            style={{
              tabSize: 2,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          />
        </div>
      </div>

      {/* Editor Bottom Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-950 border-t border-slate-800 text-[10px] font-mono text-slate-500 select-none">
        <div className="flex items-center gap-3">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>{lineCount} lines</span>
          <span>{code.length} chars</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium uppercase">{language}</span>
          <span className="text-slate-600">UTF-8</span>
          <span className="text-blue-400/80">Editable Studio</span>
        </div>
      </div>
    </div>
  );
};
