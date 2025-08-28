import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import type { SevenZipOptions, LogMessage } from '../types';

contextBridge.exposeInMainWorld('electronAPI', {
  // 7zip operations
  selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
  run7zip: (options: SevenZipOptions) => ipcRenderer.invoke('run-7zip', options),
  on7zipProgress: (callback: (log: string) => void) => {
    const listener = (_event: IpcRendererEvent, log: string) => callback(log);
    ipcRenderer.on('7zip-progress', listener);
    return () => ipcRenderer.removeListener('7zip-progress', listener);
  },

  // Documentation
  getDoc: (docName: string) => ipcRenderer.invoke('get-doc', docName),

  // Logging
  toggleFileLogging: (enabled: boolean) => ipcRenderer.invoke('toggle-file-logging', enabled),
  onLogMessage: (callback: (log: LogMessage) => void) => {
    const listener = (_event: IpcRendererEvent, log: LogMessage) => callback(log);
    ipcRenderer.on('log-message', listener);
    return () => ipcRenderer.removeListener('log-message', listener);
  }
});