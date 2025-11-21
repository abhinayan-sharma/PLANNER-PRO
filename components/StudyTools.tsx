
import React, { useState } from 'react';
import { findStudyResources, analyzeStudyNotes } from '../services/geminiService';
import { SearchResult } from '../types';

interface ToolProps {
    onBack: () => void;
}

/* --- CHAT COMPONENT (Kept simple for internal use, main Chat is ChatMode.tsx) --- */

export const ResourceManager: React.FC<ToolProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; links: SearchResult[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query) return;
    setLoading(true);
    const data = await findStudyResources(query);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-white relative overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 bg-white flex items-center gap-4 sticky top-0 z-10">
            <button 
                onClick={onBack}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition active:scale-95"
                title="Back to Dashboard"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Resource Finder</h1>
                <p className="text-slate-500 text-sm">AI-grounded search for academic materials.</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-3xl mx-auto w-full">
                <div className="flex gap-3 mb-8">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input 
                            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition shadow-sm"
                            placeholder="e.g. 'Introduction to Quantum Entanglement' or 'Calculus derivatives'"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && search()}
                        />
                    </div>
                    <button 
                        onClick={search} 
                        disabled={loading} 
                        className="bg-teal-600 text-white px-6 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 shadow-sm transition-all active:scale-95"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-pulse">
                        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
                        <p>Scanning the web for credible sources...</p>
                    </div>
                )}

                {!loading && result && (
                    <div className="animate-fade-in-up space-y-8">
                        <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100">
                            <h3 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                AI Summary
                            </h3>
                            <p className="text-slate-700 leading-relaxed text-lg">{result.text}</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 text-lg">Source Links</h3>
                            <div className="grid gap-3">
                                {result.links.map((link, i) => (
                                    <a 
                                        key={i} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-500 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                            </div>
                                            <span className="font-medium text-slate-700 truncate group-hover:text-teal-700">{link.title}</span>
                                        </div>
                                        <span className="text-slate-400 text-sm group-hover:text-teal-500 whitespace-nowrap">Visit Site &rarr;</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {!loading && !result && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                            🔍
                        </div>
                        <h3 className="text-slate-800 font-medium text-lg">Start your research</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mt-2">Enter a topic above to get an AI summary and verified external links.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export const NoteAnalyzer: React.FC<ToolProps> = ({ onBack }) => {
    const [image, setImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setAnalysis('');
            };
            reader.readAsDataURL(file);
        }
    };

    const analyze = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const base64 = image.split(',')[1];
            const result = await analyzeStudyNotes(base64, "Analyze these notes. 1. Provide a concise summary. 2. Identify 3 key concepts. 3. Generate 2 practice quiz questions with answers.");
            setAnalysis(result);
        } catch (e) {
            setAnalysis("Error processing image.");
        }
        setLoading(false);
    };

    return (
        <div className="h-full flex flex-col bg-white relative overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 bg-white flex items-center gap-4 sticky top-0 z-10">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition active:scale-95"
                    title="Back to Dashboard"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Note Scanner</h1>
                    <p className="text-slate-500 text-sm">Upload handwritten notes or textbook pages for AI analysis.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="max-w-3xl mx-auto w-full">
                    
                    {!image ? (
                         <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <p className="mb-2 text-lg text-slate-700 font-medium"><span className="text-orange-600 font-bold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-slate-500">SVG, PNG, JPG (MAX. 800x400px)</p>
                            </div>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 flex justify-center">
                                <img src={image} alt="Upload" className="max-h-80 object-contain opacity-90" />
                                <button 
                                    onClick={() => { setImage(null); setAnalysis(''); }}
                                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {!analysis && (
                                <button 
                                    onClick={analyze} 
                                    disabled={loading}
                                    className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-orange-700 disabled:opacity-50 transition-all active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Analyzing Image...
                                        </span>
                                    ) : 'Generate Insights'}
                                </button>
                            )}
                        </div>
                    )}

                    {analysis && (
                        <div className="mt-8 animate-fade-in-up">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="text-2xl">✨</span> Analysis Result
                                </h3>
                                <div className="prose-content text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                    {analysis}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
