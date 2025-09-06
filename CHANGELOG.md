# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- No changes yet.

## [1.0.2] - 2024-05-26

### Added
- Configured `electron-builder` for multi-platform builds, including Windows (32-bit & 64-bit), macOS, and Linux.

### Changed
- Synchronized version numbers across all documentation files (`README.md`, `CHANGELOG.md`, manuals) to ensure consistency.

### Fixed
- Resolved a series of complex configuration and environmental errors that were preventing successful application publishing.

## [1.0.1] - 2024-05-25

### Fixed
- Restored the native window frame and controls, fixing an issue where the minimize, maximize, and close buttons were missing on Windows.

## [1.0.0] - 2024-05-20

### Added
- **Initial Release**: First public version of the 7-Zip GUI.
- **Full Command Support**: UI for all major 7-Zip commands (`a`, `x`, `l`, `t`, etc.).
- **Dynamic UI**: Forms are dynamically generated based on a central schema for commands and their switches.
- **Live Command Preview**: See the exact CLI command before execution.
- **Automatic Updates**: Integrated `electron-updater` to check for and install new versions from GitHub Releases.
- **Modern Interface**: Features light and dark themes, a resizable log panel, and a comprehensive status bar.
- **In-App Documentation**: View README, manuals, and changelog from within the Help tab.
- **Multi-platform Builds**: Configured to build for Windows (32-bit & 64-bit), macOS, and Linux.