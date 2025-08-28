import React, { useState, useEffect, useCallback } from 'react';
import { CommandKey, ViewMode, AppSettings, SevenZipResult } from './types';
import CommandTabs from './components/CommandTabs';
import CommandForm from './components/CommandForm';
import LogView from './components/LogView';
import InfoView from './components/InfoView';
import SettingsView from './components/SettingsView';
import LoggingPanel from './components/LoggingPanel';

const App: React.FC = () => {
    const [view, setView] = useState<ViewMode>('a');
    const [operationLogs, setOperationLogs] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [exitCode, setExitCode] = useState<number | null>(null);
    const [isLogPanelVisible, setLogPanelVisible] = useState(false);
    const [settings, setSettings] = useState<AppSettings>({ executablePath: '7z' });

    useEffect(() => {
        const loadSettings = async () => {
            if (window.electronAPI) {
                const loadedSettings = await window.electronAPI.getSettings();
                setSettings(loadedSettings);
            }
        };
        loadSettings();
    }, []);

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
            return <SettingsView settings={settings} onSettingsChange={setSettings} />;
        }
        if (view === 'Help') {
            return <InfoView />;
        }
        // It's a CommandKey
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
        <div className="min-h-screen flex flex-col p-4 sm:p-6 bg-slate-900">
            <div className="w-full max-w-4xl mx-auto flex flex-col">
                <div className="bg-slate-800 rounded-xl shadow-2xl shadow-cyan-500/10 ring-1 ring-slate-700">
                    <header className="p-6 border-b border-slate-700 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-cyan-400">7-Zip GUI v2</h1>
                            <p className="text-slate-400 mt-1">The complete front-end for the 7-Zip CLI.</p>
                        </div>
                        <button 
                          onClick={() => setLogPanelVisible(!isLogPanelVisible)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors duration-200 bg-slate-700 text-slate-300 hover:bg-slate-600"
                        >
                            {isLogPanelVisible ? 'Hide App Logs' : 'Show App Logs'}
                        </button>
                    </header>

                    <main className="p-6">
                        <CommandTabs currentView={view} onViewChange={setView} />
                        <div className="mt-6">
                            {renderView()}
                        </div>
                    </main>
                    
                    {view !== 'Help' && view !== 'Settings' && (
                      <footer className="p-6 border-t border-slate-700">
                          <LogView logs={operationLogs} progress={progress} isRunning={isRunning} exitCode={exitCode}/>
                      </footer>
                    )}
                </div>
                 <p className="text-xs text-slate-600 mt-4 text-center">
                    Note: This application requires a `7z` compatible executable. Configure the path in the Settings tab.
                </p>
            </div>
            
            {isLogPanelVisible && <LoggingPanel />}
        </div>
    );
};

export default App;