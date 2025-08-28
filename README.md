# 7-Zip GUI

A modern, cross-platform graphical user interface for the powerful 7-Zip command-line tool. Built with Electron, React, and TypeScript, this application provides a simple and intuitive way to handle file compression and extraction.

## Features

- **Compress Files & Folders**: Easily create archives in `.7z` or `.zip` format.
- **Multiple Compression Levels**: Choose from "Copy" (no compression) to "Ultra" for maximum space saving.
- **Extract Archives**: Supports extracting from popular formats like `.7z`, `.zip`, `.rar`, `.tar`, and more.
- **Real-time Operation Logging**: View the output from the 7-Zip process as it happens during a compression or extraction task.
- **Progress Visualization**: A progress bar shows the status of the current operation.
- **Application Event Logging**: A detailed application log panel can be toggled to view debug, info, warning, and error messages.
- **Log to File**: Option to save application logs to a file for debugging and record-keeping.
- **In-App Documentation**: Access manuals and changelogs from within the app.
- **User-Friendly Interface**: Clean and modern UI built with Tailwind CSS.

## Prerequisites

You must have the 7-Zip command-line executable (`7z.exe` on Windows) installed and accessible in your system's PATH environment variable.

You can download 7-Zip from the official website: [www.7-zip.org](https://www.7-zip.org/)

## Installation & Usage

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd 7zip-gui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application in development mode:**
   ```bash
   npm start
   ```

4. **Package the application:**
   To create a standalone executable, run:
   ```bash
   npm run package
   ```
   The packaged application will be located in the `dist` directory.