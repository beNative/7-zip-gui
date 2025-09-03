import React, { useState, useEffect, useCallback } from 'react';
import { CommandKey, ViewMode, AppSettings, SevenZipResult, Theme, LogLevel } from './types';
import CommandTabs from './components/CommandTabs';
import CommandForm from './components/CommandForm';
import InfoView from './components/InfoView';
import SettingsView from './components/SettingsView';
import ResizableLogPanel from './components/ResizableLogPanel';
import StatusBar from './components/StatusBar';

// Helper to log from renderer process
const log = (level: LogLevel, message: string) => {
    window.electronAPI?.log(level, message);
};

const getStatusText = (isRunning: boolean, exitCode: number | null): string => {
    if (isRunning) return 'Running...';
    if (exitCode === null) return 'Idle';
    if (exitCode === 0) return 'Success';
    if (exitCode > 0) return 'Error';
    if (exitCode < 0) return 'Fatal Error';
    return 'Finished';
}

const App: React.FC = () => {
    const [view, setView] = useState<ViewMode>('a');
    const [operationLogs, setOperationLogs] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [exitCode, setExitCode] = useState<number | null>(null);
    const [settings, setSettings] = useState<AppSettings>({ executablePath: '7z', theme: 'dark', iconSet: 'heroicons' });
    const [isLogPanelVisible, setIsLogPanelVisible] = useState(true);
    
    const handleViewChange = (newView: ViewMode) => {
        log(LogLevel.INFO, `Navigating to view: ${newView}`);
        setView(newView);
    };

    useEffect(() => {
        log(LogLevel.INFO, "Application component mounted. Initializing...");
        const loadSettings = async () => {
            if (window.electronAPI) {
                const loadedSettings = await window.electronAPI.getSettings();
                setSettings(loadedSettings);
                applyTheme(loadedSettings.theme);
                log(LogLevel.INFO, `Settings loaded. Theme: ${loadedSettings.theme}, Executable: ${loadedSettings.executablePath}`);
            } else {
                log(LogLevel.ERROR, "Electron API not found on mount.");
            }
        };
        loadSettings();
    }, []);
    
    const applyTheme = (theme: Theme) => {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
        }
    };

    const handleSettingsChange = (newSettings: AppSettings) => {
        if (newSettings.theme !== settings.theme) {
            applyTheme(newSettings.theme);
            log(LogLevel.INFO, `Theme changed to ${newSettings.theme}`);
        }
        if (newSettings.executablePath !== settings.executablePath) {
            log(LogLevel.INFO, `Executable path changed to ${newSettings.executablePath}`);
        }
        setSettings(newSettings);
        window.electronAPI?.setSettings(newSettings);
    };

    const handleOperationLog = useCallback((logChunk: string) => {
        const progressMatch = logChunk.match(/(\d+)%/);
        if (progressMatch) {
            setProgress(parseInt(progressMatch[1], 10));
        }
        setOperationLogs(prevLogs => [...prevLogs, logChunk]);
    }, []);

    useEffect(() => {
        if (window.electronAPI) {
            const removeListener = window.electronAPI.on7zipProgress(handleOperationLog);
            return () => removeListener();
        } else {
            const errorMessage = "Electron API not found. Progress updates unavailable.";
            console.error(errorMessage);
            setOperationLogs(prev => [...prev, `ERROR: ${errorMessage}`]);
        }
    }, [handleOperationLog]);

    const handleStart = () => {
        setOperationLogs(['Operation started...']);
        setIsRunning(true);
        setProgress(0);
        setExitCode(null);
    };

    const handleFinish = (result: SevenZipResult) => {
        setOperationLogs(prev => [...prev, `\n--- OPERATION FINISHED ---`, result.message]);
        setExitCode(result.code);
        if(result.code === 0) setProgress(100);
        setIsRunning(false);
    };

    const renderView = () => {
        if (view === 'Settings') {
            return <SettingsView settings={settings} onSettingsChange={handleSettingsChange} />;
        }
        if (view === 'Help') {
            return <InfoView />;
        }
        return (
            <CommandForm
                commandKey={view as CommandKey}
                onStart={handleStart}
                onFinish={handleFinish}
                isRunning={isRunning}
                executablePath={settings.executablePath}
                iconSet={settings.iconSet}
            />
        );
    };

    const statusText = getStatusText(isRunning, exitCode);

    return (
        <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300 overflow-hidden">
            <div className="h-8 w-full flex-shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}></div>

            <div className="flex-grow flex flex-col px-4 pb-0 overflow-hidden">
                <main className="px-2 flex-grow flex flex-col overflow-hidden">
                    <CommandTabs currentView={view} onViewChange={handleViewChange} />
                    <div className="flex-grow overflow-y-auto pr-2 pb-4 bg-white dark:bg-slate-800 p-4 rounded-b-lg border-x border-b border-slate-200 dark:border-slate-700">
                        {renderView()}
                    </div>
                </main>
            </div>
            
            <ResizableLogPanel 
                isVisible={isLogPanelVisible}
                operationLogs={operationLogs}
                progress={progress}
                isRunning={isRunning}
                exitCode={exitCode}
                isCommandView={view !== 'Help' && view !== 'Settings'}
                iconSet={settings.iconSet}
            />

            <StatusBar 
                status={statusText}
                exitCode={exitCode}
                executablePath={settings.executablePath}
                isLogPanelVisible={isLogPanelVisible}
                onToggleLogs={() => setIsLogPanelVisible(p => !p)}
                iconSet={settings.iconSet}
            />
        </div>
    );
};

export default App;