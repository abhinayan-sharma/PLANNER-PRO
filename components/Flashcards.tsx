
import React, { useState } from 'react';
import { generateFlashcards } from '../services/geminiService';
import { Flashcard } from '../types';

interface FlashcardsProps {
    onBack: () => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ onBack }) => {
    const [topic, setTopic] = useState('');
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setCards([]);
        setCurrentIndex(0);
        setIsFlipped(false);
        
        try {
            const generatedCards = await generateFlashcards(topic);
            setCards(generatedCards);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 200);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 200);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition active:scale-95"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            Flashcard Generator
                            <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Web Enabled</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center custom-scrollbar">
                
                {/* Input Section */}
                <div className="w-full max-w-2xl mb-10">
                    <div className="flex gap-3">
                        <input 
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            placeholder="Enter topic (e.g., 'French Revolution' or 'Python Lists')"
                            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={loading || !topic.trim()}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-all active:scale-95"
                        >
                            {loading ? 'Generating...' : 'Create Deck'}
                        </button>
                    </div>
                    {loading && (
                        <div className="mt-4 text-center text-slate-500 text-sm animate-pulse">
                            Browsing the web for accurate facts & generating cards...
                        </div>
                    )}
                </div>

                {/* Cards Area */}
                {cards.length > 0 && !loading && (
                    <div className="w-full max-w-xl flex flex-col items-center perspective-1000">
                        
                        {/* Card Container */}
                        <div 
                            className="relative w-full aspect-[5/3] cursor-pointer group perspective-1000"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className={`w-full h-full transition-all duration-500 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
                                
                                {/* Front */}
                                <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-8 text-center">
                                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">Question</div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                                        {cards[currentIndex].front}
                                    </h3>
                                    <div className="absolute bottom-6 text-slate-400 text-sm flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        Click to Flip
                                    </div>
                                </div>

                                {/* Back */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white">
                                    <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">Answer</div>
                                    <p className="text-lg md:text-xl font-medium leading-relaxed">
                                        {cards[currentIndex].back}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between w-full mt-8">
                            <button 
                                onClick={prevCard}
                                className="p-4 rounded-full bg-white shadow-md hover:bg-slate-50 text-slate-600 transition active:scale-95"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>

                            <div className="text-slate-500 font-medium">
                                {currentIndex + 1} / {cards.length}
                            </div>

                            <button 
                                onClick={nextCard}
                                className="p-4 rounded-full bg-white shadow-md hover:bg-slate-50 text-slate-600 transition active:scale-95"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                    </div>
                )}

                {!loading && cards.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                            🎴
                        </div>
                        <h3 className="text-lg font-medium text-slate-600">Ready to study?</h3>
                        <p>Enter a topic above to generate an AI-powered deck.</p>
                    </div>
                )}
            </div>
            
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};

export default Flashcards;
