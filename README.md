# 7-Zip GUI - v2.1

A modern, powerful, and complete graphical user interface for the 7-Zip command-line tool. Built with Electron, React, and TypeScript, this application provides a comprehensive and intuitive way to handle all your file compression and archiving needs.

This application is designed for both beginners and power users, providing sensible defaults while exposing the full capabilities of the 7-Zip engine.

![Dark Mode Screenshot](https://i.imgur.com/uW6g2i1.png)
_Dark Mode Interface_


_Light Mode Interface_


## Features

- **Modern Desktop UI**: A clean, polished interface with both **Light and Dark themes**.
- **Full Command Support**: A dedicated UI for all major 7-Zip commands: `Add`, `Extract`, `Test`, `List`, `Delete`, `Update`, `Benchmark`, `Hash`, and more.
- **Exhaustive Switch Coverage**: A dynamic, context-aware UI to control a wide range of 7-Zip switches for fine-grained control over your operations.
- **Live Command Preview**: See the exact CLI command that will be executed, updated in real-time. Perfect for learning and scripting.
- **Resizable Log Panel**: A dockable, resizable panel at the bottom provides a unified view for both operation progress and detailed application logs.
- **Executable Management**: Auto-detects your `7z`/`7zz`/`7za` executable, with the ability to override the path in the Settings panel.
- **Real-time Logging**: View detailed output from the 7-Zip process, including progress, warnings, and errors.
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