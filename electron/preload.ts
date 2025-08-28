import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import type { SevenZipOptions, SevenZipResult, LogMessage, LogLevel } from '../types';

contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: object) => ipcRenderer.invoke('set-settings', settings),
  
  // File System
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  // 7zip operations
  run7zip: (options: SevenZipOptions) => ipcRenderer.invoke('run-7zip', options),
  on7zipProgress: (callback: (log: string) => void) => {
    const listener = (_event: IpcRendererEvent, log: string) => callback(log);
    ipcRenderer.on('7zip-progress', listener);
    return () => ipcRenderer.removeListener('7zip-progress', listener);
  },

  // Documentation
  getDoc: (docName: string) => ipcRenderer.invoke('get-doc', docName),

  // Logging
  log: (level: LogLevel, message: string) => ipcRenderer.send('log-from-renderer', { level, message }),
  toggleFileLogging: (enabled: boolean) => ipcRenderer.invoke('toggle-file-logging', enabled),
  onLogMessage: (callback: (log: LogMessage) => void) => {
    const listener = (_event: IpcRendererEvent, log: LogMessage) => callback(log);
    ipcRenderer.on('log-message', listener);
    return () => ipcRenderer.removeListener('log-message', listener);
  }
});