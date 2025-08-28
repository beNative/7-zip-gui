import type { SevenZipOptions, LogMessage } from './types';

export {};

declare global {
  interface Window {
    electronAPI: {
      // 7zip
      selectOutputDir: () => Promise<string>;
      run7zip: (options: SevenZipOptions) => Promise<string>;
      on7zipProgress: (callback: (log: string) => void) => () => void;
      // Docs
      getDoc: (docName: string) => Promise<string>;
      // Logging
      toggleFileLogging: (enabled: boolean) => Promise<void>;
      onLogMessage: (callback: (log: LogMessage) => void) => () => void;
    };
  }
}