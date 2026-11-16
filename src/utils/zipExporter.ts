import JSZip from 'jszip';
import { FlexComponent, TargetLanguage } from '../types';
import { generateReactCode } from './codeGenerators/reactGenerator';
import { generateVueCode } from './codeGenerators/vueGenerator';
import { generateAngularCode } from './codeGenerators/angularGenerator';
import { generateHTML, generateCSS, generateJS } from './codeGenerators/htmlCssJsGenerator';

export async function exportProjectZip(
  components: FlexComponent[],
  language: TargetLanguage,
  projectName = 'flex-ui-project'
): Promise<Blob> {
  const zip = new JSZip();

  if (language === 'react') {
    // React Vite Scaffolding
    const appTsx = generateReactCode(components);
    zip.file('src/App.tsx', appTsx);
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
    const appVue = generateVueCode(components);
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
    const appComp = generateAngularCode(components);
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
    // Plain HTML / CSS / JS
    zip.file('index.html', generateHTML(components));
    zip.file('style.css', generateCSS(components));
    zip.file('script.js', generateJS(components));
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
