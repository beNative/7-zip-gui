# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2024-05-24

### Added
- **Complete UI Modernization**: The entire application has been redesigned with a more modern, professional look and feel, including a new color palette, improved spacing, and better visual hierarchy.
- **Light & Dark Themes**: Added a theme switcher in the Settings tab to toggle between a new light mode and the classic dark mode.
- **Resizable Log Panel**: The log area is now a resizable, dockable panel at the bottom of the application.
- **Unified Log View**: The Operation Log and Application Log are now in a tabbed view inside the new resizable panel, decluttering the UI.
- **Improved UX**: Added icons and subtle transitions to improve usability and visual appeal.
- The application window now features a custom, frameless title bar.

### Changed
- The main action button ("Run Command") has a more prominent, colorful design.
- The file/folder input controls have been updated for a better user experience.

## [2.0.0] - 2024-05-23

### Added
- **Complete Architectural Overhaul**: Rebuilt the application around a schema-driven UI to support the full 7-Zip command set.
- **Full Command Support**: Added dedicated UI tabs for all major 7-Zip commands: `a` (Add), `b` (Benchmark), `d` (Delete), `e` (Extract), `x` (Extract Full Paths), `h` (Hash), `i` (Info), `l` (List), `rn` (Rename), `t` (Test), and `u` (Update).
- **Live Command Preview**: A new panel shows the exact CLI command that will be run, updating in real-time as options are changed.
- **Settings Panel**: A new "Settings" tab allows users to configure the path to the 7-Zip executable.
- **Enhanced Exit Code Handling**: The operation log now provides clear, color-coded feedback based on the process exit code (Success, Warning, Fatal Error, etc.).
- **Dynamic Switch Controls**: The UI now dynamically renders appropriate controls (text inputs, dropdowns, path selectors) for each switch relevant to the selected command.

### Changed
- The main view now uses tabs for selecting a 7-Zip command, replacing the simple "Compress/Extract/Info" toggle.
- The version number was bumped to 2.0.0 to signify the major rewrite and feature expansion.

### Removed
- Removed the old, static `CompressForm.tsx` and `ExtractForm.tsx` components in favor of the new dynamic `CommandForm.tsx`.

## [1.2.0] - 2024-05-22

### Added
- **Application Logging Panel**: Added a new collapsible panel to display detailed application-level logs (DEBUG, INFO, WARNING, ERROR).
- **Log Filtering**: Users can filter the application logs by severity level.
- **File Logging**: Added an option in the logging panel to save application logs to a dated log file (`7zip-gui-YYYY-MM-DD.log`) in the executable's directory.
- A "Show/Hide Logs" button was added to the main header to toggle the new panel.

## [1.1.0] - 2024-05-21

### Added
- **Information Tab**: A new "Info" tab has been added to the main interface, now repurposed as a "Help" tab.
- **In-App Documentation**: Users can now view the `README`, `Functional Manual`, `Technical Manual`, and `Changelog` directly within the application.
- Markdown files are now included in the packaged application.

## [1.0.0] - 2024-05-20

### Added
- Initial release of the 7-Zip GUI.
- **Compression**: Support for creating `.7z` and `.zip` archives with various compression levels.
- **Extraction**: Support for extracting common archive formats.
- Real-time output logging and progress bar.
- Modern user interface built with React and Tailwind CSS.
- Project setup with Electron, TypeScript, and esbuild.