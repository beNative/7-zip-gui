# Technical Manual: 7-Zip GUI v1.0.2

This document outlines the technical architecture of the 7-Zip GUI application, which is designed to be a flexible and extensible front-end for the 7-Zip CLI.

## Technology Stack

- **Electron**: Framework for building cross-platform desktop applications.
- **React**: A JavaScript library for building the user interface.
- **TypeScript**: Provides static typing for code quality and maintainability.
- **esbuild**: A fast JavaScript bundler and minifier.
- **Tailwind CSS**: A utility-first CSS framework for styling.

## Core Architecture: Schema-Driven UI

The application's key architectural pattern is its schema-driven UI. Instead of hard-coding forms for each 7-Zip command, the entire user interface for command configuration is dynamically generated from a central schema.

### 1. The Schema (`constants/schema.ts`)

This file is the single source of truth for the application's core logic. It defines:
- **Commands**: An object detailing each supported 7-Zip command (`a`, `x`, `l`, etc.). Each command entry specifies its description and a list of applicable `switches`.
- **Switches**: A comprehensive object defining every supported 7-Zip switch (e.g., `-t`, `-o`, `-p`). Each switch entry specifies:
    - `id`: The CLI flag (e.g., `-t`).
    - `label`: A human-readable name.
    - `description`: A tooltip explaining its purpose.
    - `control`: The type of UI element to render (e.g., `Select`, `TextInput`, `PathInput`).
    - `options`, `defaultValue`, etc.: Metadata needed to render and manage the control's state.

This approach makes the application highly maintainable. To add a new switch to a command, one only needs to define it in the `switches` object and add its ID to the command's `switches` array.

### 2. Dynamic Form Rendering

- **`CommandForm.tsx`**: This component receives the currently selected `commandKey`. It looks up the command in the schema and dynamically renders a `SwitchControl` component for each applicable switch. It uses a `useReducer` hook (`useCommandState.ts`) to manage the complex state of all switch values.
- **`SwitchControl.tsx`**: This is a versatile component that takes a switch's schema as a prop. It contains a `switch` statement that renders the correct input control (e.g., `<input type="text">`, `<select>`, a checkbox) based on the `control` type defined in the schema.

### 3. Command Building and Execution

- **`utils/commandBuilder.ts`**: This utility function is responsible for translating the UI state into an executable command. It takes the selected command, the current state of all switches, and the executable path. It iterates through the state, and for each switch with a value, it formats the arguments correctly (e.g., `-tzip`, `-o"C:\Output Folder"`) and adds them to an array.
- **`electron/main.ts`**: The `run-7zip` IPC handler receives the executable path and the argument array. It uses Node.js's `spawn` to execute the 7-Zip process, streams `stdout` and `stderr` back to the renderer for the live log, and returns the final exit code upon completion.

This decoupled architecture ensures that the UI, state management, and command generation logic are all driven by the central schema, leading to a robust and easily extensible system.