# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2024-05-22

### Added
- **Application Logging Panel**: Added a new collapsible panel to display detailed application-level logs (DEBUG, INFO, WARNING, ERROR).
- **Log Filtering**: Users can filter the application logs by severity level.
- **File Logging**: Added an option in the logging panel to save application logs to a dated log file (`7zip-gui-YYYY-MM-DD.log`) in the executable's directory.
- A "Show/Hide Logs" button was added to the main header to toggle the new panel.

## [1.1.0] - 2024-05-21

### Added
- **Information Tab**: A new "Info" tab has been added to the main interface.
- **In-App Documentation**: Users can now view the `README`, `Functional Manual`, `Technical Manual`, and `Changelog` directly within the application via the Info tab.
- Markdown files are now included in the packaged application.

## [1.0.0] - 2024-05-20

### Added
- Initial release of the 7-Zip GUI.
- **Compression**: Support for creating `.7z` and `.zip` archives with various compression levels.
- **Extraction**: Support for extracting common archive formats.
- Real-time output logging and progress bar.
- Modern user interface built with React and Tailwind CSS.
- Project setup with Electron, TypeScript, and esbuild.