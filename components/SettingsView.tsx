import React from 'react';
import { AppSettings, Theme } from '../types';

interface SettingsViewProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSettingsChange }) => {
    
    const handleSettingChange = (key: keyof AppSettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        onSettingsChange(newSettings);
    };
    
    const handleSelectExecutable = async () => {
        if (window.electronAPI) {
            const path = await window.electronAPI.selectFile();
            if (path) {
                handleSettingChange('executablePath', path);
            }
        }
    };
    
    const ThemeButton: React.FC<{theme: Theme, label: string}> = ({ theme, label }) => {
        const isActive = settings.theme === theme;
        return (
            <button
                type="button"
                onClick={() => handleSettingChange('theme', theme)}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-700
                    ${isActive ? 'bg-blue-500 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`
                }
            >
                {label}
            </button>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">Settings</h2>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">7-Zip Executable Path</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={settings.executablePath}
                            onChange={(e) => handleSettingChange('executablePath', e.target.value)}
                            placeholder="e.g., C:\\Program Files\\7-Zip\\7z.exe or just '7z'"
                            className="flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={handleSelectExecutable}
                            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
                        >
                            Browse
                        </button>
                    </div>
                     <p className="text-xs text-slate-500 mt-2">
                        Enter the name or full path of your 7-Zip executable (e.g., `7z`, `7zz`, or `7za`). If it's in your system's PATH, the name is sufficient.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Theme</label>
                    <div className="p-1 inline-flex items-center space-x-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                        <ThemeButton theme="light" label="Light" />
                        <ThemeButton theme="dark" label="Dark" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsView;