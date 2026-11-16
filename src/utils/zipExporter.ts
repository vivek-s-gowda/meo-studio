import JSZip from 'jszip';
import { FlexComponent, TargetLanguage, Screen } from '../types';
import { generateReactCode, generateReactMultiRouter } from './codeGenerators/reactGenerator';
import { generateVueCode } from './codeGenerators/vueGenerator';
import { generateAngularCode } from './codeGenerators/angularGenerator';
import { generateHTML, generateCSS, generateJS } from './codeGenerators/htmlCssJsGenerator';

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export async function exportProjectZip(
  screensOrComponents: Screen[] | FlexComponent[],
  language: TargetLanguage,
  projectName = 'flex-ui-project'
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

  if (language === 'react') {
    // React Multi-Screen Routing Scaffolding
    if (screens.length > 1) {
      screens.forEach((s) => {
        const compName = `${toPascalCase(s.name)}Screen`;
        zip.file(`src/pages/${compName}.tsx`, generateReactCode(s.components, compName));
      });
      zip.file('src/App.tsx', generateReactMultiRouter(screens));
    } else {
      zip.file('src/App.tsx', generateReactCode(primaryComponents));
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
    // Vue 3 Vite Scaffolding
    if (screens.length > 1) {
      screens.forEach((s) => {
        const viewName = `${toPascalCase(s.name)}View`;
        zip.file(`src/views/${viewName}.vue`, generateVueCode(s.components, viewName));
      });
    }
    const appVue = generateVueCode(primaryComponents);
    zip.file('src/App.vue', appVue);
    zip.file(
      'src/main.ts',
      `import { createApp } from 'vue';
import App from './App.vue';
createApp(App).mount('#app');`
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
            build: 'vue-tsc && vite build',
          },
          dependencies: {
            vue: '^3.5.13',
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
    // Angular 17+ Scaffolding
    if (screens.length > 1) {
      screens.forEach((s) => {
        const compName = `${toPascalCase(s.name)}Component`;
        zip.file(
          `src/app/${s.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.component.ts`,
          generateAngularCode(s.components, compName)
        );
      });
    }
    const appComp = generateAngularCode(primaryComponents);
    zip.file('src/app/app.component.ts', appComp);
    zip.file(
      'src/main.ts',
      `import { bootstrapApplication } from '@angular/platform-browser';
import { FlexAppComponent } from './app/app.component';

bootstrapApplication(FlexAppComponent).catch((err) => console.error(err));`
    );
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
    // Plain HTML / CSS / JS (Multi-page or single page)
    if (screens.length > 1) {
      screens.forEach((s, idx) => {
        const fileName =
          idx === 0 || s.route === '/'
            ? 'index.html'
            : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
        zip.file(fileName, generateHTML(s.components));
      });
    } else {
      zip.file('index.html', generateHTML(primaryComponents));
    }
    zip.file('style.css', generateCSS(primaryComponents));
    zip.file('script.js', generateJS(primaryComponents));
  }

  // Common README.md
  zip.file(
    'README.md',
    `# ${projectName}

Exported from **FlexUI** Studio for **${language.toUpperCase()}**.

## Getting Started
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
