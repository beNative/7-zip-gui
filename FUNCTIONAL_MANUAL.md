# Functional Manual: 7-Zip GUI

This guide explains how to use the 7-Zip GUI application for compressing and extracting files.

## Main Interface

The application window is divided into several sections:
1.  **Header**: Contains the application title and a button to show/hide the Application Log panel.
2.  **Operation Tabs**: Switch between 'Compress', 'Extract', and 'Info' modes.
3.  **Options Form**: Configure the settings for the selected operation.
4.  **Output Log**: (Visible in Compress/Extract modes) Displays real-time progress, messages, and errors from the 7-Zip process for the current operation.
5.  **Application Log Panel**: (Optional) A panel at the bottom that shows detailed application-level logs.

## How to Compress Files

1.  **Select the 'Compress' Tab**: This is the default view when the application starts.
2.  **Select Files/Folders**: Click the file input field under "Files/Folders to Compress". You can select multiple files or an entire directory.
3.  **Set Archive Name**: Enter the desired name for your output file (without the extension). The archive will be created in the same directory as the first file you selected.
4.  **Choose Archive Format**: Select either `.7z` or `.zip`.
5.  **Set Compression Level**: Choose the desired compression level. 'Normal' is a good balance, while 'Ultra' provides the best compression.
6.  **Start Compression**: Click the "Compress" button. Monitor its progress in the Output Log.

## How to Extract an Archive

1.  **Select the 'Extract' Tab**.
2.  **Select Archive File**: Choose the archive file you want to extract.
3.  **Choose Output Directory**: Click "Browse" to select the destination folder.
4.  **Start Extraction**: Click the "Extract" button and monitor the progress in the Output Log.

## Information Tab

The 'Info' tab provides access to important project documentation:
- **README**: General project overview.
- **Functional Manual**: This document.
- **Technical Manual**: Details about the application's architecture.
- **Changelog**: A log of changes and new features for each version.

## Application Log Panel

For advanced users and debugging, the application provides a detailed logging panel.

1.  **Show/Hide Panel**: Click the "Show Logs" / "Hide Logs" button in the top-right corner of the window to toggle the panel's visibility.
2.  **Filtering Logs**: Use the checkboxes in the panel's header to show or hide messages based on their level (DEBUG, INFO, WARNING, ERROR). This is useful for isolating specific types of events.
3.  **Save Log to File**: In the panel's footer, there is a "Save log to file" checkbox. When enabled, all application logs are automatically saved to a file (e.g., `7zip-gui-YYYY-MM-DD.log`) in the same directory as the executable. This is helpful for reporting issues.