# Technical Manual: 7-Zip GUI

This document outlines the technical architecture and implementation details of the 7-Zip GUI application.

## Technology Stack

- **Electron**: A framework for building cross-platform desktop applications using web technologies.
- **React**: A JavaScript library for building the user interface.
- **TypeScript**: A statically typed superset of JavaScript for code quality and maintainability.
- **esbuild**: A fast JavaScript bundler and minifier.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Node.js**: Used for the backend (main) process in Electron.

## Application Architecture

The application follows Electron's standard main/renderer process model.

### 1. Main Process (`electron/main.ts`)

- **Role**: The application's entry point, running in a Node.js environment. It manages the application lifecycle and all OS-level interactions.
- **Responsibilities**:
    - Creates the `BrowserWindow` which loads the user interface.
    - Sets up Inter-Process Communication (IPC) handlers.
    - Spawns and manages the `7z.exe` command-line process.
    - Streams `stdout` and `stderr` from the 7-Zip process back to the renderer.
    - Handles native dialogs and file system access.
    - **Manages the centralized logging system.**

### 2. Renderer Process (`index.tsx`, `App.tsx`, etc.)

- **Role**: The user interface, running in a Chromium browser environment.
- **Responsibilities**:
    - Renders the React component tree.
    - Manages UI state.
    - Sends requests to the main process via the preload script (`window.electronAPI`).
    - Listens for events from the main process (like 7-Zip progress and application log messages) to update the UI.

### 3. Preload Script (`electron/preload.ts`)

- **Role**: A secure bridge between the main and renderer processes.
- **Responsibilities**:
    - Uses Electron's `contextBridge` to securely expose a limited API (`window.electronAPI`) to the renderer process. This API allows the renderer to invoke IPC handlers in the main process and listen for events.

## Logging Architecture

The application features a centralized logging system managed by the main process to ensure all events are captured reliably.

- **Central Logger**: A logger instance in `electron/main.ts` is the single source of truth for logging. It formats log messages with a timestamp and severity level (DEBUG, INFO, WARNING, ERROR).
- **File Logging**: The logger can write to a log file on disk. This feature is controlled by the user from the UI. A `fs.WriteSteam` is used for efficient, continuous writing.
- **IPC for Logs**:
    - When the logger records a message, it broadcasts the log object to the renderer process using `win.webContents.send('log-message', ...)`.
    - The `LoggingPanel.tsx` component in the renderer listens for these messages via `window.electronAPI.onLogMessage` and updates its state to display them.
    - The renderer can toggle file logging by invoking an IPC handler (`toggle-file-logging`) in the main process.

## Build Process

The project uses `esbuild` for its speed and simplicity, managed by scripts in `package.json`. The `electron-builder` tool is used to package the application into a distributable installer.