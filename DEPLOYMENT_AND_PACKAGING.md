# 🐳 Dockerization & ⚡ Electron Desktop Bundling Guide

This guide provides end-to-end instructions for deploying **Meo** using Docker containers and packaging it as a native desktop application using Electron for macOS, Windows, and Linux.

---

## Part 1: 🐳 Dockerization

Meo includes both single-container and multi-container Docker workflows.

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
# or: docker build -t meo .

# 2. Run the container on port 3000
npm run docker:run
# or: docker run -d -p 3000:80 --name meo-container meo

# 3. Open in browser
open http://localhost:3000
```

To stop and remove:
```bash
docker stop meo-container && docker rm meo-container
```

---

### Option B: Full-Stack Multi-Container Orchestration (`docker-compose`)
Orchestrates the entire Meo ecosystem (Web Studio + Node.js API + Python Microservice):

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
| **Web Frontend** | `meo-web` | `http://localhost:3000` | Nginx production SPA with live code editor & canvas |
| **Node.js Backend** | `meo-api` | `http://localhost:5001` | Express API & Scaffolding engine |
| **Python Microservice** | `meo-python-service` | `http://localhost:5002` | AST analysis & schematic formatting |

---

## Part 2: ⚡ Desktop Application (Electron)

Meo is configured with Electron 33+ and `electron-builder` to bundle into native cross-platform desktop installers.

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
# Build desktop packages for current host OS
npm run electron:build
```

#### macOS Targeted Builds (Apple Silicon & Intel):
```bash
# 🍏 Apple Silicon (M1, M2, M3, M4 - arm64) - Recommended for Apple Silicon Macs
npm run electron:mac:arm64
# (or simply: npm run electron:mac)

# 🌐 Universal Binary (Runs natively on both Apple Silicon and Intel)
npm run electron:mac:universal

# 💻 Intel Macs (x64)
npm run electron:mac:x64

# 📦 Package both Apple Silicon (arm64) and Intel (x64) DMG installers simultaneously
npm run electron:mac:all
```

#### Windows & Linux Builds:
```bash
# Windows (Generates NSIS .exe setup & portable binary)
npm run electron:win

# Linux (Generates AppImage and .deb package)
npm run electron:linux
```

All packaged binaries, installers, and checksums will be generated in:
```
dist-electron/
├── Meo Studio-1.0.0-arm64.dmg       (Apple Silicon M1/M2/M3/M4 native)
├── Meo Studio-1.0.0-arm64-mac.zip   (Apple Silicon portable archive)
├── Meo Studio-1.0.0-universal.dmg   (Universal Binary for all Macs)
├── Meo Studio-1.0.0-x64.dmg         (Intel Mac native)
├── Meo Studio Setup 1.0.0.exe       (Windows NSIS installer)
└── Meo Studio-1.0.0.AppImage        (Linux standalone binary)
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
