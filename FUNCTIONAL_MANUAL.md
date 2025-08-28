# Functional Manual: 7-Zip GUI v2.0

This guide explains how to use the 7-Zip GUI application for a wide range of archiving tasks.

## Main Interface

The application is a comprehensive front-end for the 7-Zip command line tool.
1.  **Header**: Contains the application title and a button to show/hide the Application Log panel.
2.  **Command Tabs**: The primary navigation. Select the 7-Zip command you want to perform (e.g., `Add`, `Extract`, `List`). There are also tabs for `Settings` and `Help`.
3.  **Command Form**: A dynamic area that shows all the relevant options (switches) for the selected command.
4.  **Command Preview**: A read-only box that shows the exact command line that will be generated based on your selections. You can copy this for use in scripts.
5.  **Operation Log**: Displays real-time progress, messages, and errors from the 7-Zip process for the current operation. It also shows a clear status (Success, Warning, Error) based on the exit code.
6.  **Application Log Panel**: (Optional) A panel at the bottom that shows detailed application-level logs for debugging.

## Common Operations

### How to Add Files to an Archive (Compress)

1.  **Select the 'a' (Add) Tab**.
2.  **Select Files/Folders**: Under "Files / Folders to Add", select the items you wish to compress.
3.  **Set Archive Path**: Under "Archive", specify the full path and name for your output file (e.g., `C:\Users\You\Documents\MyArchive.zip`).
4.  **Configure Switches**:
    - **Archive Format (`-t`)**: Choose the type, like `7z` or `zip`.
    - **Compression Level (`-mx`)**: '5' (Normal) is a good default. '9' (Ultra) is strongest.
    - **Password (`-p`)**: Set a password for encryption if needed.
5.  **Start Compression**: Click the "Run Command" button. Monitor its progress in the Operation Log.

### How to Extract an Archive

1.  **Select the 'x' (Extract with paths) Tab**.
2.  **Select Archive File**: In the "Archive" field, browse and select the archive file you want to extract.
3.  **Choose Output Directory (`-o`)**: Use the "Output Directory" switch to select the destination folder.
4.  **Start Extraction**: Click "Run Command" and monitor the progress.

## Settings Tab

The `Settings` tab is crucial for initial setup.
- **Executable Path**: This must point to your `7z.exe` (Windows) or `7zz` (Linux/macOS) file. The application tries to find it, but if you see errors, configure the correct path here.

## Help Tab

The `Help` tab provides access to important project documentation:
- **README**: General project overview.
- **Functional Manual**: This document.
- **Technical Manual**: Details about the application's architecture.
- **Changelog**: A log of changes for each version.

## Application Log Panel

For advanced users and debugging, the application provides a detailed logging panel.
- **Show/Hide Panel**: Click the "Show App Logs" / "Hide App Logs" button in the top-right corner.
- **Filtering Logs**: Use the checkboxes to filter messages by level (DEBUG, INFO, WARNING, ERROR).
- **Save Log to File**: Enable this to save all application logs to a file in the executable's directory.