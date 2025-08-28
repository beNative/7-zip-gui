export enum OperationMode {
    Compress = 'Compress',
    Extract = 'Extract',
    Info = 'Info',
}

export type SevenZipOptions = {
    command: '7z' | string;
    args: string[];
}

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
}

export interface LogMessage {
    level: LogLevel;
    timestamp: string;
    message: string;
}