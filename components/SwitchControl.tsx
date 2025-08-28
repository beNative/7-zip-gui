import React from 'react';
import type { ChangeEvent } from 'react';
import { SwitchSchema, SwitchControlType } from '../types';

interface SwitchControlProps {
    schema: SwitchSchema;
    value: any;
    onChange: (switchId: string, value: any) => void;
}

const SwitchControl: React.FC<SwitchControlProps> = ({ schema, value, onChange }) => {
    const { id, label, description, control, options, pathType } = schema;

    const handlePathSelection = async (type: 'file' | 'directory' | undefined) => {
        if (!window.electronAPI) return;
        const path = type === 'directory' 
            ? await window.electronAPI.selectDirectory() 
            : await window.electronAPI.selectFile();
        if (path) {
            onChange(id, path);
        }
    };
    
    const renderControl = () => {
        switch (control) {
            case SwitchControlType.Checkbox:
                return (
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(id, e.target.checked)}
                             className="form-checkbox h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600"
                        />
                        <span className="text-sm text-slate-300">{label}</span>
                    </label>
                );

            case SwitchControlType.TextInput:
                return (
                     <input
                        type="text"
                        value={value || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(id, e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    />
                );

            case SwitchControlType.Select:
                return (
                    <select
                        value={value || ''}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(id, e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                );
            
            case SwitchControlType.PathInput:
                 return (
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(id, e.target.value)}
                            placeholder={`Enter path or click 'Browse'`}
                            className="flex-grow bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        />
                        <button
                            type="button"
                            onClick={() => handlePathSelection(pathType)}
                            className="px-4 py-2 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800"
                        >
                            Browse
                        </button>
                    </div>
                );
            
            case SwitchControlType.MultiPathInput:
                 const files = (value as string[] || []);
                 const handleMultiFileChange = (e: ChangeEvent<HTMLInputElement>) => {
                     if (e.target.files) {
                         // The 'path' property is added by Electron
                         const paths = Array.from(e.target.files).map(f => (f as any).path);
                         onChange(id, paths);
                     }
                 };
                 return (
                     <div>
                        <input
                            type="file"
                            multiple
                            onChange={handleMultiFileChange}
                            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-cyan-400 hover:file:bg-slate-600"
                        />
                         {files.length > 0 && (
                            <div className="mt-2 text-xs text-slate-400 border border-slate-700 rounded-md p-2 max-h-20 overflow-y-auto">
                                {files.length} item(s) selected: {files[0]}{files.length > 1 ? ` and ${files.length - 1} more...` : ''}
                            </div>
                         )}
                    </div>
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
            <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            {renderControl()}
        </div>
    );
};

export default SwitchControl;