import React, { useState, useEffect, useRef } from 'react';
import { LogLevel, LogMessage } from '../types';

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: 'text-green-600 dark:text-green-400',
    [LogLevel.INFO]: 'text-blue-600 dark:text-blue-400',
    [LogLevel.WARNING]: 'text-orange-500 dark:text-orange-400',
    [LogLevel.ERROR]: 'text-red-600 dark:text-red-500',
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
            // FIX: Corrected typo from `logContainerR` to `logContainerRef`.
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
        <div className="flex flex-col h-full">
            <header className="pb-2 flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 dark:border-slate-700 mb-2">
                 <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Filters:</span>
                        {Object.values(LogLevel).map(level => (
                             <label key={level} className="flex items-center space-x-1.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.has(level)}
                                    onChange={() => handleFilterChange(level)}
                                    className="form-checkbox h-4 w-4 rounded bg-slate-200 dark:bg-slate-600 border-slate-400 dark:border-slate-500 text-blue-500 focus:ring-blue-600"
                                />
                                <span className={`${LOG_LEVEL_COLORS[level]} font-medium`}>{level}</span>
                            </label>
                        ))}
                    </div>
                </div>
                 <label className="flex items-center space-x-2 cursor-pointer text-sm">
                    <input
                        type="checkbox"
                        checked={isFileLoggingEnabled}
                        onChange={handleFileLoggingToggle}
                        className="form-checkbox h-4 w-4 rounded bg-slate-200 dark:bg-slate-600 border-slate-400 dark:border-slate-500 text-blue-500 focus:ring-blue-600"
                    />
                    <span className="text-slate-600 dark:text-slate-300">Save log to file</span>
                </label>
            </header>
            <main 
                ref={logContainerRef}
                className="flex-grow overflow-y-auto font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-md p-2 border border-slate-200 dark:border-slate-700"
            >
                 {filteredMessages.map((log, index) => (
                    <div key={index} className="flex items-start">
                        <span className="text-slate-400 dark:text-slate-500 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`w-16 flex-shrink-0 ${LOG_LEVEL_COLORS[log.level]}`}>[{log.level}]</span>
                        <span className="flex-1 whitespace-pre-wrap break-words">{log.message}</span>
                    </div>
                ))}
                 {filteredMessages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>No log messages match the current filter.</p>
                    </div>
                 )}
            </main>
        </div>
    );
};

export default LoggingPanel;