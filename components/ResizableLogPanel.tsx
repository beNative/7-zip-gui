import React, { useState, useCallback, useRef, MouseEvent } from 'react';
import LogView from './LogView';
import LoggingPanel from './LoggingPanel';

interface ResizableLogPanelProps {
    isVisible: boolean;
    operationLogs: string[];
    progress: number;
    isRunning: boolean;
    exitCode: number | null;
    isCommandView: boolean;
}

type LogTab = 'operation' | 'application';

const MIN_HEIGHT = 100;
const DEFAULT_HEIGHT = 250;

const ResizableLogPanel: React.FC<ResizableLogPanelProps> = ({ isVisible, operationLogs, progress, isRunning, exitCode, isCommandView }) => {
    const [height, setHeight] = useState(DEFAULT_HEIGHT);
    const [activeTab, setActiveTab] = useState<LogTab>('operation');
    const isResizing = useRef(false);

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
        if (!isResizing.current) return;
        const newHeight = window.innerHeight - e.clientY - 30; // 30px for status bar
        if (newHeight >= MIN_HEIGHT) {
            setHeight(newHeight);
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);
    
    const getTabClass = (tab: LogTab) => {
        const baseClass = "px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 focus-visible:ring-blue-500 transition-colors duration-200";
        if (activeTab === tab) {
            return `${baseClass} bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100`;
        }
        return `${baseClass} text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700`;
    };

    return (
        <div 
            className={`bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-t-lg transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0`}
            style={{ maxHeight: isVisible ? '80vh' : '0', height: isVisible ? `${height}px` : '0' }}
        >
            <div 
                className="w-full h-2 cursor-row-resize flex items-center justify-center group"
                onMouseDown={handleMouseDown}
            >
              <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full group-hover:bg-blue-500 transition-colors"></div>
            </div>
            <div className="px-4 pb-2 flex flex-col h-full">
                <header className="flex items-center justify-between pb-2">
                     <div className="flex items-center space-x-1">
                        <button className={getTabClass('operation')} onClick={() => setActiveTab('operation')}>Operation Log</button>
                        <button className={getTabClass('application')} onClick={() => setActiveTab('application')}>Application Log</button>
                     </div>
                </header>
                <main className="flex-grow overflow-hidden">
                    {activeTab === 'operation' && isCommandView && (
                        <LogView logs={operationLogs} progress={progress} isRunning={isRunning} exitCode={exitCode} />
                    )}
                    {activeTab === 'operation' && !isCommandView && (
                        <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                           <p>Operation logs are available when a command view is active.</p>
                        </div>
                    )}
                    {activeTab === 'application' && <LoggingPanel />}
                </main>
            </div>
        </div>
    );
};

export default ResizableLogPanel;