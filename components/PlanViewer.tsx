
import React from 'react';
import { SavedPlan } from '../types';
import { marked } from 'marked';

interface PlanViewerProps {
    plan: SavedPlan;
    onBack: () => void;
}

const PlanViewer: React.FC<PlanViewerProps> = ({ plan, onBack }) => {
    return (
        <div className="h-full flex flex-col bg-white relative">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-4 shadow-sm z-10 sticky top-0">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition active:scale-95"
                    title="Back"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                    <h1 className="text-lg font-bold text-slate-800">Saved Plan</h1>
                    <p className="text-xs text-slate-500">Created on {plan.date}</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50 custom-scrollbar">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <div className="mb-6 border-b border-slate-100 pb-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">{plan.title}</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">{plan.summary}</p>
                    </div>
                    
                    <div 
                        className="prose-content text-slate-800"
                        dangerouslySetInnerHTML={{ __html: marked.parse(plan.fullContent) as string }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default PlanViewer;
