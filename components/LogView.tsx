import React, { useRef, useEffect } from 'react';

interface LogViewProps {
    logs: string[];
    progress: number;
    isRunning: boolean;
    exitCode: number | null;
}

const getExitCodeMessage = (code: number | null): { text: string, color: string } => {
    if (code === null) return { text: 'Executing...', color: 'text-slate-500 dark:text-slate-400'};
    switch (code) {
        case 0: return { text: `Success (Code ${code})`, color: 'text-green-500' };
        case 1: return { text: `Warning (Code ${code}) - Non-fatal error(s)`, color: 'text-yellow-500' };
        case 2: return { text: `Fatal Error (Code ${code})`, color: 'text-red-500' };
        case 7: return { text: `Error (Code ${code}) - Bad command-line arguments`, color: 'text-red-500' };
        case 8: return { text: `Error (Code ${code}) - Not enough memory`, color: 'text-red-500' };
        case 255: return { text: `Error (Code ${code}) - User stopped process`, color: 'text-orange-500' };
        case -1: return { text: `Error - Failed to start process`, color: 'text-red-600 font-bold' };
        default: return { text: `Finished with unknown code ${code}`, color: 'text-purple-500' };
    }
};

const LogView: React.FC<LogViewProps> = ({ logs, progress, isRunning, exitCode }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);
    const status = getExitCodeMessage(isRunning ? null : exitCode);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);
    
    return (
        <div className="space-y-2 flex flex-col h-full">
            <div className="flex justify-between items-center">
                <span className={`text-sm font-semibold ${status.color}`}>{status.text}</span>
            </div>
             <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}>
                </div>
            </div>
            <div 
                ref={logContainerRef}
                className="w-full flex-grow p-3 bg-slate-100 dark:bg-slate-900 rounded-md overflow-y-auto font-mono text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            >
                {logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">{log.trim()}</div>
                ))}
            </div>
        </div>
    );
};

export default LogView;