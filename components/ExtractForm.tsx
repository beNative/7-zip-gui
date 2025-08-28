
import React, { useState, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import type { SevenZipResult } from '../types';

interface ExtractFormProps {
    onStart: () => void;
    onFinish: (result: string, success: boolean) => void;
    isRunning: boolean;
}

const ExtractForm: React.FC<ExtractFormProps> = ({ onStart, onFinish, isRunning }) => {
    const [archiveFile, setArchiveFile] = useState<File | null>(null);
    const [outputPath, setOutputPath] = useState('');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setArchiveFile(e.target.files[0]);
        }
    };

    const handleSelectOutputDir = async () => {
        // FIX: 'selectOutputDir' does not exist on electronAPI, changed to 'selectDirectory'.
        const path = await window.electronAPI.selectDirectory();
        if (path) {
            setOutputPath(path);
        }
    };

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!archiveFile) {
            onFinish('Error: No archive file selected.', false);
            return;
        }
        if (!outputPath) {
            onFinish('Error: No output directory selected.', false);
            return;
        }

        const args = [
            'x', // Extract with full paths
            // FIX: The standard 'File' type doesn't include the 'path' property provided by Electron. Cast to 'any' to access it.
            (archiveFile as any).path,
            `-o${outputPath}`, // Set output directory
            '-y' // Assume Yes on all queries
        ];

        onStart();
        try {
            const result = await window.electronAPI.run7zip({ command: '7z', args });
            // FIX: Pass the correct argument types (string, boolean) to onFinish.
            onFinish(result.message, result.code === 0);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            onFinish(`Extraction failed: ${errorMessage}`, false);
        }
    }, [archiveFile, outputPath, onStart, onFinish]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Archive File</label>
                <input
                    type="file"
                    accept=".7z,.zip,.rar,.tar,.gz,.iso"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-cyan-400 hover:file:bg-slate-600"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Output Directory</label>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        readOnly
                        value={outputPath}
                        placeholder="Click 'Browse' to select a folder"
                        className="flex-grow bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={handleSelectOutputDir}
                        className="px-4 py-2 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800"
                    >
                        Browse
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={isRunning}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {isRunning ? 'Extracting...' : 'Extract'}
            </button>
        </form>
    );
};

export default ExtractForm;