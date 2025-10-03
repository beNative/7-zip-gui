# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- No changes yet.

## [1.0.5] - 2025-09-08

### Changed
- Bumped application metadata and user-facing documentation to version 1.0.5 in preparation for release.

### Fixed
- Tidied release documentation to ensure the README and manuals reflect the current build details.

## [1.0.4] - 2025-09-07

### Added
- Added an "About" dialog accessible from the Settings page with application credits and copyright information.

## [1.0.2] - 2025-09-06

### Added
- Configured `electron-builder` for multi-platform builds, including Windows (32-bit & 64-bit), macOS, and Linux.

### Changed
- Synchronized version numbers across all documentation files (`README.md`, `CHANGELOG.md`, manuals) to ensure consistency.

### Fixed
- Resolved a series of complex configuration and environmental errors that were preventing successful application publishing.

## [1.0.1] - 2025-09-06

### Fixed
- Restored the native window frame and controls, fixing an issue where the minimize, maximize, and close buttons were missing on Windows.

## [1.0.0] - 2025-09-06

### Added
- **Initial Release**: First public version of the 7-Zip GUI.
- **Full Command Support**: UI for all major 7-Zip commands (`a`, `x`, `l`, `t`, etc.).
- **Dynamic UI**: Forms are dynamically generated based on a central schema for commands and their switches.
- **Live Command Preview**: See the exact CLI command before execution.
- **Automatic Updates**: Integrated `electron-updater` to check for and install new versions from GitHub Releases.
- **Modern Interface**: Features light and dark themes, a resizable log panel, and a comprehensive status bar.
- **In-App Documentation**: View README, manuals, and changelog from within the Help tab.
- **Multi-platform Builds**: Configured to build for Windows (32-bit & 64-bit), macOS, and Linux.
