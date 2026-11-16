import React, { useState } from 'react';
import { TopNav } from '../layout/TopNav';
import { LeftSidebar } from '../layout/LeftSidebar';
import { Canvas } from '../canvas/Canvas';
import { RightSidebar } from '../layout/RightSidebar';
import { ScaffoldModal } from '../modals/ScaffoldModal';
import { AIAssistantModal } from '../modals/AIAssistantModal';
import { TemplatesModal } from '../modals/TemplatesModal';
import { CreateCustomComponentModal } from '../modals/CreateCustomComponentModal';
import { DataSourcesModal } from '../modals/DataSourcesModal';
import { useBuilder } from '../../context/BuilderContext';

interface BuilderStudioProps {
  isElectron?: boolean;
  onNavigateToLanding?: () => void;
}

export function BuilderStudio({ isElectron = false, onNavigateToLanding }: BuilderStudioProps) {
  const {
    isCreateComponentOpen,
    setIsCreateComponentOpen,
    isDataSourcesModalOpen,
    setIsDataSourcesModalOpen,
  } = useBuilder();

  const [isScaffoldOpen, setIsScaffoldOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0f19] text-slate-100 font-sans select-none">
      {/* Top Bar with Language Selector & Controls */}
      <TopNav
        onOpenScaffoldModal={() => setIsScaffoldOpen(true)}
        onOpenAIModal={() => setIsAIOpen(true)}
        onOpenTemplatesModal={() => setIsTemplatesOpen(true)}
        onNavigateToLanding={!isElectron ? onNavigateToLanding : undefined}
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
