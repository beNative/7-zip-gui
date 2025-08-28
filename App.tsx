import React, { useState, useEffect, useCallback } from 'react';
import { OperationMode } from './types';
import ActionTabs from './components/ActionTabs';
import CompressForm from './components/CompressForm';
import ExtractForm from './components/ExtractForm';
import LogView from './components/LogView';
import InfoView from './components/InfoView';
import LoggingPanel from './components/LoggingPanel';

const App: React.FC = () => {
    const [mode, setMode] = useState<OperationMode>(OperationMode.Compress);
    const [operationLogs, setOperationLogs] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isLogPanelVisible, setLogPanelVisible] = useState(false);

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
            // This is an app-level error, so we can't log it to the main process logger.
            // But we can show it in the UI.
            setOperationLogs(prev => [...prev, `ERROR: ${errorMessage}`]);
        }
    }, [handleOperationLog]);

    const handleStart = () => {
        setOperationLogs(['Operation started...']);
        setIsRunning(true);
        setProgress(0);
    };

    const handleFinish = (result: string, success: boolean) => {
        setOperationLogs(prev => [...prev, `\n--- OPERATION FINISHED ---`, result]);
        if(success) setProgress(100);
        setIsRunning(false);
    };


    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-6 bg-slate-900">
            <div className="w-full max-w-2xl mx-auto flex flex-col">
                <div className="bg-slate-800 rounded-xl shadow-2xl shadow-cyan-500/10 ring-1 ring-slate-700">
                    <header className="p-6 border-b border-slate-700 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-cyan-400">7-Zip GUI</h1>
                            <p className="text-slate-400 mt-1">A simple interface for 7-Zip operations.</p>
                        </div>
                        <button 
                          onClick={() => setLogPanelVisible(!isLogPanelVisible)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors duration-200 bg-slate-700 text-slate-300 hover:bg-slate-600"
                        >
                            {isLogPanelVisible ? 'Hide Logs' : 'Show Logs'}
                        </button>
                    </header>

                    <main className="p-6">
                        <ActionTabs currentMode={mode} onModeChange={setMode} />
                        <div className="mt-6">
                            {mode === OperationMode.Compress && (
                                <CompressForm 
                                    onStart={handleStart}
                                    onFinish={handleFinish}
                                    isRunning={isRunning} 
                                />
                            )}
                            {mode === OperationMode.Extract && (
                                <ExtractForm 
                                    onStart={handleStart} 
                                    onFinish={handleFinish}
                                    isRunning={isRunning}
                                />
                            )}
                            {mode === OperationMode.Info && <InfoView />}
                        </div>
                    </main>
                    
                    {mode !== OperationMode.Info && (
                      <footer className="p-6 border-t border-slate-700">
                          <LogView logs={operationLogs} progress={progress} isRunning={isRunning} />
                      </footer>
                    )}
                </div>
                 <p className="text-xs text-slate-600 mt-4 text-center">
                    Note: This application requires `7z.exe` to be available in your system's PATH.
                </p>
            </div>
            
            {isLogPanelVisible && <LoggingPanel />}
        </div>
    );
};

export default App;