import React, { useState, useEffect, useCallback } from 'react';
import { CommandKey, ViewMode, AppSettings, SevenZipResult, Theme } from './types';
import CommandTabs from './components/CommandTabs';
import CommandForm from './components/CommandForm';
import InfoView from './components/InfoView';
import SettingsView from './components/SettingsView';
import ResizableLogPanel from './components/ResizableLogPanel';

const App: React.FC = () => {
    const [view, setView] = useState<ViewMode>('a');
    const [operationLogs, setOperationLogs] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [exitCode, setExitCode] = useState<number | null>(null);
    const [settings, setSettings] = useState<AppSettings>({ executablePath: '7z', theme: 'dark' });

    useEffect(() => {
        const loadSettings = async () => {
            if (window.electronAPI) {
                const loadedSettings = await window.electronAPI.getSettings();
                setSettings(loadedSettings);
                applyTheme(loadedSettings.theme);
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
        }
        setSettings(newSettings);
        if (window.electronAPI) {
            window.electronAPI.setSettings(newSettings);
        }
    };

    const handleOperationLog = useCallback((log: string) => {
        const progressMatch = log.match(/(\d+)%/);
        if (progressMatch) {
            setProgress(parseInt(progressMatch[1], 10));
        }
        setOperationLogs(prevLogs => [...prevLogs, log]);
    }, []);

    useEffect(() => {
        if (window.electronAPI) {
            const removeListener = window.electronAPI.on7zipProgress(handleOperationLog);
            return () => removeListener();
        } else {
            const errorMessage = "Electron API not found. Ensure the app is running in an Electron environment and the preload script is correctly configured.";
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
            />
        );
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {/* Custom Title Bar */}
            <div className="h-8 w-full" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}></div>

            <div className="flex-grow flex flex-col p-4 pt-0 sm:p-6 sm:pt-0 overflow-hidden">
                <div className="w-full max-w-5xl mx-auto flex flex-col flex-grow bg-white dark:bg-slate-800 rounded-xl shadow-2xl shadow-blue-500/10 ring-1 ring-slate-200 dark:ring-slate-700">
                    <header className="p-6">
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">7-Zip GUI v2.1</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">The complete front-end for the 7-Zip CLI.</p>
                    </header>

                    <main className="px-6 flex-grow flex flex-col overflow-hidden">
                        <CommandTabs currentView={view} onViewChange={setView} />
                        <div className="mt-6 flex-grow overflow-y-auto pr-2">
                           {renderView()}
                        </div>
                    </main>
                    
                    <footer className="p-6 pt-0">
                        <p className="text-xs text-slate-500 dark:text-slate-600 mt-4 text-center">
                           Note: This application requires a `7z` compatible executable. Configure the path in the Settings tab.
                        </p>
                    </footer>
                </div>
            </div>
            
            <ResizableLogPanel 
                operationLogs={operationLogs}
                progress={progress}
                isRunning={isRunning}
                exitCode={exitCode}
                isCommandView={view !== 'Help' && view !== 'Settings'}
            />
        </div>
    );
};

export default App;