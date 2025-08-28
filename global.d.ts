import type { SevenZipOptions, SevenZipResult, LogMessage, AppSettings } from './types';

export {};

declare global {
  interface Window {
    electronAPI: {
      // Settings
      getSettings: () => Promise<AppSettings>;
      setSettings: (settings: AppSettings) => Promise<void>;
      
      // File System
      selectFile: () => Promise<string>;
      selectDirectory: () => Promise<string>;

      // 7zip
      run7zip: (options: SevenZipOptions) => Promise<SevenZipResult>;
      on7zipProgress: (callback: (log: string) => void) => () => void;
      
      // Docs
      getDoc: (docName: string) => Promise<string>;
      
      // Logging
      toggleFileLogging: (enabled: boolean) => Promise<void>;
      onLogMessage: (callback: (log: LogMessage) => void) => () => void;
    };
  }
}