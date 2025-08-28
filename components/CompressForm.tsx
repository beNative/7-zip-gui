
import React, { useState, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import type { SevenZipResult } from '../types';

interface CompressFormProps {
    onStart: () => void;
    onFinish: (result: string, success: boolean) => void;
    isRunning: boolean;
}

const CompressForm: React.FC<CompressFormProps> = ({ onStart, onFinish, isRunning }) => {
    const [files, setFiles] = useState<FileList | null>(null);
    const [archiveName, setArchiveName] = useState('archive');
    const [archiveType, setArchiveType] = useState<'7z' | 'zip'>('7z');
    const [compressionLevel, setCompressionLevel] = useState('5');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiles(e.target.files);
    };

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!files || files.length === 0) {
            onFinish('Error: No files or folders selected.', false);
            return;
        }

        // FIX: The standard `File` type doesn't include the `path` property provided by Electron. Cast to 'any' to access it.
        const outputArchivePath = `${(files[0] as any).path.substring(0, (files[0] as any).path.lastIndexOf('\\') + 1)}${archiveName}.${archiveType}`;
        // FIX: The standard `File` type doesn't include the `path` property provided by Electron. Cast to 'any' to access it.
        const sourcePaths = Array.from(files).map(f => (f as any).path);
        
        const args = [
            'a', // Add to archive
            `-t${archiveType}`, // Set archive type
            `-mx=${compressionLevel}`, // Set compression level
            outputArchivePath, // Output archive path
            ...sourcePaths // Source files/folders
        ];

        onStart();
        try {
            const result = await window.electronAPI.run7zip({ command: '7z', args });
            // FIX: Pass the correct argument types (string, boolean) to onFinish.
            onFinish(result.message, result.code === 0);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            onFinish(`Compression failed: ${errorMessage}`, false);
        }
    }, [files, archiveName, archiveType, compressionLevel, onStart, onFinish]);

    const levelOptions = [
        { value: '0', label: '0 - Copy (No compression)' },
        { value: '1', label: '1 - Fastest' },
        { value: '3', label: '3 - Fast' },
        { value: '5', label: '5 - Normal (Default)' },
        { value: '7', label: '7 - Maximum' },
        { value: '9', label: '9 - Ultra' },
    ];
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Files/Folders to Compress</label>
                <input
                    type="file"
                    multiple
                    // @ts-ignore
                    webkitdirectory=""
                    directory=""
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-cyan-400 hover:file:bg-slate-600"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="archiveName" className="block text-sm font-medium text-slate-300 mb-1">Archive Name</label>
                    <input
                        id="archiveName"
                        type="text"
                        value={archiveName}
                        onChange={(e) => setArchiveName(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="archiveType" className="block text-sm font-medium text-slate-300 mb-1">Archive Format</label>
                    <select
                        id="archiveType"
                        value={archiveType}
                        onChange={(e) => setArchiveType(e.target.value as '7z' | 'zip')}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        <option value="7z">.7z</option>
                        <option value="zip">.zip</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="compressionLevel" className="block text-sm font-medium text-slate-300 mb-1">Compression Level</label>
                <select
                    id="compressionLevel"
                    value={compressionLevel}
                    onChange={(e) => setCompressionLevel(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                >
                    {levelOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            <button
                type="submit"
                disabled={isRunning}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {isRunning ? 'Compressing...' : 'Compress'}
            </button>
        </form>
    );
};

export default CompressForm;