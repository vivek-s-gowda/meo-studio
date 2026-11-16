import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Download,
  Play,
  Layers,
  Code2,
  Terminal,
  Monitor,
  Check,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Boxes,
  Zap,
  Globe,
  Database,
  Cpu,
  Apple,
  Copy,
  Laptop,
  Flame,
} from 'lucide-react';
import { detectUserPlatform, PlatformInfo, ALL_DOWNLOADS } from '../../utils/osDetector';

interface LandingPageProps {
  onTryNow: () => void;
}

export function LandingPage({ onTryNow }: LandingPageProps) {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>(detectUserPlatform());
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedDownloadId, setSelectedDownloadId] = useState<string>('mac-arm64');
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [activeFrameworkTab, setActiveFrameworkTab] = useState<'react' | 'vue' | 'angular' | 'html'>('react');
  
  // Interactive demo widget state
  const [demoScreen, setDemoScreen] = useState<'home' | 'dashboard'>('home');
  const [demoCounter, setDemoCounter] = useState(124);
  const [demoSearchQuery, setDemoSearchQuery] = useState('');
  const [demoActiveTab, setDemoActiveTab] = useState<'preview' | 'code'>('preview');

  // Detect OS on mount
  useEffect(() => {
    const detected = detectUserPlatform();
    setPlatformInfo(detected);
    if (detected.os === 'macos-arm64') setSelectedDownloadId('mac-arm64');
    else if (detected.os === 'macos-x64') setSelectedDownloadId('mac-x64');
    else if (detected.os === 'windows') setSelectedDownloadId('windows-nsis');
    else if (detected.os === 'linux') setSelectedDownloadId('linux-appimage');
  }, []);

  // Scroll animations observer
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleDownloadTrigger = (downloadId?: string) => {
    if (downloadId) setSelectedDownloadId(downloadId);
    setIsDownloadModalOpen(true);
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const selectedDownload = ALL_DOWNLOADS.find((d) => d.id === selectedDownloadId) || ALL_DOWNLOADS[0];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 relative overflow-hidden">
      {/* Background Neon Glow Orbs */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none animate-glow-pulse" />
      <div className="absolute top-[30%] right-[-10%] w-[650px] h-[650px] rounded-full bg-purple-600/12 blur-[160px] pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-[10%] left-[10%] w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[150px] pointer-events-none" />

      {/* Subtle Matrix Grid */}
      <div className="absolute inset-0 canvas-dots opacity-40 pointer-events-none" />

      {/* ------------------------------------------------------------- */}
      {/* 1. STICKY HEADER NAVBAR                                      */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-white/10 shrink-0">
              {/* Cat Paw SVG */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                <ellipse cx="6.3" cy="9.1" rx="1.5" ry="2.15" transform="rotate(-28 6.3 9.1)" />
                <ellipse cx="10.1" cy="6.8" rx="1.65" ry="2.35" transform="rotate(-9 10.1 6.8)" />
                <ellipse cx="13.9" cy="6.8" rx="1.65" ry="2.35" transform="rotate(9 13.9 6.8)" />
                <ellipse cx="17.7" cy="9.1" rx="1.5" ry="2.15" transform="rotate(28 17.7 9.1)" />
                <path d="M 12 12.2 C 11 11.2 8.7 11.2 7.5 12.8 C 6.3 14.3 6.7 16.4 8 18.2 C 9.4 19.8 14.6 19.8 16 18.2 C 17.3 16.4 17.7 14.3 16.5 12.8 C 15.3 11.2 13 11.2 12 12.2 Z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">Meo</span>
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
                v0.1.0-alpha
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#frameworks" className="hover:text-white transition-colors">Frameworks</a>
            <a href="#downloads" className="hover:text-white transition-colors">Downloads</a>
            <a href="#docker" className="hover:text-white transition-colors">Docker & Cloud</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownloadTrigger(platformInfo.os === 'macos-arm64' ? 'mac-arm64' : 'windows-nsis')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            >
              <Download size={14} className="text-blue-400" />
              <span>Desktop App</span>
            </button>

            <button
              onClick={onTryNow}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 border border-white/10 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Sparkles size={14} />
              <span>Try Now (Free)</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION WITH DUAL CTAS & OS DOWNLOAD                 */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-16 pb-20 px-4 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-8 shadow-inner shadow-indigo-500/20 animate-float-slow">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>🐾 Introducing Meo Studio v0.1.0-alpha • Visual UI Engine</span>
          <ArrowRight size={12} className="text-indigo-400" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Design Visually.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Compile to Clean Code.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          The next-generation visual UI studio and framework scaffolder. Construct interfaces visually with drag-and-drop, link multi-screen routes, bind live mock APIs, and compile production-ready code in{' '}
          <strong className="text-slate-200">React (TSX)</strong>, <strong className="text-slate-200">Vue 3</strong>,{' '}
          <strong className="text-slate-200">Angular 17+</strong>, or <strong className="text-slate-200">HTML5/CSS</strong>.
        </p>

        {/* Dual Primary CTAs: Try Now + Smart OS Download */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-xl mb-8">
          {/* 1. Try Now Button */}
          <button
            onClick={onTryNow}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-500/30 border border-white/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 group"
          >
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            <span>Try Now in Browser</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 2. Smart OS Detected Download Button */}
          <button
            onClick={() => handleDownloadTrigger()}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/90 text-white font-bold text-base shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
          >
            {platformInfo.iconType === 'apple' && <Apple size={20} className="text-slate-100" />}
            {platformInfo.iconType === 'windows' && <Monitor size={20} className="text-sky-400" />}
            {platformInfo.iconType === 'linux' && <Terminal size={20} className="text-amber-400" />}
            <div className="text-left">
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>{platformInfo.recommendedLabel}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                {platformInfo.architecture} • .dmg / .exe / .AppImage
              </div>
            </div>
            <Download size={16} className="text-slate-400 ml-1" />
          </button>
        </div>

        {/* Subdomain & Direct Access Hint */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 font-mono">
          <span>Web studio live at</span>
          <span
            onClick={onTryNow}
            className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 cursor-pointer hover:underline"
          >
            /app
          </span>
          <span>or custom subdomain</span>
          <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            app.yourdomain.com
          </span>
        </div>

        {/* Tech Stack Supported Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-12 pt-8 border-t border-slate-800/80 w-full max-w-4xl text-xs text-slate-400 font-medium">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Compiles To:</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-sky-400 font-mono">⚛️ React 18+ TSX</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 font-mono">💚 Vue 3 SFC</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-rose-400 font-mono">🅰️ Angular 17+ Standalone</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-400 font-mono">🌐 HTML5 / CSS / JS</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-indigo-400 font-mono">🐳 Docker</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-purple-400 font-mono">⚡ Electron 33</span>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. INTERACTIVE STUDIO PREVIEW / PLAYGROUND WIDGET           */}
      {/* ------------------------------------------------------------- */}
      <section id="demo" className="py-12 px-4 lg:px-8 max-w-6xl mx-auto w-full z-10" data-reveal>
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Experience Meo Studio in Action
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Interact with the live simulator below: toggle between screens, click components to test state, or inspect compiled code.
          </p>
        </div>

        {/* Simulator Frame */}
        <div className="rounded-2xl glass-panel-glow border border-slate-700/80 overflow-hidden shadow-2xl">
          {/* Browser Window Titlebar */}
          <div className="h-10 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">meo-studio-live-canvas // {demoScreen === 'home' ? 'Home (Route: /)' : 'Dashboard (Route: /dashboard)'}</span>
            </div>

            {/* Toggle Preview / Code View */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setDemoActiveTab('preview')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  demoActiveTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Visual Canvas
              </button>
              <button
                onClick={() => setDemoActiveTab('code')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  demoActiveTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Compiled Code
              </button>
            </div>

            <button
              onClick={onTryNow}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Open Full Studio</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* Simulator Content Area */}
          {demoActiveTab === 'preview' ? (
            <div className="p-6 sm:p-8 bg-[#0b0f19] min-h-[420px] flex flex-col justify-between">
              {/* Screen Router Bar */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">ACTIVE SCREEN:</span>
                  <button
                    onClick={() => setDemoScreen('home')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      demoScreen === 'home' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    1. Home / Login (/)
                  </button>
                  <button
                    onClick={() => setDemoScreen('dashboard')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      demoScreen === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    2. User Dashboard (/dashboard)
                  </button>
                </div>

                <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>⚡ Interactive Preview Active</span>
                </div>
              </div>

              {/* Dynamic Screen View */}
              {demoScreen === 'home' ? (
                <div className="max-w-md mx-auto w-full p-6 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl my-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Sign In to Workspace</h3>
                      <p className="text-xs text-slate-400">Clicking sign in routes to dashboard</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        defaultValue="alex.dev@meostudio.dev"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                      <input
                        type="password"
                        defaultValue="••••••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setDemoScreen('dashboard')}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    <span>Sign In & Navigate →</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-5 my-auto">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400 mb-1">Active Cloud Users</div>
                      <div className="text-2xl font-black text-white">{demoCounter}</div>
                      <div className="text-[11px] text-emerald-400 mt-1">+14% this week</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400 mb-1">Compiled Components</div>
                      <div className="text-2xl font-black text-white">48</div>
                      <div className="text-[11px] text-blue-400 mt-1">Modular Architecture</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                      <div className="text-xs text-slate-400">Live State Mutation</div>
                      <button
                        onClick={() => setDemoCounter((c) => c + 1)}
                        className="mt-2 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                        <Zap size={13} />
                        <span>Increment Counter (+1)</span>
                      </button>
                    </div>
                  </div>

                  {/* Mock Table */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold text-white">Live Data Source: ds-users</div>
                      <input
                        type="text"
                        placeholder="Filter users..."
                        value={demoSearchQuery}
                        onChange={(e) => setDemoSearchQuery(e.target.value)}
                        className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div className="overflow-x-auto text-xs font-mono text-slate-300">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="py-1.5">ID</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-800/60">
                            <td className="py-2 text-slate-400">#usr-01</td>
                            <td className="font-semibold text-white">Sarah Connor</td>
                            <td className="text-blue-400">Lead Architect</td>
                            <td><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">Active</span></td>
                          </tr>
                          <tr>
                            <td className="py-2 text-slate-400">#usr-02</td>
                            <td className="font-semibold text-white">John Matrix</td>
                            <td className="text-purple-400">UI Engineer</td>
                            <td><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">Active</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => setDemoScreen('home')}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      ← Back to Home / Login Screen
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Canvas Toolbar */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Canvas viewport: 100% Desktop (Responsive)</span>
                <span className="text-slate-400">Bi-directional code sync active</span>
              </div>
            </div>
          ) : (
            /* Code View Tab */
            <div className="p-6 bg-slate-950 min-h-[420px] font-mono text-xs text-slate-300 overflow-x-auto">
              <div className="text-slate-500 mb-2">// Auto-compiled from Meo Canvas: src/App.tsx</div>
              <pre className="text-slate-300 leading-relaxed">
{`import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { HomeScreen } from './pages/HomeScreen';
import { DashboardScreen } from './pages/DashboardScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
      </Routes>
    </BrowserRouter>
  );
}`}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. SCROLL ANIMATED FEATURE CARDS                            */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto z-10" data-reveal>
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            ENGINE CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 mb-4">
            Built for Modern Frontend Engineers
          </h2>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Everything you need to go from visual design to production-ready enterprise codebases in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-7 rounded-2xl glass-panel hover:glass-panel-glow border border-slate-800 hover:border-blue-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Boxes size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Modular "Componentize" Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Instantly decompose your canvas into clean, reusable components in <code className="text-blue-300">src/components/</code> and page views in <code className="text-blue-300">src/pages/</code>.
            </p>
            <div className="text-xs font-mono text-blue-400 flex items-center gap-1">
              <span>Full folder scaffolding</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-2xl glass-panel hover:glass-panel-glow border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Code2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Bi-Directional Code Studio</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Full in-browser code editor with debounced 450ms live synchronization. Changes in JSX or HTML instantly update the visual canvas with zero syntax lag.
            </p>
            <div className="text-xs font-mono text-indigo-400 flex items-center gap-1">
              <span>Two-way canvas sync</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-2xl glass-panel hover:glass-panel-glow border border-slate-800 hover:border-purple-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Play size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Screen & Route Linking</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Create unlimited screens with custom names and paths (<code className="text-purple-300">/</code>, <code className="text-purple-300">/dashboard</code>). Wire buttons to route between screens live in preview mode.
            </p>
            <div className="text-xs font-mono text-purple-400 flex items-center gap-1">
              <span>React, Vue & Angular routing</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-2xl glass-panel hover:glass-panel-glow border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Database size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Mock APIs & Schema Inspector</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Bind live datasets to Material Data Tables with dynamic search, sorting, and pagination. Powered by an Express mock REST API on port 5001.
            </p>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span>Dynamic schema models</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-7 rounded-2xl glass-panel hover:glass-panel-glow border border-slate-800 hover:border-amber-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Laptop size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Native Desktop App (Electron)</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Packaged with Electron 33+ for offline productivity. Includes native Apple Silicon (arm64), Universal Mac, Windows (.exe), and Linux binaries.
            </p>
            <div className="text-xs font-mono text-amber-400 flex items-center gap-1">
              <span>Optimized for Apple M-series</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-7 rounded-2xl glass-panel hover:glass-panel-glow border border-slate-800 hover:border-sky-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all">
              <Terminal size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Production Docker & Cloud</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Pre-configured multi-stage Nginx 1.27 Alpine runtime and Docker Compose multi-service stack. 1-command deployment anywhere.
            </p>
            <div className="text-xs font-mono text-sky-400 flex items-center gap-1">
              <span>docker compose up -d</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. MULTI-FRAMEWORK CODE EXPORT MATRIX                        */}
      {/* ------------------------------------------------------------- */}
      <section id="frameworks" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto z-10" data-reveal>
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            FRAMEWORK INDEPENDENCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 mb-4">
            Zero Vendor Lock-in. Real Production Code.
          </h2>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Design once visually. Export directly to the architecture your engineering team already uses.
          </p>
        </div>

        {/* Framework Selector Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveFrameworkTab('react')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeFrameworkTab === 'react'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ⚛️ React 18+ (TSX)
          </button>
          <button
            onClick={() => setActiveFrameworkTab('vue')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeFrameworkTab === 'vue'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/30'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            💚 Vue 3 (SFC)
          </button>
          <button
            onClick={() => setActiveFrameworkTab('angular')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeFrameworkTab === 'angular'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25 border border-rose-400/30'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🅰️ Angular 17+ (Standalone)
          </button>
          <button
            onClick={() => setActiveFrameworkTab('html')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeFrameworkTab === 'html'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25 border border-amber-400/30'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🌐 HTML5 / CSS3 / JS
          </button>
        </div>

        {/* Tab Code & Architecture Showcase */}
        <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              {activeFrameworkTab === 'react' && 'Export Folder Architecture: React 18 + Vite + Tailwind + React Router'}
              {activeFrameworkTab === 'vue' && 'Export Folder Architecture: Vue 3 Single File Components + Vue Router'}
              {activeFrameworkTab === 'angular' && 'Export Folder Architecture: Angular 17 Standalone Components'}
              {activeFrameworkTab === 'html' && 'Export Folder Architecture: Vanilla HTML5 + Responsive CSS + Clean JS'}
            </span>
            <button
              onClick={onTryNow}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Export this in Studio →
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {/* Scaffolding Directory Tree */}
            <div className="p-6 font-mono text-xs text-slate-300 space-y-1.5 bg-[#090d18]">
              <div className="text-slate-500 mb-2 font-bold uppercase tracking-wider text-[10px]">📁 Generated Project Tree:</div>
              <div>meo-project/</div>
              <div>├── package.json</div>
              <div>├── vite.config.ts</div>
              <div>├── tailwind.config.js</div>
              <div>├── src/</div>
              <div className="text-blue-400 pl-4">├── components/</div>
              <div className="text-slate-400 pl-8">├── Navbar.tsx</div>
              <div className="text-slate-400 pl-8">├── UserCard.tsx</div>
              <div className="text-slate-400 pl-8">├── DataTable.tsx</div>
              <div className="text-purple-400 pl-4">├── pages/</div>
              <div className="text-slate-400 pl-8">├── HomeScreen.tsx</div>
              <div className="text-slate-400 pl-8">├── DashboardScreen.tsx</div>
              <div className="text-emerald-400 pl-4">├── data/</div>
              <div className="text-slate-400 pl-8">└── mockData.json</div>
              <div className="pl-4">└── App.tsx (Router configured)</div>
            </div>

            {/* Code Snippet */}
            <div className="lg:col-span-2 p-6 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto">
              <pre className="text-slate-300 leading-relaxed">
{activeFrameworkTab === 'react' && `// src/components/UserCard.tsx (Generated by Meo)
import React from 'react';

export interface UserCardProps {
  name: string;
  role: string;
  onSelect?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ name, role, onSelect }) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-colors">
      <h4 className="text-sm font-bold text-white">{name}</h4>
      <p className="text-xs text-slate-400">{role}</p>
      <button onClick={onSelect} className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium">
        View Profile
      </button>
    </div>
  );
};`}

{activeFrameworkTab === 'vue' && `<!-- src/components/UserCard.vue (Generated by Meo) -->
<script setup lang="ts">
defineProps<{
  name: string
  role: string
}>()

const emit = defineEmits<{
  (e: 'select'): void
}>()
</script>

<template>
  <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors">
    <h4 class="text-sm font-bold text-white">{{ name }}</h4>
    <p class="text-xs text-slate-400">{{ role }}</p>
    <button @click="emit('select')" class="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium">
      View Profile
    </button>
  </div>
</template>`}

{activeFrameworkTab === 'angular' && `// src/components/user-card.component.ts (Generated by Meo)
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-colors">
      <h4 class="text-sm font-bold text-white">{{ name }}</h4>
      <p class="text-xs text-slate-400">{{ role }}</p>
      <button (click)="select.emit()" class="mt-3 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium">
        View Profile
      </button>
    </div>
  \`
})
export class UserCardComponent {
  @Input() name: string = '';
  @Input() role: string = '';
  @Output() select = new EventEmitter<void>();
}`}

{activeFrameworkTab === 'html' && `<!-- Component Template: User Card (Generated by Meo) -->
<div class="user-card-box">
  <h4 class="user-name">Sarah Connor</h4>
  <p class="user-role">Lead Architect</p>
  <button class="btn-primary" onclick="alert('Viewing Profile')">
    View Profile
  </button>
</div>`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. DESKTOP DOWNLOADS & OPERATING SYSTEM MATRIX               */}
      {/* ------------------------------------------------------------- */}
      <section id="downloads" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto z-10" data-reveal>
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            NATIVE DESKTOP APPS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 mb-4">
            Download Meo Studio for Your OS
          </h2>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Experience maximum performance and complete offline capability on macOS, Windows, and Linux.
          </p>
        </div>

        {/* Downloads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {ALL_DOWNLOADS.map((dl) => {
            const isDetected = dl.id === (
              platformInfo.os === 'macos-arm64' ? 'mac-arm64' :
              platformInfo.os === 'macos-x64' ? 'mac-x64' :
              platformInfo.os === 'windows' ? 'windows-nsis' : 'linux-appimage'
            );

            return (
              <div
                key={dl.id}
                className={`p-6 rounded-2xl glass-panel border transition-all duration-300 relative ${
                  isDetected
                    ? 'border-blue-500/80 shadow-xl shadow-blue-500/15 bg-slate-900/90'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {isDetected && (
                  <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-md">
                    Recommended for Your System
                  </span>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white">
                      {dl.icon === 'apple' && <Apple size={20} />}
                      {dl.icon === 'windows' && <Monitor size={20} className="text-sky-400" />}
                      {dl.icon === 'linux' && <Terminal size={20} className="text-amber-400" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{dl.platform}</h3>
                      <span className="text-xs text-indigo-400 font-mono">{dl.badge}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{dl.size}</span>
                </div>

                <div className="text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-5 break-all">
                  {dl.fileName}
                </div>

                <button
                  onClick={() => handleDownloadTrigger(dl.id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isDetected
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 active:scale-95'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95'
                  }`}
                >
                  <Download size={14} />
                  <span>Download Installer</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. DOCKER & CLOUD WORKFLOWS                                  */}
      {/* ------------------------------------------------------------- */}
      <section id="docker" className="py-16 px-4 lg:px-8 max-w-5xl mx-auto w-full z-10" data-reveal>
        <div className="p-8 rounded-2xl glass-panel-glow border border-slate-700/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div>
              <span className="text-xs font-mono text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                CONTAINERIZED DEPLOYMENT
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-3 mb-1">Run Meo Studio with Docker</h3>
              <p className="text-sm text-slate-400">
                Deploy the complete studio as an Nginx Alpine container in one line.
              </p>
            </div>

            <button
              onClick={() => handleCopyCommand('docker run -d -p 3000:80 --name meo-studio meo')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2 shrink-0 transition-colors"
            >
              {copiedCommand ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedCommand ? 'Copied Command!' : 'Copy Docker Command'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
            <div className="text-slate-500 mb-1"># Single command deployment on port 3000:</div>
            <div className="text-sky-300 font-bold">
              docker run -d -p 3000:80 --name meo-studio meo
            </div>
            <div className="text-slate-500 mt-3 mb-1"># Full-stack multi-service orchestration (Web + API + Python AST):</div>
            <div className="text-indigo-300 font-bold">
              docker compose up -d --build
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. BOTTOM HERO CTA BANNER                                    */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 px-4 lg:px-8 max-w-5xl mx-auto w-full text-center z-10" data-reveal>
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-blue-950/60 via-indigo-950/40 to-purple-950/60 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Start Designing in Meo Studio
          </h2>
          <p className="text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            No signup required. Launch the web studio instantly or package native desktop binaries for your platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onTryNow}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-500/30 border border-white/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Sparkles size={18} />
              <span>Launch Studio (Web /app)</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => handleDownloadTrigger()}
              className="px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-base transition-all"
            >
              <span>Download Desktop Apps</span>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. FOOTER                                                    */}
      {/* ------------------------------------------------------------- */}
      <footer className="w-full border-t border-slate-800/80 py-10 px-4 lg:px-8 mt-auto z-10 glass-panel">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white text-white">
                <ellipse cx="6.3" cy="9.1" rx="1.5" ry="2.15" transform="rotate(-28 6.3 9.1)" />
                <ellipse cx="10.1" cy="6.8" rx="1.65" ry="2.35" transform="rotate(-9 10.1 6.8)" />
                <ellipse cx="13.9" cy="6.8" rx="1.65" ry="2.35" transform="rotate(9 13.9 6.8)" />
                <ellipse cx="17.7" cy="9.1" rx="1.5" ry="2.15" transform="rotate(28 17.7 9.1)" />
                <path d="M 12 12.2 C 11 11.2 8.7 11.2 7.5 12.8 C 6.3 14.3 6.7 16.4 8 18.2 C 9.4 19.8 14.6 19.8 16 18.2 C 17.3 16.4 17.7 14.3 16.5 12.8 C 15.3 11.2 13 11.2 12 12.2 Z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">Meo Studio</span>
            <span className="text-xs text-slate-500 font-mono">v0.1.0-alpha • MIT Licensed</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#downloads" className="hover:text-white transition-colors">Downloads</a>
            <button onClick={onTryNow} className="text-blue-400 hover:text-blue-300 font-semibold">
              Open Studio (/app)
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Designed with ❤️ for modern frontend developers.
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* 10. DOWNLOAD INSTRUCTIONS MODAL                              */}
      {/* ------------------------------------------------------------- */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Download size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Download Meo Studio</h3>
                  <p className="text-xs text-slate-400">{selectedDownload.platform} ({selectedDownload.badge})</p>
                </div>
              </div>
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Target File:</span>
                  <span className="text-blue-400 font-bold">{selectedDownload.fileName}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Format / Arch:</span>
                  <span className="text-slate-300">{selectedDownload.format}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Approx. Size:</span>
                  <span className="text-slate-300">{selectedDownload.size}</span>
                </div>
              </div>

              {/* Terminal Quick Launch Helper */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Terminal Installation / Launch Command:
                </label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                  <span className="truncate pr-2">{selectedDownload.command}</span>
                  <button
                    onClick={() => handleCopyCommand(selectedDownload.command)}
                    className="p-1 rounded hover:bg-slate-800 text-blue-400 hover:text-blue-300 shrink-0"
                    title="Copy command"
                  >
                    {copiedCommand ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Direct Binary Link Simulation */}
              <div className="pt-2">
                <a
                  href={`/downloads/${selectedDownload.fileName}`}
                  download={selectedDownload.fileName}
                  onClick={(e) => {
                    // Provide helpful notification if running locally without packaged dist
                    alert(`Initiating download for ${selectedDownload.fileName}. If building from source, run 'npm run electron:mac' to generate installers.`);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <Download size={14} />
                  <span>Start Direct Download</span>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
              <button
                onClick={() => {
                  setIsDownloadModalOpen(false);
                  onTryNow();
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Or launch instantly in browser without installing →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
