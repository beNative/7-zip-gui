
import { CommandKey, CommandState, SwitchControlType } from '../types';
import { SWITCHES } from '../constants/schema';

// Helper to quote paths if they contain spaces
const quote = (str: string) => (str.includes(' ') && !str.startsWith('"') ? `"${str}"` : str);

export const buildCommand = (executablePath: string, commandKey: CommandKey, state: CommandState): { args: string[], preview: string } => {
    const args: string[] = [commandKey];
    
    // Process archive and files first as they are positional
    const archivePath = state['archive'];
    if (archivePath) {
        args.push(quote(archivePath));
    }

    const filePaths = state['files'];
    if (filePaths && Array.isArray(filePaths) && filePaths.length > 0) {
        args.push(...filePaths.map(quote));
    }

    // Process other switches
    for (const switchId in state) {
        // Skip special positional args we've already handled
        if (switchId === 'archive' || switchId === 'files') {
            continue;
        }

        const value = state[switchId];
        const schema = SWITCHES[switchId];
        if (!schema || value === undefined || value === schema.defaultValue) {
            continue;
        }

        // FIX: Use enum members for comparison instead of string literals.
        switch (schema.control) {
            case SwitchControlType.Checkbox:
                if (value) {
                    // Simple boolean switch (e.g., -r, -mhe=on)
                     if (switchId === '-mhe') {
                         args.push(`${switchId}=on`);
                     } else {
                         args.push(switchId);
                     }
                }
                break;
            
            case SwitchControlType.TextInput:
            case SwitchControlType.Select:
                if (value) {
                    // Switch with a value, no space (e.g., -t7z, -mx9, -pSECRET)
                    args.push(`${switchId}${value}`);
                }
                break;

            case SwitchControlType.PathInput:
                if (value) {
                    // Switch with a path value (e.g., -o"C:\Output Dir")
                    args.push(`${switchId}${quote(value)}`);
                }
                break;
        }
    }
    
    const preview = `${quote(executablePath)} ${args.join(' ')}`;

    return { args, preview };
};