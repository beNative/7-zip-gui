import React from 'react';
import { IconSet } from '../types';
import Icon from './Icon';

interface StatusBarProps {
    status: string;
    exitCode: number | null;
    executablePath: string;
    isLogPanelVisible: boolean;
    onToggleLogs: () => void;
    iconSet: IconSet;
}

const getStatusColor = (exitCode: number | null, status: string): string => {
    if (status === 'Running...') return 'text-blue-500';
    if (exitCode === 0) return 'text-green-500';
    if (exitCode !== null && exitCode !== 0) return 'text-red-500';
    return 'text-slate-500 dark:text-slate-400';
}

const StatusBar: React.FC<StatusBarProps> = ({ status, exitCode, executablePath, isLogPanelVisible, onToggleLogs, iconSet }) => {
    
    const statusColor = getStatusColor(exitCode, status);

    return (
        <footer className="h-[30px] flex-shrink-0 px-4 flex items-center justify-between bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-xs transition-colors duration-300">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Status:</span>
                    <span className={`font-bold ${statusColor}`}>{status}</span>
                </div>
                 <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Executable:</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={executablePath}>
                        {executablePath}
                    </span>
                </div>
            </div>
            <button 
                onClick={onToggleLogs}
                className="px-3 py-1 text-xs font-medium rounded-md flex items-center space-x-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                title={isLogPanelVisible ? "Hide Logs" : "Show Logs"}
            >
                <span>{isLogPanelVisible ? 'Hide Logs' : 'Show Logs'}</span>
                <Icon name="chevron-up" iconSet={iconSet} className={`h-3 w-3 transition-transform duration-200 ${isLogPanelVisible ? 'rotate-180' : ''}`} />
            </button>
        </footer>
    );
};

export default StatusBar;