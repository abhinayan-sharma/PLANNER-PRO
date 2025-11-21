
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: (name: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [stage, setStage] = useState<'INPUT' | 'WELCOME'>('INPUT');
  const [fading, setFading] = useState(false);

  const handleNameSubmit = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !name.trim()) return;
    
    setFading(true);
    setTimeout(() => {
      setStage('WELCOME');
      setFading(false);
    }, 600);
  };

  const handleStart = () => {
    setFading(true);
    setTimeout(() => {
      onComplete(name);
    }, 500);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-6 relative overflow-hidden font-sans selection:bg-violet-200">
      
      {/* Modern Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-violet-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-rose-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className={`transition-all duration-700 ease-out flex flex-col items-center justify-center w-full max-w-2xl z-10 transform ${fading ? 'opacity-0 translate-y-8 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
        
        {stage === 'INPUT' ? (
          <div className="w-full flex flex-col items-center">
            <span className="text-xs font-bold tracking-widest text-violet-500 mb-6 uppercase">Planner PRO</span>
            <h1 className="text-4xl md:text-6xl font-medium mb-12 tracking-tight text-slate-800 text-center leading-tight">
              Let's get to know you.
            </h1>
            
            <div className="relative w-full max-w-lg group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleNameSubmit}
                placeholder="What's your name?"
                className="w-full bg-transparent border-b-2 border-slate-200 text-center text-3xl md:text-5xl py-6 focus:outline-none focus:border-violet-500 transition-all duration-300 placeholder-slate-300 text-slate-800"
                autoFocus
              />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 transform scale-x-0 transition-transform duration-500 group-focus-within:scale-x-100"></div>
              
              <button 
                onClick={handleNameSubmit}
                className={`absolute right-0 bottom-6 p-2 text-slate-400 hover:text-violet-600 transition-all duration-300 ${name ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center h-full justify-center py-12 text-center">
             <div className="animate-fade-in-up">
                <div className="inline-block px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold tracking-widest mb-6 uppercase">
                  Identity Confirmed
                </div>
                <h1 className="text-5xl md:text-8xl font-medium tracking-tighter mb-6 text-slate-900">
                  Welcome, <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-500 animate-gradient-x">
                    {name}
                  </span>
                </h1>
                <p className="text-slate-500 text-xl md:text-2xl font-light max-w-lg mx-auto leading-relaxed">
                  Your productivity is about to reach new heights.
                </p>
             </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button for Welcome Stage */}
      {stage === 'WELCOME' && (
        <div className={`absolute bottom-16 left-0 right-0 flex justify-center transition-all duration-1000 delay-500 ${fading ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
            <button
              onClick={handleStart}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-medium text-white transition-all duration-200 bg-slate-900 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-600"
            >
              <span className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
              <span className="relative flex items-center gap-3 text-lg">
                Start Planner Pro
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
