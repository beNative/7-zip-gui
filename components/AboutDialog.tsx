import React from 'react';
import Modal from './Modal';

interface AboutDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="About 7-Zip GUI">
            <div className="text-center text-slate-700 dark:text-slate-300 p-6 space-y-4">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">7-Zip GUI</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Version 1.0.5</p>
                
                <div className="space-y-1 pt-4">
                    <p>Design and concept by <span className="font-semibold">Tim Sinaeve</span></p>
                    <p>Implementation by <span className="font-semibold">Gemini 2.5 Pro</span></p>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 pt-6">
                    © 2025 Tim Sinaeve
                </p>
            </div>
        </Modal>
    );
};

export default AboutDialog;
