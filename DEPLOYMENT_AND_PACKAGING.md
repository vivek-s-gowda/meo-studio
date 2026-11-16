# 🐳 Dockerization & ⚡ Electron Desktop Bundling Guide

This guide provides end-to-end instructions for deploying **FlexUI** using Docker containers and packaging it as a native desktop application using Electron for macOS, Windows, and Linux.

---

## Part 1: 🐳 Dockerization

FlexUI includes both single-container and multi-container Docker workflows.

### Architecture Overview
- **Frontend SPA**: High-performance Nginx 1.27 Alpine container with gzip compression, security headers, and single-page application (SPA) routing fallback (`try_files $uri $uri/ /index.html;`).
- **Node.js API Server**: Express REST backend serving scaffolding endpoints on port `5001`.
- **Python Schematic Microservice**: Python 3.11 Alpine service performing AST parsing on port `5002`.

---

### Option A: Quick Standalone Web Container
Build and run the production-optimized web container directly:

```bash
# 1. Build the Docker image
npm run docker:build
# or: docker build -t flexui .

# 2. Run the container on port 3000
npm run docker:run
# or: docker run -d -p 3000:80 --name flexui-container flexui

# 3. Open in browser
open http://localhost:3000
```

To stop and remove:
```bash
docker stop flexui-container && docker rm flexui-container
```

---

### Option B: Full-Stack Multi-Container Orchestration (`docker-compose`)
Orchestrates the entire FlexUI ecosystem (Web Studio + Node.js API + Python Microservice):

```bash
# Start all services in the background
npm run docker:up
# or: docker compose up -d --build

# View container status
docker compose ps

# Follow live container logs
docker compose logs -f

# Stop all services
npm run docker:down
# or: docker compose down
```

#### Service Port Mappings:
| Service | Container Name | Port | Description |
|---|---|---|---|
| **Web Frontend** | `flexui-web` | `http://localhost:3000` | Nginx production SPA with live code editor & canvas |
| **Node.js Backend** | `flexui-api` | `http://localhost:5001` | Express API & Scaffolding engine |
| **Python Microservice** | `flexui-python-service` | `http://localhost:5002` | AST analysis & schematic formatting |

---

## Part 2: ⚡ Desktop Application (Electron)

FlexUI is configured with Electron 33+ and `electron-builder` to bundle into native cross-platform desktop installers.

### Desktop Architecture
- **[electron/main.cjs](file:///Users/viveks/flexui/electron/main.cjs)**: Main Electron process creating a dark-themed 1440x900 native studio window with application menu, external link handling, and app lifecycle management.
- **[electron/preload.cjs](file:///Users/viveks/flexui/electron/preload.cjs)**: Secure context bridge exposing `window.electronAPI` while enforcing context isolation and sandbox security.
- **[electron/dev.cjs](file:///Users/viveks/flexui/electron/dev.cjs)**: Automated dev launcher that starts the Vite local server and opens the Electron desktop window once ready.
- **Relative Asset Loading**: Configured with `base: './'` in `vite.config.ts` so the bundled app runs 100% offline via the `file://` protocol.

---

### 1. Running in Development Mode
Launch Vite and open the interactive Electron window:

```bash
# Install electron if not already installed globally
npm install --save-dev electron electron-builder

# Run Electron development mode
npm run electron:dev
```

This will automatically:
1. Boot the Vite dev server on `http://localhost:5173`.
2. Wait for the port to become active.
3. Launch the desktop Electron application with hot-reloading enabled.

---

### 2. Building Native Desktop Installers
Compile the optimized frontend and package standalone installers:

```bash
# Build desktop packages for your current operating system
npm run electron:build
```

#### Targeted OS Builds:
```bash
# macOS (Generates DMG and ZIP installer in dist-electron/)
npx electron-builder --mac

# Windows (Generates NSIS .exe setup & portable binary)
npx electron-builder --win

# Linux (Generates AppImage and .deb package)
npx electron-builder --linux
```

All packaged binaries, installers, and checksums will be generated in:
```
dist-electron/
├── FlexUI Studio-1.0.0.dmg      (macOS Apple Silicon / Intel)
├── FlexUI Studio-1.0.0-mac.zip  (macOS portable archive)
├── FlexUI Studio Setup 1.0.0.exe (Windows NSIS installer)
└── FlexUI Studio-1.0.0.AppImage (Linux standalone binary)
```

---

## Configuration Files Reference
- **[Dockerfile](file:///Users/viveks/flexui/Dockerfile)**: Multi-stage build with Node 20 builder and Nginx 1.27 runtime.
- **[nginx.conf](file:///Users/viveks/flexui/nginx.conf)**: Production web server configuration with SPA history routing and reverse proxy.
- **[docker-compose.yml](file:///Users/viveks/flexui/docker-compose.yml)**: Multi-service container orchestration.
- **[electron/main.cjs](file:///Users/viveks/flexui/electron/main.cjs)**: Electron main process.
- **[electron/preload.cjs](file:///Users/viveks/flexui/electron/preload.cjs)**: Electron preload bridge.
- **[electron/dev.cjs](file:///Users/viveks/flexui/electron/dev.cjs)**: Dev launcher script.
- **[package.json](file:///Users/viveks/flexui/package.json)**: Scripts and `electron-builder` metadata.
