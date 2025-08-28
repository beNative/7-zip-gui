
import React from 'react';
import { OperationMode } from '../types';

interface ActionTabsProps {
    currentMode: OperationMode;
    onModeChange: (mode: OperationMode) => void;
}

const ActionTabs: React.FC<ActionTabsProps> = ({ currentMode, onModeChange }) => {
    const getTabClass = (mode: OperationMode) => {
        const baseClass = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors duration-200";
        if (currentMode === mode) {
            return `${baseClass} bg-cyan-500 text-white`;
        }
        return `${baseClass} bg-slate-700 text-slate-300 hover:bg-slate-600`;
    };

    return (
        <div className="flex space-x-2 p-1 bg-slate-900/50 rounded-lg">
            <button
                className={getTabClass(OperationMode.Compress)}
                onClick={() => onModeChange(OperationMode.Compress)}
            >
                Compress
            </button>
            <button
                className={getTabClass(OperationMode.Extract)}
                onClick={() => onModeChange(OperationMode.Extract)}
            >
                Extract
            </button>
            <button
                className={getTabClass(OperationMode.Info)}
                onClick={() => onModeChange(OperationMode.Info)}
            >
                Info
            </button>
        </div>
    );
};

export default ActionTabs;
