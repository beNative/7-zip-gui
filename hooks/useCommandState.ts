import { CommandKey, CommandState, CommandStatePayload } from '../types';
import { COMMANDS, SWITCHES } from '../constants/schema';

type Action = {
    type: 'UPDATE_VALUE';
    payload: CommandStatePayload;
};

export const getInitialState = (commandKey: CommandKey): CommandState => {
    const commandSchema = COMMANDS[commandKey];
    if (!commandSchema) return {};

    const initialState: CommandState = {};
    commandSchema.switches.forEach(switchId => {
        const switchSchema = SWITCHES[switchId];
        if (switchSchema && switchSchema.defaultValue !== undefined) {
            initialState[switchId] = switchSchema.defaultValue;
        } else {
            // Ensure all keys exist in the state
            initialState[switchId] = undefined;
        }
    });
    return initialState;
};

export const commandStateReducer = (state: CommandState, action: Action): CommandState => {
    switch (action.type) {
        case 'UPDATE_VALUE':
            return {
                ...state,
                [action.payload.switchId]: action.payload.value,
            };
        default:
            return state;
    }
};
