import { FlexComponent, Screen, DataSource } from '../types';
import { generateReactCode, generateReactMultiRouter } from './codeGenerators/reactGenerator';
import { generateVueCode } from './codeGenerators/vueGenerator';
import { generateAngularCode } from './codeGenerators/angularGenerator';

export function toPascalCase(str: string): string {
  if (!str) return 'Component';
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function toKebabCase(str: string): string {
  if (!str) return 'component';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

export interface DecomposedComponent {
  id: string;
  rawName: string;
  pascalName: string; // e.g. "HeaderBar"
  kebabName: string; // e.g. "header-bar"
  component: FlexComponent;
  screenId: string;
  screenName: string;
}

export interface DecomposedScreen {
  id: string;
  name: string;
  route: string;
  pascalName: string; // e.g. "Dashboard"
  screenPascalName: string; // e.g. "DashboardScreen"
  kebabName: string; // e.g. "dashboard"
  components: DecomposedComponent[];
}

export interface DecomposedProject {
  screens: DecomposedScreen[];
  allComponents: DecomposedComponent[];
}

/**
 * Decomposes all screens into modular components & screens
 */
export function decomposeScreens(screens: Screen[]): DecomposedProject {
  const usedNames = new Set<string>();
  const allComponents: DecomposedComponent[] = [];

  const decomposedScreens: DecomposedScreen[] = screens.map((screen) => {
    const screenBase = toPascalCase(screen.name);
    const screenPascalName = screenBase.endsWith('Screen') ? screenBase : `${screenBase}Screen`;
    const screenKebab = toKebabCase(screen.name);

    const screenComponents: DecomposedComponent[] = screen.components.map((comp) => {
      let baseName = toPascalCase(comp.name || comp.type);
      if (baseName.length < 2) baseName = `Component_${comp.type}`;

      // Deduplicate component names
      let uniqueName = baseName;
      let counter = 1;
      while (usedNames.has(uniqueName)) {
        uniqueName = `${baseName}_${counter++}`;
      }
      usedNames.add(uniqueName);

      const decomp: DecomposedComponent = {
        id: comp.id,
        rawName: comp.name || comp.type,
        pascalName: uniqueName,
        kebabName: toKebabCase(uniqueName),
        component: comp,
        screenId: screen.id,
        screenName: screen.name,
      };

      allComponents.push(decomp);
      return decomp;
    });

    return {
      id: screen.id,
      name: screen.name,
      route: screen.route.startsWith('/') ? screen.route : `/${screen.route}`,
      pascalName: screenBase,
      screenPascalName,
      kebabName: screenKebab,
      components: screenComponents,
    };
  });

  return {
    screens: decomposedScreens,
    allComponents,
  };
}

// ----------------------------------------------------
// REACT MODULAR GENERATORS
// ----------------------------------------------------

export function generateModularReactScreen(
  decompScreen: DecomposedScreen,
  allScreens: Screen[]
): string {
  const imports = decompScreen.components
    .map((c) => `import ${c.pascalName} from '../components/${c.pascalName}';`)
    .join('\n');

  const componentTags = decompScreen.components.map((c) => `      <${c.pascalName} />`).join('\n');

  return `import React from 'react';
${imports}

export default function ${decompScreen.screenPascalName}() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-4 max-w-5xl mx-auto">
      {/* Modular Components */}
${componentTags}
    </div>
  );
}
`;
}

// ----------------------------------------------------
// VUE 3 MODULAR GENERATORS
// ----------------------------------------------------

export function generateModularVueScreen(decompScreen: DecomposedScreen): string {
  const imports = decompScreen.components
    .map((c) => `import ${c.pascalName} from '../components/${c.pascalName}.vue';`)
    .join('\n');

  const componentTags = decompScreen.components.map((c) => `    <${c.pascalName} />`).join('\n');

  return `<script setup lang="ts">
${imports}
</script>

<template>
  <main class="page-container">
${componentTags}
  </main>
</template>

<style scoped>
.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #f8fafc;
}
</style>
`;
}

export function generateModularVueRouter(decompScreens: DecomposedScreen[]): string {
  const imports = decompScreens
    .map((s) => `import ${s.pascalName}View from '../views/${s.pascalName}View.vue';`)
    .join('\n');

  const routeDefs = decompScreens
    .map(
      (s) => `    {
      path: '${s.route}',
      name: '${s.pascalName}',
      component: ${s.pascalName}View,
    },`
    )
    .join('\n');

  return `import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
${imports}

const routes: Array<RouteRecordRaw> = [
${routeDefs}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
`;
}

export function generateModularVueApp(_decompScreens: DecomposedScreen[]): string {
  return `<script setup lang="ts">
// Application Root Router View
</script>

<template>
  <div class="app-root">
    <router-view />
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  background-color: #0b0f19;
  color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
`;
}

// ----------------------------------------------------
// ANGULAR 17+ MODULAR GENERATORS
// ----------------------------------------------------

export function generateModularAngularScreen(decompScreen: DecomposedScreen): string {
  const imports = decompScreen.components
    .map(
      (c) =>
        `import { ${c.pascalName}Component } from '../../components/${c.kebabName}/${c.kebabName}.component';`
    )
    .join('\n');

  const componentClasses = decompScreen.components.map((c) => `${c.pascalName}Component`).join(', ');
  const componentTags = decompScreen.components.map((c) => `      <app-${c.kebabName}></app-${c.kebabName}>`).join('\n');

  return `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
${imports}

@Component({
  selector: 'app-${decompScreen.kebabName}-screen',
  standalone: true,
  imports: [CommonModule${componentClasses ? `, ${componentClasses}` : ''}],
  template: \`
    <main class="page-container">
${componentTags}
    </main>
  \`,
  styles: [\`
    .page-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      color: #f8fafc;
    }
  \`]
})
export class ${decompScreen.screenPascalName}Component {}
`;
}

export function generateModularAngularRoutes(decompScreens: DecomposedScreen[]): string {
  const imports = decompScreens
    .map(
      (s) =>
        `import { ${s.screenPascalName}Component } from './pages/${s.kebabName}/${s.kebabName}.component';`
    )
    .join('\n');

  const routeDefs = decompScreens
    .map((s) => {
      const cleanPath = s.route.startsWith('/') ? s.route.slice(1) : s.route;
      return `  { path: '${cleanPath}', component: ${s.screenPascalName}Component },`;
    })
    .join('\n');

  return `import { Routes } from '@angular/router';
${imports}

export const routes: Routes = [
${routeDefs}
  { path: '**', redirectTo: '' }
];
`;
}

export function generateModularAngularApp(_decompScreens: DecomposedScreen[]): string {
  return `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: \`
    <div class="app-root">
      <router-outlet></router-outlet>
    </div>
  \`,
  styles: [\`
    .app-root {
      min-height: 100vh;
      background-color: #0b0f19;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
    }
  \`]
})
export class AppComponent {}
`;
}
