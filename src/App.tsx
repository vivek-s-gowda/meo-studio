import React, { useState, useEffect } from 'react';
import { BuilderProvider } from './context/BuilderContext';
import { BuilderStudio } from './components/studio/BuilderStudio';
import { LandingPage } from './components/landing/LandingPage';

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
        <BuilderStudio
          isElectron={isElectron}
          onNavigateToLanding={!isElectron ? navigateToLanding : undefined}
        />
      </BuilderProvider>
    );
  }

  // Otherwise on web root, render the interactive landing page
  return <LandingPage onTryNow={navigateToApp} />;
}
