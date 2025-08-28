import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { LogLevel, type LogMessage } from '../types';

// FIX: The `process` object is a global in Node.js environments like Electron's main process.
// Importing it explicitly was causing TypeScript to use a generic, incorrect type, leading to
// errors for properties like `.cwd()`, `.platform`, and `.resourcesPath`. Removing the incorrect
// import allows TypeScript to use the correct global type definitions.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let logStream: fs.WriteStream | null = null;
let isFileLoggingEnabled = false;

const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');

// --- Settings Management ---
async function readSettings() {
  try {
    const data = await fsp.readFile(SETTINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return defaults
    return { executablePath: '7z' };
  }
}

async function writeSettings(settings: object) {
  await fsp.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}


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
  
  mainWindow?.webContents.send('log-message', logEntry);
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

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "7-Zip GUI",
    backgroundColor: '#0f172a'
  });

  mainWindow = win;

  win.loadFile('index.html');
  logger(LogLevel.INFO, 'Application window created.');
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  logger(LogLevel.INFO, 'All windows closed. Quitting application.');
  if (logStream) {
    logStream.end();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// --- IPC Handlers ---
ipcMain.handle('get-settings', async () => {
  return await readSettings();
});

ipcMain.handle('set-settings', async (_, settings) => {
  await writeSettings(settings);
});

ipcMain.handle('select-file', async () => {
    logger(LogLevel.DEBUG, 'Requesting to select a file.');
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] });
    return canceled ? '' : filePaths[0];
});

ipcMain.handle('select-directory', async () => {
  logger(LogLevel.DEBUG, 'Requesting to select a directory.');
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return canceled ? '' : filePaths[0];
});

ipcMain.handle('get-doc', async (_, docName: string) => {
  try {
    const basePath = isDev ? process.cwd() : process.resourcesPath;
    const filePath = path.join(basePath, docName);
    const content = await fsp.readFile(filePath, 'utf-8');
    logger(LogLevel.DEBUG, `Successfully read document: ${docName}`);
    return content;
  } catch (error) {
    logger(LogLevel.ERROR, `Failed to read doc: ${docName}. Error: ${error}`);
    return `Error: Could not load document '${docName}'.`;
  }
});

ipcMain.handle('toggle-file-logging', (_, enabled: boolean) => {
  setFileLogging(enabled);
});

ipcMain.handle('run-7zip', (event, { command, args }) => {
  logger(LogLevel.INFO, `Executing: ${command} ${args.join(' ')}`);
  return new Promise((resolve) => {
    try {
      const sevenZip = spawn(command, args);
      
      let stdout = '';
      let stderr = '';

      sevenZip.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        event.sender.send('7zip-progress', chunk);
      });

      sevenZip.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        event.sender.send('7zip-progress', `STDERR: ${chunk}`);
      });

      sevenZip.on('close', (code) => {
        const result = {
            code,
            stdout,
            stderr,
            message: `Process exited with code ${code}.`
        };
        if (code === 0) {
          logger(LogLevel.INFO, '7-Zip process completed successfully.');
        } else {
          logger(LogLevel.ERROR, `7-Zip process exited with code ${code}. Stderr: ${stderr}`);
        }
        resolve(result);
      });

      sevenZip.on('error', (err) => {
        logger(LogLevel.ERROR, `Failed to spawn process. Error: ${err.message}`);
        event.sender.send('7zip-progress', `SPAWN ERROR: ${err.message}. Is '${command}' in your system's PATH?`);
        resolve({
            code: -1, // Custom code for spawn error
            stdout: '',
            stderr: err.message,
            message: `Failed to start 7-Zip process.`
        });
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger(LogLevel.ERROR, `Critical error trying to start 7-Zip process: ${errorMessage}`);
      event.sender.send('7zip-progress', `ERROR: Failed to start 7-Zip process. ${errorMessage}`);
      resolve({
          code: -1,
          stdout: '',
          stderr: errorMessage,
          message: `Failed to start 7-Zip process.`
      });
    }
  });
});