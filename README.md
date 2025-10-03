# 7-Zip GUI - v1.0.4

A modern, powerful, and complete graphical user interface for the 7-Zip command-line tool. Built with Electron, React, and TypeScript, this application provides a comprehensive and intuitive way to handle all your file compression and archiving needs.

This application is designed for both beginners and power users, providing sensible defaults while exposing the full capabilities of the 7-Zip engine.

![Dark Mode Screenshot](https://i.imgur.com/uW6g2i1.png)
_Dark Mode Interface with expanded log panel_


_Light Mode Interface with collapsed log panel_


## Features

- **Modern Desktop UI**: A clean, full-window interface with both **Light and Dark themes**.
- **Full Command Support**: A dedicated UI for all major 7-Zip commands: `Add`, `Extract`, `Test`, `List`, `Delete`, `Update`, `Benchmark`, `Hash`, and more.
- **Exhaustive Switch Coverage**: A dynamic, context-aware UI to control a wide range of 7-Zip switches for fine-grained control over your operations.
- **Live Command Preview**: See the exact CLI command that will be executed, updated in real-time. Perfect for learning and scripting.
- **Collapsible Log Panel**: A dockable, resizable panel at the bottom provides a unified view for both operation progress and detailed application logs. Show or hide it with a single click.
- **Comprehensive Status Bar**: Get at-a-glance feedback on application status, configured executable, and log panel visibility.
- **Executable Management**: Auto-detects your `7z`/`7zz`/`7za` executable, with the ability to override the path in the Settings panel.
- **Rich Application Logging**: The application log tracks all major events, from startup to settings changes, providing excellent debugging insight.
- **Exit Code Interpretation**: Get clear, human-readable feedback on whether an operation succeeded, had warnings, or failed.
- **In-App Documentation**: Access manuals and changelogs from within the app.

## Prerequisites

You must have a 7-Zip command-line executable (`7z.exe` on Windows, `7zz` on Linux/macOS) installed. The application will attempt to find it in your system's PATH, but you can specify the full path in the **Settings** tab.

You can download 7-Zip from the official website: [www.7-zip.org](https://www.7-zip.org/)

## Installation & Usage

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd 7zip-gui
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application in development mode:**
    ```bash
    npm start
    ```

4.  **Package the application:**
    To create a standalone executable, run:
    ```bash
    npm run package
    ```
    The packaged application will be located in the `dist` directory.

### Application icon pipeline

During every build the `build:icons` script searches the `assets` directory for an SVG icon (preferring `app-icon.svg`). The SVG
is validated to ensure it has either a `viewBox` or explicit dimensions before it is rasterised. Valid SVGs are rendered into a
set of PNGs, which are then bundled into platform-appropriate icon containers (`.ico` for Windows, `.icns` for macOS, and a
512px PNG for Linux). If the SVG is missing or invalid, a bundled fallback artwork is used so packaging can still succeed.
For SVG-to-raster conversion the script uses `@resvg/resvg-js`; when this dependency is not available a procedural fallback icon
with similar styling is generated automatically.
