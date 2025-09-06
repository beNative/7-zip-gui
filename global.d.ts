import type { SevenZipOptions, SevenZipResult, LogMessage, AppSettings, LogLevel, FileEntry } from './types';

export {};

declare global {
  interface Window {
    electronAPI: {
      // Settings
      getSettings: () => Promise<AppSettings>;
      setSettings: (settings: AppSettings) => Promise<void>;
      
      // File System
      selectFile: () => Promise<string>;
      selectFiles: () => Promise<string[]>;
      selectDirectory: () => Promise<string>;
      listDirectory: (path: string) => Promise<{ items?: FileEntry[]; error?: string }>;

      // 7zip
      run7zip: (options: SevenZipOptions) => Promise<SevenZipResult>;
      on7zipProgress: (callback: (log: string) => void) => () => void;
      
      // Docs
      getDoc: (docName: string) => Promise<string>;
      
      // Logging
      log: (level: LogLevel, message: string) => void;
      toggleFileLogging: (enabled: boolean) => Promise<void>;
      onLogMessage: (callback: (log: LogMessage) => void) => () => void;
    };
  }
}