import React, { useState, useEffect, useRef } from 'react';
import { LogLevel, LogMessage } from '../types';

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: 'text-green-400',
    [LogLevel.INFO]: 'text-blue-400',
    [LogLevel.WARNING]: 'text-orange-400',
    [LogLevel.ERROR]: 'text-red-400',
};

const LoggingPanel: React.FC = () => {
    const [messages, setMessages] = useState<LogMessage[]>([]);
    const [filters, setFilters] = useState<Set<LogLevel>>(new Set(Object.values(LogLevel)));
    const [isFileLoggingEnabled, setIsFileLoggingEnabled] = useState(false);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.electronAPI) {
            const removeListener = window.electronAPI.onLogMessage((log) => {
                setMessages(prev => [...prev, log]);
            });
            return () => removeListener();
        }
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleFilterChange = (level: LogLevel) => {
        setFilters(prev => {
            const newFilters = new Set(prev);
            if (newFilters.has(level)) {
                newFilters.delete(level);
            } else {
                newFilters.add(level);
            }
            return newFilters;
        });
    };

    const handleFileLoggingToggle = async () => {
        const newState = !isFileLoggingEnabled;
        if (window.electronAPI) {
            await window.electronAPI.toggleFileLogging(newState);
            setIsFileLoggingEnabled(newState);
        }
    };
    
    const filteredMessages = messages.filter(msg => filters.has(msg.level));

    return (
        <div className="w-full max-w-2xl mx-auto mt-4 bg-slate-800 rounded-xl shadow-lg ring-1 ring-slate-700 flex flex-col">
            <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-wrap gap-4">
                <h3 className="text-lg font-medium text-slate-300">Application Log</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-slate-400">Filters:</span>
                        {Object.values(LogLevel).map(level => (
                             <label key={level} className="flex items-center space-x-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.has(level)}
                                    onChange={() => handleFilterChange(level)}
                                    className="form-checkbox h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600"
                                />
                                <span className={LOG_LEVEL_COLORS[level]}>{level}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </header>
            <main 
                ref={logContainerRef}
                className="p-4 h-48 overflow-y-auto font-mono text-xs text-slate-400"
            >
                 {filteredMessages.map((log, index) => (
                    <div key={index} className="flex">
                        <span className="text-slate-500 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`w-16 ${LOG_LEVEL_COLORS[log.level]}`}>[{log.level}]</span>
                        <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
                    </div>
                ))}
            </main>
            <footer className="p-3 border-t border-slate-700">
                 <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isFileLoggingEnabled}
                        onChange={handleFileLoggingToggle}
                        className="form-checkbox h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600"
                    />
                    <span className="text-sm text-slate-300">Save log to file</span>
                </label>
            </footer>
        </div>
    );
};

export default LoggingPanel;