import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SyntaxHighlighterProps {
  code: string;
  language: 'html' | 'css' | 'javascript' | 'typescript' | 'vue' | 'angular' | 'json';
  title?: string;
  maxHeight?: string;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language,
  title,
  maxHeight = '480px',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Schematic syntax highlighter using regex tokenization
  const formatHighlightedCode = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, index) => {
      // Token replacements
      let highlighted = line
        // Comments
        .replace(/(\/\*[\s\S]*?\*\/|\/\/[^\n]*|<!--[\s\S]*?-->)/g, '<span class="text-slate-500 italic">$1</span>')
        // Strings (double, single, backticks)
        .replace(/(["'`])(.*?)\1/g, '<span class="text-emerald-400">$1$2$1</span>')
        // HTML / JSX Tags
        .replace(/(&lt;[\/]?[a-zA-Z0-9_-]+|&gt;|<[\/]?[a-zA-Z0-9_-]+|>)/g, '<span class="text-rose-400 font-semibold">$1</span>')
        // Keywords
        .replace(
          /\b(import|export|default|from|function|const|let|var|return|if|else|switch|case|class|interface|type|extends|implements|new|async|await|ref|computed|standalone|selector|template|styles)\b/g,
          '<span class="text-purple-400 font-medium">$1</span>'
        )
        // Built-ins & Types
        .replace(/\b(React|useState|useEffect|useCallback|useMemo|document|window|console|string|number|boolean|any|void)\b/g, '<span class="text-sky-300 font-medium">$1</span>')
        // Attributes / Properties
        .replace(/\b([a-zA-Z-]+)(?==["'{])/g, '<span class="text-amber-300">$1</span>')
        // CSS properties
        .replace(/([a-zA-Z-]+)(?=:)/g, '<span class="text-cyan-400">$1</span>')
        // Numbers & Booleans
        .replace(/\b(true|false|null|undefined|\d+(\.\d+)?(px|rem|%|ms|s)?)\b/g, '<span class="text-orange-400">$1</span>');

      return (
        <div key={index} className="flex leading-6 font-mono text-xs hover:bg-slate-800/40">
          <span className="w-9 select-none text-right pr-4 text-slate-600 font-mono text-[11px]">{index + 1}</span>
          <span className="flex-1 text-slate-200 whitespace-pre overflow-x-auto" dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col bg-[#090d16] border border-slate-800 rounded-lg overflow-hidden shadow-inner">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          <span className="uppercase tracking-wider font-mono text-[11px]">{title || language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-mono active:scale-95"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div
        className="p-3 overflow-auto font-mono text-xs scrollbar-thin"
        style={{ maxHeight }}
      >
        {formatHighlightedCode(code)}
      </div>
    </div>
  );
};
