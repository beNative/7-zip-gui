import React from 'react';
import { AppSettings } from '../types';

interface SettingsViewProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSettingsChange }) => {
    
    const handlePathChange = (newPath: string) => {
        const newSettings = { ...settings, executablePath: newPath };
        onSettingsChange(newSettings);
        if (window.electronAPI) {
            window.electronAPI.setSettings(newSettings);
        }
    };
    
    const handleSelectExecutable = async () => {
        if (window.electronAPI) {
            const path = await window.electronAPI.selectFile();
            if (path) {
                handlePathChange(path);
            }
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-2">Settings</h2>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">7-Zip Executable Path</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={settings.executablePath}
                            onChange={(e) => handlePathChange(e.target.value)}
                            placeholder="e.g., C:\\Program Files\\7-Zip\\7z.exe or just '7z'"
                            className="flex-grow bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        />
                        <button
                            type="button"
                            onClick={handleSelectExecutable}
                            className="px-4 py-2 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800"
                        >
                            Browse
                        </button>
                    </div>
                     <p className="text-xs text-slate-500 mt-2">
                        Enter the name or full path of your 7-Zip executable (e.g., `7z`, `7zz`, or `7za`). If it's in your system's PATH, the name is sufficient.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
