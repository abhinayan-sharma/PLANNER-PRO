
import React, { useState, useEffect, useRef } from 'react';
import { generateTaskBreakdown } from '../services/geminiService';
import { TaskBreakdown } from '../types';

interface FocusModeProps {
    onBack: () => void;
}

const TIMER_DURATION = 25 * 60; // 25 minutes in seconds

const FocusMode: React.FC<FocusModeProps> = ({ onBack }) => {
  const [taskInput, setTaskInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskBreakdown | null>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleGenerate = async () => {
    if (!taskInput.trim()) return;
    setIsGenerating(true);
    try {
      const breakdown = await generateTaskBreakdown(taskInput);
      // Ensure IDs are strings
      const sanitized = {
        ...breakdown,
        subtasks: breakdown.subtasks.map((s, i) => ({...s, id: s.id || i.toString(), completed: false}))
      };
      setActiveTask(sanitized);
    } catch (e) {
      console.error("Failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSubtask = (id: string) => {
    if (!activeTask) return;
    setActiveTask({
      ...activeTask,
      subtasks: activeTask.subtasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    });
  };

  const toggleTimer = () => {
    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
            // Play sound or notify
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setTimeLeft(TIMER_DURATION);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Progress calculation
  const progress = activeTask 
    ? (activeTask.subtasks.filter(t => t.completed).length / activeTask.subtasks.length) * 100 
    : 0;

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white relative overflow-y-auto custom-scrollbar">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(79,70,229,0.15),transparent_70%)]"></div>
        {isRunning && (
             <div className="absolute inset-0 bg-black/10 animate-pulse" style={{ animationDuration: '4s' }}></div>
        )}
      </div>

      {/* Exit Button */}
      <div className="absolute top-4 left-4 z-20">
        <button 
            onClick={onBack}
            className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition backdrop-blur-md"
            title="Exit Focus Mode"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="z-10 flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full min-h-full pt-16 md:pt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Deep Focus Mode
            </h1>
            <p className="text-slate-400 text-sm md:text-base">AI-Powered Productivity Sprints</p>
          </div>
          {activeTask && (
             <button 
                onClick={() => { setActiveTask(null); resetTimer(); setTaskInput(''); }}
                className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition"
             >
                New Session
             </button>
          )}
        </div>

        {!activeTask ? (
          // Input View
          <div className="flex-1 flex flex-col justify-center items-center text-center pb-20">
             <div className="max-w-lg w-full space-y-6 animate-fadeIn px-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl md:text-4xl">
                    🎯
                </div>
                <h2 className="text-xl md:text-2xl font-semibold leading-tight">What is your goal for the next 25 minutes?</h2>
                <div className="relative">
                    <input 
                        type="text" 
                        value={taskInput}
                        onChange={e => setTaskInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                        placeholder="e.g., Learn Calculus, Read Ch 4"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-base md:text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-slate-500 transition-all shadow-lg"
                        autoFocus
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !taskInput}
                        className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 md:px-6 rounded-lg font-medium transition-all disabled:opacity-50 text-sm md:text-base"
                    >
                        {isGenerating ? 'Planning...' : 'Start'}
                    </button>
                </div>
                <p className="text-xs md:text-sm text-slate-500">Gemini will break this goal into actionable micro-tasks to keep you on track.</p>
             </div>
          </div>
        ) : (
          // Active Session View
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center pb-8">
             
             {/* Timer Section */}
             <div className="flex flex-col items-center justify-center order-1 lg:order-none mt-4 lg:mt-0">
                <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center mb-8">
                    {/* Ring SVG */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="4" />
                        <circle 
                            cx="50" cy="50" r="45" fill="none" stroke={isRunning ? '#818cf8' : '#475569'} strokeWidth="4" 
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * (timeLeft / TIMER_DURATION))}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <div className="absolute text-5xl md:text-6xl font-mono font-bold tracking-wider">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex gap-4 w-full justify-center">
                    <button 
                        onClick={toggleTimer}
                        className={`px-8 py-4 rounded-full font-bold text-lg transition-all transform active:scale-95 shadow-lg ${
                            isRunning 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' 
                            : 'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-500'
                        }`}
                    >
                        {isRunning ? 'Pause Focus' : 'Start Timer'}
                    </button>
                    <button 
                        onClick={resetTimer}
                        className="px-6 py-4 rounded-full bg-slate-800 text-slate-400 font-medium hover:bg-slate-700 transition active:scale-95"
                    >
                        Reset
                    </button>
                </div>
             </div>

             {/* Checklist Section */}
             <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 md:p-6 backdrop-blur-sm w-full flex flex-col h-auto lg:h-[500px] order-2 lg:order-none">
                <div className="mb-4 flex justify-between items-end">
                    <div className="overflow-hidden">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-1 truncate pr-2">{activeTask.topic}</h3>
                        <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">AI Breakdown</span>
                    </div>
                    <div className="text-sm text-slate-400 whitespace-nowrap">{Math.round(progress)}% Done</div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-700 h-1.5 rounded-full mb-6 overflow-hidden flex-shrink-0">
                    <div 
                        className="bg-indigo-500 h-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar flex-1 min-h-[200px]">
                    {activeTask.subtasks.map((task) => (
                        <div 
                            key={task.id}
                            onClick={() => toggleSubtask(task.id)}
                            className={`group flex items-start gap-4 p-3 md:p-4 rounded-xl border transition-all cursor-pointer select-none ${
                                task.completed 
                                ? 'bg-indigo-900/20 border-indigo-500/30 opacity-60' 
                                : 'bg-slate-700/30 border-slate-600 hover:border-indigo-500/50 hover:bg-slate-700/50'
                            }`}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
                                task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500 group-hover:border-indigo-400'
                            }`}>
                                {task.completed && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm md:text-base transition-all break-words ${task.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                    {task.text}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Est: {task.estimatedMin} mins</div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusMode;
