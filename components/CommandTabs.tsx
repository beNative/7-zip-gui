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
        label: `${cmd.key} (${cmd.label})`
    }));

    const viewButtons = [
        { key: 'Settings', label: 'Settings' },
        { key: 'Help', label: 'Help' },
    ];
    
    const allButtons = [...commandButtons, ...viewButtons];

    const getTabClass = (key: ViewMode) => {
        const baseClass = "px-3 py-2 text-xs sm:text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors duration-200";
        if (currentView === key) {
            return `${baseClass} bg-cyan-500 text-white`;
        }
        return `${baseClass} bg-slate-700 text-slate-300 hover:bg-slate-600`;
    };

    return (
        <div className="flex flex-wrap gap-2 p-1 bg-slate-900/50 rounded-lg">
            {allButtons.map(btn => (
                <button
                    key={btn.key}
                    className={getTabClass(btn.key as ViewMode)}
                    onClick={() => onViewChange(btn.key as ViewMode)}
                    title={COMMANDS[btn.key as keyof typeof COMMANDS]?.description}
                >
                    {btn.label}
                </button>
            ))}
        </div>
    );
};

export default CommandTabs;