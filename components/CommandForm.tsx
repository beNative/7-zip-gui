import React, { useReducer, useCallback } from 'react';
import type { FormEvent } from 'react';
import { CommandKey, SevenZipResult } from '../types';
import { COMMANDS, SWITCHES } from '../constants/schema';
import SwitchControl from './SwitchControl';
import CommandPreview from './CommandPreview';
import { commandStateReducer, getInitialState } from '../hooks/useCommandState';
import { buildCommand } from '../utils/commandBuilder';

interface CommandFormProps {
    commandKey: CommandKey;
    onStart: () => void;
    onFinish: (result: SevenZipResult) => void;
    isRunning: boolean;
    executablePath: string;
}

const CommandForm: React.FC<CommandFormProps> = ({ commandKey, onStart, onFinish, isRunning, executablePath }) => {
    const commandSchema = COMMANDS[commandKey];
    const [state, dispatch] = useReducer(commandStateReducer, commandKey, getInitialState);

    const handleValueChange = (switchId: string, value: any) => {
        dispatch({ type: 'UPDATE_VALUE', payload: { switchId, value } });
    };

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        const { args } = buildCommand(executablePath, commandKey, state);
        
        onStart();
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.run7zip({ command: executablePath, args });
                onFinish(result);
            } else {
                throw new Error("Electron API is not available.");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            onFinish({ code: -1, stdout: '', stderr: errorMessage, message: `Operation failed: ${errorMessage}` });
        }
    }, [executablePath, commandKey, state, onStart, onFinish]);
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {commandSchema.switches.map(switchId => {
                    const switchSchema = SWITCHES[switchId];
                    if (!switchSchema) return null;
                    
                    return (
                        <SwitchControl
                            key={switchId}
                            schema={switchSchema}
                            value={state[switchId]}
                            onChange={handleValueChange}
                        />
                    );
                })}
            </div>

            <CommandPreview executablePath={executablePath} commandKey={commandKey} state={state} />

            <button
                type="submit"
                disabled={isRunning}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {isRunning ? 'Running...' : 'Run Command'}
            </button>
        </form>
    );
};

export default CommandForm;
