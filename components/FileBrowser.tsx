import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { FileEntry, LogLevel, IconSet } from '../types';
import Icon from './Icon';

interface FileBrowserProps {
    onConfirm: (paths: string[]) => void;
    onCancel: () => void;
    selectionMode: 'singleFile' | 'singleDirectory' | 'multiple';
    iconSet: IconSet;
}

const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileIcon = (item: FileEntry): 'folder' | 'archive' | 'file-text' => {
    if (item.isDirectory) return 'folder';
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    if (['7z', 'zip', 'rar', 'tar', 'gz', 'iso', 'wim'].includes(ext)) {
        return 'archive';
    }
    return 'file-text';
};

const FileBrowser: React.FC<FileBrowserProps> = ({ onConfirm, onCancel, selectionMode, iconSet }) => {
    const [currentPath, setCurrentPath] = useState('');
    const [items, setItems] = useState<FileEntry[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDirectory = useCallback(async (path: string) => {
        setLoading(true);
        setError(null);
        if (window.electronAPI) {
            const result = await window.electronAPI.listDirectory(path);
            if (result.items) {
                setItems(result.items);
                setCurrentPath(result.items[0] ? result.items[0].path.substring(0, result.items[0].path.lastIndexOf(path.includes('/') ? '/' : '\\')) : path);
            } else {
                setError(result.error || 'Failed to load directory.');
            }
        } else {
            setError('Electron API not available.');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadDirectory(''); // Load home directory on mount
    }, [loadDirectory]);

    const handleItemClick = (item: FileEntry) => {
        if (item.isDirectory) {
            loadDirectory(item.path);
        } else if (selectionMode === 'singleFile') {
            setSelectedPaths(new Set([item.path]));
        }
    };

    const handleCheckboxChange = (path: string, isDirectory: boolean) => {
        const newSelected = new Set(selectedPaths);
        const canSelect = 
            (selectionMode === 'multiple') ||
            (selectionMode === 'singleFile' && !isDirectory) ||
            (selectionMode === 'singleDirectory' && isDirectory);

        if (!canSelect) return;

        if (selectionMode !== 'multiple') {
            newSelected.clear();
            newSelected.add(path);
        } else {
            if (newSelected.has(path)) {
                newSelected.delete(path);
            } else {
                newSelected.add(path);
            }
        }
        setSelectedPaths(newSelected);
    };

    const handlePathInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCurrentPath(e.target.value);
    };

    const handlePathInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadDirectory(currentPath);
    };

    const goUp = () => {
        // A simple way to go up, might not be perfect for roots
        const parentDir = currentPath.substring(0, currentPath.lastIndexOf(currentPath.includes('/') ? '/' : '\\'));
        loadDirectory(parentDir || (currentPath.includes('/') ? '/' : 'C:\\'));
    };

    const isConfirmDisabled = selectedPaths.size === 0;

    return (
        <div className="flex flex-col h-full text-sm">
            <header className="flex items-center gap-2 p-1 mb-2 bg-slate-100 dark:bg-slate-900 rounded-md">
                <button onClick={goUp} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Icon name="arrow-up" iconSet={iconSet} className="w-5 h-5" />
                </button>
                <form onSubmit={handlePathInputSubmit} className="flex-grow">
                    <input 
                        type="text"
                        value={currentPath}
                        onChange={handlePathInputChange}
                        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 text-slate-900 dark:text-white"
                    />
                </form>
            </header>

            <main className="flex-grow border rounded-md overflow-auto border-slate-200 dark:border-slate-700">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/70 backdrop-blur-sm">
                        <tr>
                            <th className="p-2 w-8"><input type="checkbox" disabled /></th>
                            <th className="p-2 w-8"></th>
                            <th className="p-2">Name</th>
                            <th className="p-2 text-right">Size</th>
                            <th className="p-2 text-right">Modified</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={5} className="text-center p-8 text-slate-500">Loading...</td></tr>}
                        {error && <tr><td colSpan={5} className="text-center p-8 text-red-500">{error}</td></tr>}
                        {!loading && !error && items.map(item => (
                            <tr key={item.path} onDoubleClick={() => handleItemClick(item)} className="hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer border-t border-slate-200 dark:border-slate-700">
                                <td className="p-2 w-8"><input type="checkbox" checked={selectedPaths.has(item.path)} onChange={() => handleCheckboxChange(item.path, item.isDirectory)} className="form-checkbox" /></td>
                                <td className="p-2 w-8 text-slate-500 dark:text-slate-400"><Icon name={getFileIcon(item)} iconSet={iconSet} className="w-5 h-5"/></td>
                                <td className="p-2 font-medium">{item.name}</td>
                                <td className="p-2 text-right text-slate-500 dark:text-slate-400 font-mono">{!item.isDirectory ? formatBytes(item.size) : ''}</td>
                                <td className="p-2 text-right text-slate-500 dark:text-slate-400 font-mono">{new Date(item.mtime).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>

            <footer className="flex-shrink-0 pt-4 flex justify-end gap-3 items-center">
                <div className="text-slate-500 dark:text-slate-400 mr-auto">
                    {selectedPaths.size} item(s) selected
                </div>
                <button onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={() => onConfirm(Array.from(selectedPaths))}
                    disabled={isConfirmDisabled}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    Confirm Selection
                </button>
            </footer>
        </div>
    );
};

export default FileBrowser;
