import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import { SwitchSchema, SwitchControlType } from '../types';
import { LogLevel, IconSet } from '../types';
import Modal from './Modal';
import FileBrowser from './FileBrowser';
import { AppSettings } from '../types';

interface SwitchControlProps {
    schema: SwitchSchema;
    value: any;
    onChange: (switchId: string, value: any) => void;
    // HACK: Pass settings down to get iconSet
    iconSet: IconSet;
}

const SwitchControl: React.FC<SwitchControlProps> = ({ schema, value, onChange, iconSet }) => {
    const { id, label, description, control, options, pathType } = schema;
    const [isBrowserOpen, setIsBrowserOpen] = useState(false);

    const renderControl = () => {
        const baseInputClass = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-blue-500 focus:border-blue-500 transition-colors";
        const browseButtonClass = "px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-colors";

        const fileBrowserModal = (
            isBrowserOpen && (
                <Modal isOpen={isBrowserOpen} onClose={() => setIsBrowserOpen(false)} title={`Select ${label}`}>
                    <FileBrowser
                        iconSet={iconSet}
                        onConfirm={(paths) => {
                            if (control === SwitchControlType.MultiPathInput) {
                                onChange(id, paths);
                            } else if (paths.length > 0) {
                                onChange(id, paths[0]);
                            }
                            setIsBrowserOpen(false);
                        }}
                        onCancel={() => setIsBrowserOpen(false)}
                        selectionMode={
                            control === SwitchControlType.MultiPathInput ? 'multiple' 
                            : pathType === 'directory' ? 'singleDirectory'
                            : 'singleFile'
                        }
                    />
                </Modal>
            )
        );

        switch (control) {
            case SwitchControlType.Checkbox:
                return (
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(id, e.target.checked)}
                             className="form-checkbox h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 border-slate-400 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                    </label>
                );

            case SwitchControlType.TextInput:
                return (
                     <input
                        type="text"
                        value={value || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(id, e.target.value)}
                        className={baseInputClass}
                    />
                );

            case SwitchControlType.Select:
                return (
                    <select
                        value={value || ''}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(id, e.target.value)}
                        className={baseInputClass}
                    >
                        {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                );
            
            case SwitchControlType.PathInput:
                 return (
                    <>
                        {fileBrowserModal}
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={value || ''}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(id, e.target.value)}
                                placeholder={`Enter path or click 'Browse'`}
                                className={`flex-grow ${baseInputClass}`}
                            />
                            <button
                                type="button"
                                onClick={() => setIsBrowserOpen(true)}
                                className={browseButtonClass}
                            >
                                Browse
                            </button>
                        </div>
                    </>
                );
            
            case SwitchControlType.MultiPathInput:
                 const files = (value as string[] || []);
                 return (
                    <>
                        {fileBrowserModal}
                        <div>
                            <button
                                type="button"
                                onClick={() => setIsBrowserOpen(true)}
                                className={`${browseButtonClass} w-full justify-center`}
                            >
                            Select Files / Folders...
                            </button>
                            {files.length > 0 && (
                                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md p-2 max-h-20 overflow-y-auto">
                                    {files.length} item(s) selected: {files[0]}{files.length > 1 ? ` and ${files.length - 1} more...` : ''}
                                </div>
                            )}
                        </div>
                    </>
                 );
            
            default:
                return <p className="text-red-400">Unsupported control type</p>;
        }
    };
    
    // Checkbox has its own label, so we don't render the outer one.
    if (control === SwitchControlType.Checkbox) {
        return (
             <div title={description}>
                {renderControl()}
            </div>
        );
    }

    return (
        <div title={description}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            {renderControl()}
        </div>
    );
};

export default SwitchControl;