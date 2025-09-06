import React, { useEffect, FC, PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
}

const Modal: FC<PropsWithChildren<ModalProps>> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="fixed inset-0" 
                aria-hidden="true" 
                onClick={onClose}
            ></div>

            <div className="relative flex flex-col w-full max-w-4xl h-[80vh] m-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden">
                <header className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h2 id="modal-title" className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {title}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="flex-grow p-4 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>,
        document.body
    );
};

export default Modal;