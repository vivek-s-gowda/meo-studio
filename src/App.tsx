import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BuilderProvider } from './context/BuilderContext';

// Dynamic code-splitting: Landing page and core studio are partitioned into separate bundles
const BuilderStudio = lazy(() =>
  import('./components/studio/BuilderStudio').then((m) => ({ default: m.BuilderStudio }))
);
const LandingPage = lazy(() =>
  import('./components/landing/LandingPage').then((m) => ({ default: m.LandingPage }))
);

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#070b14] text-slate-100 select-none">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center animate-pulse mb-3 shadow-lg shadow-indigo-500/30">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white text-white">
          <ellipse cx="6.3" cy="9.1" rx="1.5" ry="2.15" transform="rotate(-28 6.3 9.1)" />
          <ellipse cx="10.1" cy="6.8" rx="1.65" ry="2.35" transform="rotate(-9 10.1 6.8)" />
          <ellipse cx="13.9" cy="6.8" rx="1.65" ry="2.35" transform="rotate(9 13.9 6.8)" />
          <ellipse cx="17.7" cy="9.1" rx="1.5" ry="2.15" transform="rotate(28 17.7 9.1)" />
          <path d="M 12 12.2 C 11 11.2 8.7 11.2 7.5 12.8 C 6.3 14.3 6.7 16.4 8 18.2 C 9.4 19.8 14.6 19.8 16 18.2 C 17.3 16.4 17.7 14.3 16.5 12.8 C 15.3 11.2 13 11.2 12 12.2 Z" />
        </svg>
      </div>
      <div className="text-xs font-mono text-slate-400">Loading Meo Studio...</div>
    </div>
  );
}

function detectInitialView(): 'app' | 'landing' {
  if (typeof window === 'undefined') return 'landing';

  // 1. Check if running inside Electron Desktop App
  const isElectron = Boolean(
    (window as any).electronAPI?.isElectron ||
    navigator.userAgent.includes('Electron')
  );
  if (isElectron) {
    return 'app';
  }

  // 2. Check subdomain: app.xxx.xx (e.g. app.meo.dev, app.localhost)
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.startsWith('app.')) {
    return 'app';
  }

  // 3. Check path route: /app or /app/...
  const pathname = window.location.pathname.toLowerCase();
  if (pathname === '/app' || pathname.startsWith('/app/')) {
    return 'app';
  }

  // 4. Check URL hash: #app or #/app
  const hash = window.location.hash.toLowerCase();
  if (hash === '#app' || hash === '#/app' || hash.startsWith('#/app/')) {
    return 'app';
  }

  // 5. Default to interactive landing page on web root /
  return 'landing';
}

export default function App() {
  const [currentView, setCurrentView] = useState<'app' | 'landing'>(detectInitialView);

  const isElectron = typeof window !== 'undefined' && Boolean(
    (window as any).electronAPI?.isElectron ||
    navigator.userAgent.includes('Electron')
  );

  // Synchronize browser history & popstate
  useEffect(() => {
    if (isElectron) return;

    const handleLocationChange = () => {
      setCurrentView(detectInitialView());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [isElectron]);

  const navigateToApp = () => {
    try {
      window.history.pushState({}, '', '/app');
    } catch (e) {
      window.location.hash = '/app';
    }
    setCurrentView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLanding = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch (e) {
      window.location.hash = '';
    }
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Electron, directly render the Builder Studio - NEVER load the landing page
  if (isElectron || currentView === 'app') {
    return (
      <BuilderProvider>
        <Suspense fallback={<LoadingFallback />}>
          <BuilderStudio
            isElectron={isElectron}
            onNavigateToLanding={!isElectron ? navigateToLanding : undefined}
          />
        </Suspense>
      </BuilderProvider>
    );
  }

  // Otherwise on web root, render the interactive landing page
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LandingPage onTryNow={navigateToApp} />
    </Suspense>
  );
}
