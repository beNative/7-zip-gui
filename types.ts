

// --- Core Application State ---
export type CommandKey = 'a' | 'b' | 'd' | 'e' | 'h' | 'i' | 'l' | 'rn' | 't' | 'u' | 'x';
export type ViewMode = CommandKey | 'Settings' | 'Help';
export type Theme = 'light' | 'dark';
export type IconSet = 'heroicons' | 'lucide';

export interface AppSettings {
    executablePath: string;
    theme: Theme;
    iconSet: IconSet;
}

// --- 7-Zip Process Communication ---
export interface SevenZipOptions {
    command: string; // The executable path
    args: string[];
}

export interface SevenZipResult {
    code: number | null;
    stdout: string;
    stderr: string;
    message: string;
}

// --- Application Logging ---
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
}

export interface LogMessage {
    level: LogLevel;
    timestamp: string;
    message: string;
}

// --- File Browser ---
export interface FileEntry {
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
    mtime: number; // Milliseconds since epoch
}


// --- Command & Switch Schema ---
export enum SwitchControlType {
    Checkbox,       // -swn
    TextInput,      // -p
    Select,         // -t
    PathInput,      // -o
    MultiPathInput, // main archive/files
    KeyValue,       // -m (e.g., x=9)
}

export interface SwitchOption {
    value: string;
    label: string;
}

export interface SwitchSchema {
    id: string; // The switch itself, e.g., "-t"
    label: string;
    description: string;
    control: SwitchControlType;
    // For Select control
    options?: SwitchOption[];
    // For PathInput control
    pathType?: 'file' | 'directory';
    // Default value for the control state
    defaultValue?: any;
}

export interface CommandSchema {
    key: CommandKey;
    label: string;
    description: string;
    switches: string[]; // List of switch IDs applicable to this command
}

// --- Form State ---
export interface CommandState {
    [switchId: string]: any;
}

export type CommandStatePayload = {
    switchId: string;
    value: any;
};

// FIX: Added missing OperationMode enum for legacy components.
export enum OperationMode {
    Compress,
    Extract,
    Info,
}