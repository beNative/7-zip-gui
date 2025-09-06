import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import { spawn } from 'child_process';
import { LogLevel, type LogMessage, type SevenZipOptions, type SevenZipResult, FileEntry } from '../types';

// FIX: The 'process' object was incorrectly typed. Using a namespace import `import * as process from 'process'` to ensure the correct NodeJS.Process type is loaded, which resolves errors on `process.cwd()` and `process.platform`.
import * as process from 'process';

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let logStream: fs.WriteStream | null = null;
let isFileLoggingEnabled = false;

const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');

// --- Logger Implementation ---
const getLogFilePath = () => {
  const logDir = isDev ? process.cwd() : path.dirname(app.getPath('exe'));
  const date = new Date().toISOString().split('T')[0];
  return path.join(logDir, `7zip-gui-${date}.log`);
};

const logger = (level: LogLevel, message: string) => {
  const timestamp = new Date().toISOString();
  const logEntry: LogMessage = { level, message, timestamp };
  
  const formattedMessage = `${timestamp} [${level}] ${message}\n`;
  
  if (isFileLoggingEnabled && logStream) {
    logStream.write(formattedMessage);
  }
  
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('log-message', logEntry);
  }
  console.log(formattedMessage.trim());
};

const setFileLogging = (enabled: boolean) => {
  if (enabled && !logStream) {
    const logPath = getLogFilePath();
    logStream = fs.createWriteStream(logPath, { flags: 'a' });
    isFileLoggingEnabled = true;
    logger(LogLevel.INFO, `File logging started. Log file: ${logPath}`);
  } else if (!enabled && logStream) {
    logStream.end();
    logStream = null;
    isFileLoggingEnabled = false;
    logger(LogLevel.INFO, 'File logging stopped.');
  }
};
// --- End Logger ---


// --- Settings Management ---
async function readSettings() {
  logger(LogLevel.DEBUG, `Reading settings from ${SETTINGS_PATH}`);
  try {
    const data = await fsp.readFile(SETTINGS_PATH, 'utf-8');
    const saved = JSON.parse(data);
    const settings = { executablePath: '7z', theme: 'dark', iconSet: 'heroicons', ...saved };
    logger(LogLevel.INFO, `Settings loaded successfully.`);
    return settings;
  } catch (error) {
    logger(LogLevel.WARNING, `Failed to read settings file, returning defaults. Error: ${error}`);
    return { executablePath: '7z', theme: 'dark', iconSet: 'heroicons' };
  }
}

async function writeSettings(settings: object) {
  logger(LogLevel.INFO, `Writing settings to ${SETTINGS_PATH}`);
  try {
    await fsp.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    logger(LogLevel.DEBUG, `Settings saved successfully.`);
  } catch (error) {
    logger(LogLevel.ERROR, `Failed to write settings. Error: ${error}`);
  }
}

// --- Main Window Creation ---
const createWindow = async () => {
    logger(LogLevel.INFO, 'Creating main window...');
    
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        minWidth: 800,
        minHeight: 600,
        title: '7-Zip GUI',
        backgroundColor: '#111827', // dark slate-900
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        frame: false,
        titleBarStyle: 'hidden',
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
    
    // Open the DevTools if in dev mode
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    logger(LogLevel.INFO, 'Main window created.');
};

// --- IPC Handlers ---
function setupIpcHandlers() {
    logger(LogLevel.DEBUG, 'Setting up IPC handlers.');
    // Settings
    ipcMain.handle('get-settings', readSettings);
    ipcMain.handle('set-settings', (_event, settings) => writeSettings(settings));

    // File System
    ipcMain.handle('select-file', async () => {
        if (!mainWindow) return;
        const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'] });
        return result.filePaths[0];
    });
    ipcMain.handle('select-files', async () => {
        if (!mainWindow) return;
        const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile', 'openDirectory', 'multiSelections'] });
        return result.filePaths;
    });
    ipcMain.handle('select-directory', async () => {
        if (!mainWindow) return;
        const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
        return result.filePaths[0];
    });
     ipcMain.handle('list-directory', async (_event, dirPath: string): Promise<{ items?: FileEntry[]; error?: string }> => {
        try {
            const targetPath = dirPath || app.getPath('home');
            const names = await fsp.readdir(targetPath);
            const files: (FileEntry | null)[] = await Promise.all(
                names.map(async (name) => {
                    const filePath = path.join(targetPath, name);
                    try {
                        const stats = await fsp.stat(filePath);
                        return {
                            name,
                            path: filePath,
                            isDirectory: stats.isDirectory(),
                            size: stats.size,
                            mtime: stats.mtime.getTime(),
                        };
                    } catch {
                        // Permissions error or broken symlink
                        return null;
                    }
                })
            );

            const validFiles = files.filter((file): file is FileEntry => file !== null);
            
            // Sort directories first, then files, both alphabetically
            validFiles.sort((a, b) => {
                if (a.isDirectory !== b.isDirectory) {
                    return a.isDirectory ? -1 : 1;
                }
                return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
            });
            return { items: validFiles };
        } catch (error: any) {
            const errorMessage = `Failed to list directory '${dirPath}': ${error.message}`;
            logger(LogLevel.ERROR, errorMessage);
            return { error: errorMessage };
        }
    });

    // 7-Zip
    ipcMain.handle('run-7zip', async (_event, options: SevenZipOptions): Promise<SevenZipResult> => {
        logger(LogLevel.INFO, `Executing: ${options.command} ${options.args.join(' ')}`);
        return new Promise((resolve) => {
            const child = spawn(options.command, options.args, { shell: true });
            let stdout = '';
            let stderr = '';

            const sendProgress = (chunk: any) => {
                const data = chunk.toString();
                if (mainWindow) {
                    mainWindow.webContents.send('7zip-progress', data);
                }
                logger(LogLevel.DEBUG, `7z output: ${data.trim()}`);
            };

            child.stdout.on('data', (chunk) => {
                sendProgress(chunk);
                stdout += chunk.toString();
            });
            child.stderr.on('data', (chunk) => {
                sendProgress(chunk);
                stderr += chunk.toString();
            });

            child.on('close', (code) => {
                const message = `Process exited with code ${code}.`;
                logger(LogLevel.INFO, message);
                resolve({ code, stdout, stderr, message });
            });

            child.on('error', (err) => {
                const message = `Failed to start process: ${err.message}`;
                logger(LogLevel.ERROR, message);
                resolve({ code: -1, stdout: '', stderr: err.message, message });
            });
        });
    });

    // Docs
    ipcMain.handle('get-doc', async (_event, docName: string) => {
        const basePath = isDev ? app.getAppPath() : path.dirname(app.getAppPath());
        const docPath = path.join(basePath, docName);
        logger(LogLevel.DEBUG, `Reading doc from: ${docPath}`);
        try {
            return await fsp.readFile(docPath, 'utf-8');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger(LogLevel.ERROR, `Failed to read doc ${docName}: ${errorMessage}`);
            return `Error loading ${docName}. Path: ${docPath}`;
        }
    });

    // Logging
    ipcMain.on('log-from-renderer', (_event, log: {level: LogLevel, message: string}) => {
        logger(log.level, `[Renderer] ${log.message}`);
    });
    ipcMain.handle('toggle-file-logging', (_event, enabled: boolean) => {
        setFileLogging(enabled);
    });
}


// --- App Lifecycle ---
app.whenReady().then(async () => {
    // Initial settings load to configure logging early
    const settings = await readSettings();
    if ((settings as any).enableFileLogging) {
        setFileLogging(true);
    }
    
    setupIpcHandlers();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    logger(LogLevel.INFO, 'Application quitting.');
    if (logStream) {
        logStream.end();
    }
});