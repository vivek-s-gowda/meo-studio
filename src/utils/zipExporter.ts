import JSZip from 'jszip';
import { FlexComponent, TargetLanguage, Screen, DataSource } from '../types';
import { generateReactCode, generateReactMultiRouter } from './codeGenerators/reactGenerator';
import { generateVueCode } from './codeGenerators/vueGenerator';
import { generateAngularCode } from './codeGenerators/angularGenerator';
import { generateHTML, generateCSS, generateJS } from './codeGenerators/htmlCssJsGenerator';
import {
  decomposeScreens,
  generateModularReactScreen,
  generateModularVueScreen,
  generateModularVueRouter,
  generateModularVueApp,
  generateModularAngularScreen,
  generateModularAngularRoutes,
  generateModularAngularApp,
  toPascalCase,
} from './componentDecomposer';

export async function exportProjectZip(
  screensOrComponents: Screen[] | FlexComponent[],
  language: TargetLanguage,
  projectName = 'flex-ui-project',
  dataSources: DataSource[] = [],
  isModular = true
): Promise<Blob> {
  const zip = new JSZip();

  // Normalize into screens array
  const isMultiScreen =
    Array.isArray(screensOrComponents) &&
    screensOrComponents.length > 0 &&
    'route' in screensOrComponents[0];

  const screens: Screen[] = isMultiScreen
    ? (screensOrComponents as Screen[])
    : [
        {
          id: 'screen-main',
          name: 'Home',
          route: '/',
          components: screensOrComponents as FlexComponent[],
        },
      ];

  const primaryComponents = screens[0].components;
  const decomposed = decomposeScreens(screens);

  // Bundle mock data JSON
  if (dataSources && dataSources.length > 0) {
    zip.file('src/data/mockData.json', JSON.stringify(dataSources, null, 2));
  }

  // ----------------------------------------------------
  // REACT SCAFFOLDING
  // ----------------------------------------------------
  if (language === 'react') {
    if (isModular) {
      // 1. Export extracted modular components to src/components/
      decomposed.allComponents.forEach((c) => {
        zip.file(
          `src/components/${c.pascalName}.tsx`,
          generateReactCode([c.component], c.pascalName, dataSources)
        );
      });

      // 2. Export screen components to src/pages/
      decomposed.screens.forEach((s) => {
        zip.file(
          `src/pages/${s.screenPascalName}.tsx`,
          generateModularReactScreen(s, screens)
        );
      });

      // 3. Export App.tsx with Router
      zip.file('src/App.tsx', generateReactMultiRouter(screens));
    } else {
      if (screens.length > 1) {
        screens.forEach((s) => {
          const compName = `${toPascalCase(s.name)}Screen`;
          zip.file(`src/pages/${compName}.tsx`, generateReactCode(s.components, compName, dataSources));
        });
        zip.file('src/App.tsx', generateReactMultiRouter(screens));
      } else {
        zip.file('src/App.tsx', generateReactCode(primaryComponents, 'App', dataSources));
      }
    }

    zip.file(
      'src/main.tsx',
      `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
    );
    zip.file(
      'src/index.css',
      `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #0b0f19;
  color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
}`
    );
    zip.file(
      'package.json',
      JSON.stringify(
        {
          name: projectName.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'tsc && vite build',
            preview: 'vite preview',
          },
          dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            'react-router-dom': '^6.28.0',
          },
          devDependencies: {
            '@types/react': '^18.3.18',
            '@types/react-dom': '^18.3.5',
            '@vitejs/plugin-react': '^4.3.4',
            autoprefixer: '^10.4.20',
            postcss: '^8.5.2',
            tailwindcss: '^3.4.17',
            typescript: '^5.7.3',
            vite: '^6.1.0',
          },
        },
        null,
        2
      )
    );
    zip.file(
      'vite.config.ts',
      `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`
    );
    zip.file(
      'tailwind.config.js',
      `export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};`
    );
    zip.file(
      'index.html',
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    );
  } else if (language === 'vue') {
    // ----------------------------------------------------
    // VUE 3 SCAFFOLDING
    // ----------------------------------------------------
    if (isModular) {
      // 1. Export extracted modular components to src/components/
      decomposed.allComponents.forEach((c) => {
        zip.file(
          `src/components/${c.pascalName}.vue`,
          generateVueCode([c.component], c.pascalName, dataSources)
        );
      });

      // 2. Export views to src/views/
      decomposed.screens.forEach((s) => {
        zip.file(`src/views/${s.pascalName}View.vue`, generateModularVueScreen(s));
      });

      // 3. Export router configuration
      zip.file('src/router/index.ts', generateModularVueRouter(decomposed.screens));

      // 4. Export App.vue with router-view
      zip.file('src/App.vue', generateModularVueApp(decomposed.screens));

      zip.file(
        'src/main.ts',
        `import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');`
      );
    } else {
      if (screens.length > 1) {
        screens.forEach((s) => {
          const viewName = `${toPascalCase(s.name)}View`;
          zip.file(`src/views/${viewName}.vue`, generateVueCode(s.components, viewName, dataSources));
        });
      }
      const appVue = generateVueCode(primaryComponents, 'App', dataSources);
      zip.file('src/App.vue', appVue);
      zip.file(
        'src/main.ts',
        `import { createApp } from 'vue';
import App from './App.vue';
createApp(App).mount('#app');`
      );
    }

    zip.file(
      'package.json',
      JSON.stringify(
        {
          name: projectName.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vue-tsc && vite build',
          },
          dependencies: {
            vue: '^3.5.13',
            'vue-router': '^4.5.0',
          },
          devDependencies: {
            '@vitejs/plugin-vue': '^5.2.1',
            typescript: '^5.7.3',
            vite: '^6.1.0',
            'vue-tsc': '^2.2.0',
          },
        },
        null,
        2
      )
    );
    zip.file(
      'vite.config.ts',
      `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});`
    );
    zip.file(
      'index.html',
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`
    );
  } else if (language === 'angular') {
    // ----------------------------------------------------
    // ANGULAR 17+ SCAFFOLDING
    // ----------------------------------------------------
    if (isModular) {
      // 1. Export modular components to src/app/components/<kebab>/
      decomposed.allComponents.forEach((c) => {
        zip.file(
          `src/app/components/${c.kebabName}/${c.kebabName}.component.ts`,
          generateAngularCode([c.component], `${c.pascalName}Component`, dataSources)
        );
      });

      // 2. Export screen pages to src/app/pages/<kebab>/
      decomposed.screens.forEach((s) => {
        zip.file(
          `src/app/pages/${s.kebabName}/${s.kebabName}.component.ts`,
          generateModularAngularScreen(s)
        );
      });

      // 3. Export router configuration
      zip.file('src/app/app.routes.ts', generateModularAngularRoutes(decomposed.screens));

      // 4. Export app.config.ts
      zip.file(
        'src/app/app.config.ts',
        `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};`
      );

      // 5. Export app.component.ts with router-outlet
      zip.file('src/app/app.component.ts', generateModularAngularApp(decomposed.screens));

      zip.file(
        'src/main.ts',
        `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));`
      );
    } else {
      if (screens.length > 1) {
        screens.forEach((s) => {
          const compName = `${toPascalCase(s.name)}Component`;
          zip.file(
            `src/app/${s.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.component.ts`,
            generateAngularCode(s.components, compName, dataSources)
          );
        });
      }
      const appComp = generateAngularCode(primaryComponents, 'FlexAppComponent', dataSources);
      zip.file('src/app/app.component.ts', appComp);
      zip.file(
        'src/main.ts',
        `import { bootstrapApplication } from '@angular/platform-browser';
import { FlexAppComponent } from './app/app.component';

bootstrapApplication(FlexAppComponent).catch((err) => console.error(err));`
      );
    }

    zip.file(
      'package.json',
      JSON.stringify(
        {
          name: projectName.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          scripts: {
            start: 'ng serve',
            build: 'ng build',
          },
          dependencies: {
            '@angular/common': '^19.0.0',
            '@angular/core': '^19.0.0',
            '@angular/forms': '^19.0.0',
            '@angular/platform-browser': '^19.0.0',
            '@angular/router': '^19.0.0',
            rxjs: '~7.8.0',
            'zone.js': '~0.15.0',
          },
          devDependencies: {
            '@angular/cli': '^19.0.0',
            typescript: '~5.6.2',
          },
        },
        null,
        2
      )
    );
  } else {
    // ----------------------------------------------------
    // PLAIN HTML / CSS / JS
    // ----------------------------------------------------
    if (isModular) {
      // Export components to components/
      decomposed.allComponents.forEach((c) => {
        zip.file(`components/${c.kebabName}.html`, generateHTML([c.component], dataSources));
      });
      // Export pages
      decomposed.screens.forEach((s, idx) => {
        const fileName =
          idx === 0 || s.route === '/'
            ? 'index.html'
            : `pages/${s.kebabName}.html`;
        zip.file(fileName, generateHTML(s.components.map((c) => c.component), dataSources));
      });
    } else {
      if (screens.length > 1) {
        screens.forEach((s, idx) => {
          const fileName =
            idx === 0 || s.route === '/'
              ? 'index.html'
              : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
          zip.file(fileName, generateHTML(s.components, dataSources));
        });
      } else {
        zip.file('index.html', generateHTML(primaryComponents, dataSources));
      }
    }
    zip.file('style.css', generateCSS(primaryComponents));
    zip.file('script.js', generateJS(primaryComponents, dataSources));
  }

  // Common README.md
  zip.file(
    'README.md',
    `# ${projectName}

Exported from **FlexUI** Studio with **Modular Component Architecture**.

### Architecture Overview:
- 📁 \`src/components/\`: Reusable UI components extracted from canvas elements
- 📁 \`src/pages/\` (or \`src/views/\`): Screen views assembling the modular components
- 🧭 \`App.tsx\` (or \`router/index.ts\` / \`app.routes.ts\`): Application Router with full screen route configuration
- 📦 \`src/data/mockData.json\`: Data sources and API models

### Quickstart:
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev # or npm start
\`\`\`
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
