
import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Doc = 'README.md' | 'FUNCTIONAL_MANUAL.md' | 'TECHNICAL_MANUAL.md' | 'CHANGELOG.md';

const InfoView: React.FC = () => {
    const [activeDoc, setActiveDoc] = useState<Doc>('README.md');
    const [content, setContent] = useState<string>('Loading...');
    const [error, setError] = useState<string | null>(null);

    const loadContent = useCallback(async (docName: Doc) => {
        setContent('Loading...');
        setError(null);
        try {
            if (window.electronAPI) {
                const docContent = await window.electronAPI.getDoc(docName);
                setContent(docContent);
            } else {
                throw new Error("Electron API is not available.");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(`Failed to load document: ${message}`);
            setContent('');
        }
    }, []);

    useEffect(() => {
        loadContent(activeDoc);
    }, [activeDoc, loadContent]);

    const getButtonClass = (doc: Doc) => {
        const base = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors duration-200";
        if (activeDoc === doc) {
            return `${base} bg-cyan-600 text-white`;
        }
        return `${base} bg-slate-700 text-slate-300 hover:bg-slate-600`;
    };

    const docs: { id: Doc, title: string }[] = [
        { id: 'README.md', title: 'README' },
        { id: 'FUNCTIONAL_MANUAL.md', title: 'Functional Manual' },
        { id: 'TECHNICAL_MANUAL.md', title: 'Technical Manual' },
        { id: 'CHANGELOG.md', title: 'Changelog' }
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 p-1 bg-slate-900/50 rounded-lg">
                {docs.map(doc => (
                    <button key={doc.id} className={getButtonClass(doc.id)} onClick={() => setActiveDoc(doc.id)}>
                        {doc.title}
                    </button>
                ))}
            </div>
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none bg-slate-900/50 p-4 rounded-lg border border-slate-700 h-96 overflow-y-auto">
                {error ? <p className="text-red-400">{error}</p> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>}
            </div>
        </div>
    );
};

export default InfoView;
