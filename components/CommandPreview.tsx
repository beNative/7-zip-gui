import React, { useState } from 'react';
import { CommandKey, CommandState } from '../types';
import { buildCommand } from '../utils/commandBuilder';

interface CommandPreviewProps {
    executablePath: string;
    commandKey: CommandKey;
    state: CommandState;
}

const CommandPreview: React.FC<CommandPreviewProps> = ({ executablePath, commandKey, state }) => {
    const [copied, setCopied] = useState(false);
    const { preview } = buildCommand(executablePath, commandKey, state);

    const handleCopy = () => {
        navigator.clipboard.writeText(preview);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Command Preview</label>
            <div className="relative">
                <div className="w-full p-3 bg-slate-100 dark:bg-slate-900 rounded-md font-mono text-xs text-cyan-600 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 whitespace-pre-wrap overflow-x-auto">
                    {preview}
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>
    );
};

export default CommandPreview;