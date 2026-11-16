import React, { useState } from 'react';
import { BuilderProvider } from './context/BuilderContext';
import { TopNav } from './components/layout/TopNav';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { Canvas } from './components/canvas/Canvas';
import { RightSidebar } from './components/layout/RightSidebar';
import { ScaffoldModal } from './components/modals/ScaffoldModal';
import { AIAssistantModal } from './components/modals/AIAssistantModal';
import { TemplatesModal } from './components/modals/TemplatesModal';
import { CreateCustomComponentModal } from './components/modals/CreateCustomComponentModal';
import { DataSourcesModal } from './components/modals/DataSourcesModal';
import { useBuilder } from './context/BuilderContext';

function BuilderStudio() {
  const { isCreateComponentOpen, setIsCreateComponentOpen, isDataSourcesModalOpen, setIsDataSourcesModalOpen } = useBuilder();
  const [isScaffoldOpen, setIsScaffoldOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0f19] text-slate-100 font-sans">
      {/* Top Bar with Language Selector & Controls */}
      <TopNav
        onOpenScaffoldModal={() => setIsScaffoldOpen(true)}
        onOpenAIModal={() => setIsAIOpen(true)}
        onOpenTemplatesModal={() => setIsTemplatesOpen(true)}
      />

      {/* Main Studio Body: Left Sidebar + Canvas Playground + Right Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Material UI Controls Palette */}
        <LeftSidebar />

        {/* Center: Interactive Playground Canvas */}
        <Canvas />

        {/* Right: Component Structure Tree & Multi-Language Code Inspector */}
        <RightSidebar />
      </div>

      {/* Modals */}
      <ScaffoldModal isOpen={isScaffoldOpen} onClose={() => setIsScaffoldOpen(false)} />
      <AIAssistantModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <TemplatesModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} />
      <CreateCustomComponentModal
        isOpen={isCreateComponentOpen}
        onClose={() => setIsCreateComponentOpen(false)}
      />
      <DataSourcesModal
        isOpen={isDataSourcesModalOpen}
        onClose={() => setIsDataSourcesModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BuilderProvider>
      <BuilderStudio />
    </BuilderProvider>
  );
}
