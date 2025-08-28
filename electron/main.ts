
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
// FIX: Import LogLevel as a value to use its enum members.
import { LogLevel, type LogMessage } from '../types';

// Convert __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
// FIX: Corrected typo from WriteSteam to WriteStream.
let logStream: fs.WriteStream | null = null;
let isFileLoggingEnabled = false;

// --- Logger Implementation ---
const getLogFilePath = () => {
  // FIX: Use global.process to avoid type conflicts with 'process'.
  const logDir = isDev ? global.process.cwd() : path.dirname(app.getPath('exe'));
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
  
  // Send log to renderer process
  mainWindow?.webContents.send('log-message', logEntry);
  
  // Also log to console for debugging main process
  console.log(formattedMessage.trim());
};

const setFileLogging = (enabled: boolean) => {
  if (enabled && !logStream) {
    const logPath = getLogFilePath();
    logStream = fs.createWriteStream(logPath, { flags: 'a' });
    isFileLoggingEnabled = true;
    // FIX: Use LogLevel enum instead of string literal.
    logger(LogLevel.INFO, `File logging started. Log file: ${logPath}`);
  } else if (!enabled && logStream) {
    logStream.end();
    logStream = null;
    isFileLoggingEnabled = false;
    // We can't log this to the file, but we can send it to the UI
    // FIX: Use LogLevel enum instead of string literal.
    logger(LogLevel.INFO, 'File logging stopped.');
  }
};
// --- End Logger ---

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "7-Zip GUI",
    backgroundColor: '#0f172a' // Corresponds to bg-slate-900
  });

  mainWindow = win; // Store reference for logger

  win.loadFile('index.html');
  // FIX: Use LogLevel enum instead of string literal.
  logger(LogLevel.INFO, 'Application window created.');
  // Uncomment to open DevTools on start
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // FIX: Use LogLevel enum instead of string literal.
  logger(LogLevel.INFO, 'All windows closed. Quitting application.');
  if (logStream) {
    logStream.end();
  }
  // FIX: Use global.process to avoid type conflicts with 'process'.
  if (global.process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('select-output-dir', async () => {
  // FIX: Use LogLevel enum instead of string literal.
  logger(LogLevel.DEBUG, 'Requesting to select output directory.');
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (canceled) {
    // FIX: Use LogLevel enum instead of string literal.
    logger(LogLevel.DEBUG, 'Output directory selection was cancelled.');
    return '';
  } else {
    // FIX: Use LogLevel enum instead of string literal.
    logger(LogLevel.INFO, `Output directory selected: ${filePaths[0]}`);
    return filePaths[0];
  }
});

ipcMain.handle('get-doc', async (_, docName: string) => {
  try {
    // FIX: Use global.process to avoid type conflicts with 'process'.
    const basePath = isDev ? global.process.cwd() : global.process.resourcesPath;
    const filePath = path.join(basePath, docName);
    const content = await fsp.readFile(filePath, 'utf-8');
    // FIX: Use LogLevel enum instead of string literal.
    logger(LogLevel.DEBUG, `Successfully read document: ${docName}`);
    return content;
  } catch (error) {
    // FIX: Use LogLevel enum instead of string literal.
    logger(LogLevel.ERROR, `Failed to read doc: ${docName}. Error: ${error}`);
    return `Error: Could not load document '${docName}'.`;
  }
});

ipcMain.handle('toggle-file-logging', (_, enabled: boolean) => {
  setFileLogging(enabled);
});

ipcMain.handle('run-7zip', (event, { command, args }) => {
  // FIX: Use LogLevel enum instead of string literal.
  logger(LogLevel.INFO, `Executing 7-Zip command: ${command} ${args.join(' ')}`);
  return new Promise((resolve, reject) => {
    try {
      const sevenZip = spawn(command, args);
      
      let errorOutput = '';

      sevenZip.stdout.on('data', (data) => {
        event.sender.send('7zip-progress', data.toString());
      });

      sevenZip.stderr.on('data', (data) => {
        const stderrStr = data.toString();
        event.sender.send('7zip-progress', `ERROR: ${stderrStr}`);
        errorOutput += stderrStr;
      });

      sevenZip.on('close', (code) => {
        if (code === 0) {
          // FIX: Use LogLevel enum instead of string literal.
          logger(LogLevel.INFO, '7-Zip process completed successfully.');
          resolve(`7-Zip process completed successfully with code ${code}.`);
        } else {
          // FIX: Use LogLevel enum instead of string literal.
          logger(LogLevel.ERROR, `7-Zip process exited with code ${code}. Stderr: ${errorOutput}`);
          reject(new Error(`7-Zip process exited with code ${code}. Details: ${errorOutput}`));
        }
      });

      sevenZip.on('error', (err) => {
        // FIX: Use LogLevel enum instead of string literal.
        logger(LogLevel.ERROR, `Failed to spawn 7-Zip process. Error: ${err.message}`);
        event.sender.send('7zip-progress', `SPAWN ERROR: ${err.message}. Is '7z.exe' in your system's PATH?`);
        reject(err);
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      // FIX: Use LogLevel enum instead of string literal.
      logger(LogLevel.ERROR, `Critical error trying to start 7-Zip process: ${errorMessage}`);
      event.sender.send('7zip-progress', `ERROR: Failed to start 7-Zip process. ${errorMessage}`);
      reject(new Error(`Failed to start 7-Zip process. ${errorMessage}`));
    }
  });
});
