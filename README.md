# FlexUI - Visual UI Studio & Framework Scaffolder

**FlexUI** is a modern visual UI builder and code generator designed for rapid frontend prototyping and multi-framework scaffolding. Craft Material-styled interfaces visually with intuitive drag-and-drop, configure properties & styles, bind JavaScript functions to controls, and instantly compile your layout into **React (TSX)**, **Vue 3 (SFC)**, **Angular 17+ (Standalone)**, or **Vanilla HTML/CSS/JS**.

---

## 🚀 Key Features

### 1. Left Sidebar: Material Component Palette
- **Form Controls**: Outlined & Filled Text Fields, Textareas, Checkboxes with label, Radio Button Groups, Switches, Dropdown Selects, Range Sliders.
- **Buttons**: Contained (Elevated), Outlined, Floating Action Buttons (FABs).
- **Layout & Structure**: Flexible Containers (Box), Elevated Material Cards, 2-Column Grids, Hairline Dividers.
- **Typography**: Responsive Headings (H1/H2), Subtitles, Body Paragraphs, Badges/Tags.
- **Display & Feedback**: Material Avatars, Linear Progress Indicators, Alert Callout Banners, Top App Bars.
- **Drag & Drop**: Effortlessly drag components into the center playground or directly into nested containers.

### 2. Center: Interactive Playground & Canvas
- **Multi-Device Viewport Switcher**: Test layouts across Desktop (1100px), Tablet (768px), Mobile (375px), or 100% Responsive.
- **Visual Selection & Floating Toolbar**: Instant access to quick actions (Move Up, Move Down, Duplicate, Delete, Settings).
- **Right-Click Context Menu & Double-Click Modal**:
  - **Change Styles**: Live tuning of width, height, colors (with swatch picker), padding, margin, border-radius, font sizes, weights, and shadows.
  - **Edit Properties**: Modify titles, labels, placeholders, option lists, and image URLs.
  - **Bind JavaScript Functions**: Attach event listeners (`onClick`, `onChange`, `onSubmit`, `onFocus`) and write custom JavaScript handler logic with in-place testing.
- **Interactive Mode Toggle**: Switch between **Edit Mode** and **Interactive Preview Mode** to test buttons, inputs, and execute your bound JS functions directly in the playground!

### 3. Right Sidebar: Structure Inspector & Multi-Language Code Generator
- **DOM Hierarchy / Structure Tree**: Visual tree of all nested containers and components; click to focus or reorder.
- **Multi-Framework Porting Dropdown**:
  - **React 18+ (TSX)**: Generates modern functional components with hooks, Tailwind CSS, and state management.
  - **Vue 3 (SFC)**: Generates clean `<script setup lang="ts">`, reactive `ref`s, scoped styles, and templates.
  - **Angular 17+ (Standalone)**: Generates standalone components with `CommonModule`, `FormsModule`, typed properties, and inline styles.
  - **Vanilla HTML / CSS / JS**: Provides dedicated, switchable tabs for separate `index.html`, `style.css`, and `script.js` files.
- **Syntax Highlighter**: Tokenized schematic syntax highlighting with line numbers and 1-click clipboard copy.

### 4. Project Scaffolding & Export
- **One-Click Scaffold ZIP**: Downloads a complete, production-ready project archive with `package.json`, configuration files (`vite.config.ts`, `tailwind.config.js`), and source code ready to run with `npm install && npm run dev`.
- **Switch Languages Anytime**: Toggle between React, Vue, Angular, or Vanilla HTML at any point without losing your design.

### 5. FlexAI Assistant Suite
- **Prompt-to-UI Synthesis**: Describe a layout in plain English (e.g., *"Material login card with email, password, remember me checkbox, and submit button"*) and watch FlexUI generate and place the component hierarchy automatically.
- **Stack Architecture Prompts**: Ready-to-use system prompts tailored for React, Vue, Angular, Node.js backend, and Python microservices.
- **Python AST Microservice**: Lightweight Python backend service (`python_service/app.py`) for semantic code inspection, AST validation, and token analysis.

---

## 🛠️ Project Structure

\`\`\`
flexui/
├── index.html                   # Entry HTML with custom font & dark mode setup
├── package.json                 # Dependencies & scripts for Vite, React, Express, JSZip
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with API proxy
├── tailwind.config.js           # Tailwind CSS theme configuration
├── server/
│   └── server.js                # Node.js Express server for scaffolding & AI endpoints
├── python_service/
│   └── app.py                   # Python AST & schematic analysis microservice
├── src/
│   ├── main.tsx                 # Application entry point
│   ├── App.tsx                  # Root layout (TopNav, LeftSidebar, Canvas, RightSidebar)
│   ├── index.css                # Global styles, grid canvas patterns, material ripple
│   ├── types/
│   │   └── index.ts             # TypeScript definitions for components, styles, events
│   ├── constants/
│   │   ├── componentCatalog.ts  # Material component definitions & defaults
│   │   └── templates.ts         # Pre-built starter templates (Login, Profile, etc.)
│   ├── context/
│   │   └── BuilderContext.tsx   # Global state, undo/redo, component tree management
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopNav.tsx       # Top bar, framework porting selector, viewport switcher
│   │   │   ├── LeftSidebar.tsx  # Draggable Material UI palette
│   │   │   └── RightSidebar.tsx # Tree hierarchy, code generator (HTML/CSS/JS/React/Vue/Angular)
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx       # Center playground & drop zone
│   │   │   ├── CanvasComponent.tsx # Interactive component renderer
│   │   │   ├── ContextMenu.tsx  # Right-click action menu
│   │   │   └── QuickStylePopup.tsx # Style tuner, property editor & JS function binder
│   │   ├── modals/
│   │   │   ├── ScaffoldModal.tsx   # Framework scaffolding & zip download wizard
│   │   │   ├── AIAssistantModal.tsx # Natural language UI builder & AI stack prompts
│   │   │   └── TemplatesModal.tsx  # Pre-built template picker
│   │   └── ui/
│   │       ├── Icons.tsx        # Dynamic Lucide icon renderer
│   │       └── SyntaxHighlighter.tsx # Schematic syntax highlighting engine
│   └── utils/
│       ├── codeGenerators/
│       │   ├── reactGenerator.ts    # React TSX compiler
│       │   ├── vueGenerator.ts      # Vue 3 SFC compiler
│       │   ├── angularGenerator.ts  # Angular standalone component compiler
│       │   └── htmlCssJsGenerator.ts# HTML5 / CSS3 / JS compiler
│       ├── zipExporter.ts           # Client-side full repository packager
│       └── aiService.ts             # AI heuristic prompt parser & stack prompts
└── README.md
\`\`\`

---

## ⚡ Getting Started

### 1. Run the Frontend Development Studio
\`\`\`bash
npm run dev
\`\`\`
Visit `http://localhost:5173` in your browser.

### 2. Build for Production
\`\`\`bash
npm run build
\`\`\`

### 3. (Optional) Run the Node.js Scaffolding & API Server
\`\`\`bash
npm run server
\`\`\`
Listens on `http://localhost:5001`.

### 4. (Optional) Run the Python AST & Schematic Analysis Microservice
\`\`\`bash
npm run py-service
\`\`\`
Listens on `http://localhost:5002`.
