
import React, { useRef, useEffect } from 'react';

interface LogViewProps {
    logs: string[];
    progress: number;
    isRunning: boolean;
}

const LogView: React.FC<LogViewProps> = ({ logs, progress, isRunning }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);
    
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-medium text-slate-300">Output Log</h3>
             <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${progress}%` }}>
                </div>
            </div>
            <div 
                ref={logContainerRef}
                className="w-full h-32 p-3 bg-slate-900 rounded-md overflow-y-auto font-mono text-xs text-slate-400 border border-slate-700"
            >
                {logs.map((log, index) => (
                    <div key={index}>{log.trim()}</div>
                ))}
            </div>
        </div>
    );
};

export default LogView;
