import { CommandSchema, SwitchSchema, SwitchControlType } from '../types';

export const SWITCHES: Record<string, SwitchSchema> = {
    // --- SPECIAL ---
    'files': {
        id: 'files',
        label: 'Files / Folders',
        description: 'The primary files or folders to process.',
        control: SwitchControlType.MultiPathInput,
        defaultValue: [],
    },
    'archive': {
        id: 'archive',
        label: 'Archive',
        description: 'The archive file to create or read from.',
        control: SwitchControlType.PathInput,
        pathType: 'file',
        defaultValue: '',
    },
    // --- GENERAL ---
    '-t': {
        id: '-t',
        label: 'Archive Format',
        description: 'Specifies the type of archive.',
        control: SwitchControlType.Select,
        defaultValue: '7z',
        options: [
            { value: '7z', label: '.7z' },
            { value: 'zip', label: '.zip' },
            { value: 'tar', label: '.tar' },
            { value: 'wim', label: '.wim' },
            { value: 'gzip', label: '.gz' },
            { value: 'bzip2', label: '.bz2' },
            { value: 'xz', label: '.xz' },
        ],
    },
    '-o': {
        id: '-o',
        label: 'Output Directory',
        description: 'Specifies the destination directory for extracted files.',
        control: SwitchControlType.PathInput,
        pathType: 'directory',
        defaultValue: '',
    },
    '-p': {
        id: '-p',
        label: 'Password',
        description: 'Sets a password for encryption.',
        control: SwitchControlType.TextInput,
        defaultValue: '',
    },
    '-mhe': {
        id: '-mhe',
        label: 'Encrypt Headers',
        description: 'Encrypts archive headers (for 7z format only). This hides filenames.',
        control: SwitchControlType.Checkbox,
        defaultValue: false,
    },
    '-mx': {
        id: '-mx',
        label: 'Compression Level',
        description: 'Sets the compression level.',
        control: SwitchControlType.Select,
        defaultValue: '5',
        options: [
            { value: '0', label: '0 - Copy (No compression)' },
            { value: '1', label: '1 - Fastest' },
            { value: '3', label: '3 - Fast' },
            { value: '5', label: '5 - Normal (Default)' },
            { value: '7', label: '7 - Maximum' },
            { value: '9', label: '9 - Ultra' },
        ],
    },
    '-r': {
        id: '-r',
        label: 'Recurse Subdirectories',
        description: 'Enables recursive scanning of subdirectories.',
        control: SwitchControlType.Checkbox,
        defaultValue: true,
    },
    '-y': {
        id: '-y',
        label: 'Assume Yes',
        description: 'Assume Yes on all queries from 7-Zip.',
        control: SwitchControlType.Checkbox,
        defaultValue: true,
    },
    '-scrc': {
        id: '-scrc',
        label: 'Hash Function',
        description: 'Specifies the hash function for the \'h\' command.',
        control: SwitchControlType.Select,
        defaultValue: 'SHA256',
        options: [
            { value: 'CRC32', label: 'CRC32' },
            { value: 'CRC64', label: 'CRC64' },
            { value: 'SHA1', label: 'SHA1' },
            { value: 'SHA256', label: 'SHA256' },
            { value: 'BLAKE2sp', label: 'BLAKE2sp' },
            { value: '*', label: 'All supported functions' },
        ],
    },
};


export const COMMANDS: Record<string, CommandSchema> = {
    'a': {
        key: 'a',
        label: 'Add',
        description: 'Adds files to an archive.',
        switches: ['files', 'archive', '-t', '-mx', '-p', '-mhe', '-r', '-y'],
    },
    'x': {
        key: 'x',
        label: 'Extract (Full Paths)',
        description: 'Extracts files from an archive with their full paths.',
        switches: ['archive', '-o', '-p', '-y'],
    },
    'e': {
        key: 'e',
        label: 'Extract',
        description: 'Extracts files to a single directory, ignoring paths.',
        switches: ['archive', '-o', '-p', '-y'],
    },
    'l': {
        key: 'l',
        label: 'List',
        description: 'Lists the contents of an archive.',
        switches: ['archive', '-p'],
    },
    'd': {
        key: 'd',
        label: 'Delete',
        description: 'Deletes files from an archive.',
        switches: ['archive', 'files', '-p', '-r'],
    },
    't': {
        key: 't',
        label: 'Test',
        description: 'Tests the integrity of an archive.',
        switches: ['archive', '-p', '-r'],
    },
    'u': {
        key: 'u',
        label: 'Update',
        description: 'Updates files in an archive.',
        switches: [], // Complex - to be implemented
    },
    'rn': {
        key: 'rn',
        label: 'Rename',
        description: 'Renames files within an archive.',
        switches: [], // Requires special handling - to be implemented
    },
    'b': {
        key: 'b',
        label: 'Benchmark',
        description: 'Measures CPU performance for compression and decompression.',
        switches: [],
    },
    'h': {
        key: 'h',
        label: 'Hash',
        description: 'Calculates hash values for files.',
        switches: ['files', '-scrc'],
    },
    'i': {
        key: 'i',
        label: 'Info',
        description: 'Shows information about supported formats.',
        switches: [],
    },
};
