import React from 'react';
import { ViewMode } from '../types';
import { COMMANDS } from '../constants/schema';

interface CommandTabsProps {
    currentView: ViewMode;
    onViewChange: (mode: ViewMode) => void;
}

const CommandTabs: React.FC<CommandTabsProps> = ({ currentView, onViewChange }) => {
    
    const commandButtons = Object.values(COMMANDS).map(cmd => ({
        key: cmd.key,
        label: `${cmd.key}`,
        description: `${cmd.label}`
    }));

    const viewButtons = [
        { key: 'Settings', label: 'Settings', description: 'Application Settings' },
        { key: 'Help', label: 'Help', description: 'Documentation' },
    ];
    
    const allButtons = [...commandButtons, ...viewButtons];

    const getTabClass = (key: ViewMode) => {
        const baseClass = "relative px-3 py-2 text-xs sm:text-sm font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 focus-visible:ring-blue-500 transition-colors duration-200";
        if (currentView === key) {
            return `${baseClass} text-blue-500 dark:text-cyan-400`;
        }
        return `${baseClass} text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700`;
    };

    return (
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700">
            {allButtons.map(btn => (
                <button
                    key={btn.key}
                    className={getTabClass(btn.key as ViewMode)}
                    onClick={() => onViewChange(btn.key as ViewMode)}
                    title={btn.description}
                >
                    {btn.label}
                    {currentView === btn.key && (
                         <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-cyan-400 rounded-t-full"></span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default CommandTabs;