
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface DashboardProps {
  userName: string;
  onNavigate: (view: AppView) => void;
}

const STREAK_KEY = 'planner_pro_streak';

const Dashboard: React.FC<DashboardProps> = ({ userName, onNavigate }) => {
  const [streak, setStreak] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  const features = [
    {
      id: 'planner',
      view: AppView.PLANNER,
      title: 'Study Planner',
      desc: 'Generate custom weekly schedules.',
      icon: '📅',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      delay: '0s'
    },
    {
      id: 'focus',
      view: AppView.FOCUS,
      title: 'Deep Focus',
      desc: 'AI-powered Pomodoro & task breakdown.',
      icon: '🎯',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      delay: '0.1s'
    },
    {
      id: 'flashcards',
      view: AppView.FLASHCARDS,
      title: 'Flashcards',
      desc: 'Generate study decks with web-verified facts.',
      icon: '🎴',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      delay: '0.2s'
    },
    {
      id: 'resources',
      view: AppView.RESOURCES,
      title: 'Resource Finder',
      desc: 'Find trusted study materials online.',
      icon: '🔍',
      color: 'bg-teal-50 text-teal-600 border-teal-100',
      delay: '0.3s'
    },
    {
      id: 'analyzer',
      view: AppView.ANALYZER,
      title: 'Note Analyzer',
      desc: 'Scan notes for summaries & quizzes.',
      icon: '📸',
      color: 'bg-orange-50 text-orange-600 border-orange-100',
      delay: '0.4s'
    }
  ];

  useEffect(() => {
      const data = localStorage.getItem(STREAK_KEY);
      if (data) {
          try {
              const parsed = JSON.parse(data);
              const lastDate = new Date(parsed.lastDate);
              const today = new Date();
              
              // Normalize to start of day for comparison
              lastDate.setHours(0,0,0,0);
              today.setHours(0,0,0,0);
              
              const diffTime = Math.abs(today.getTime() - lastDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays === 0) {
                  // Already checked in today
                  setStreak(parsed.count);
                  setCheckedIn(true);
              } else if (diffDays === 1) {
                  // Checked in yesterday
                  setStreak(parsed.count);
                  setCheckedIn(false);
              } else {
                  // Streak broken
                  setStreak(0);
                  setCheckedIn(false);
              }
          } catch(e) {
              console.error("Error parsing streak", e);
              setStreak(0);
          }
      }
  }, []);

  const handleCheckIn = () => {
      if (checkedIn) return;

      setAnimating(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCheckedIn(true);
      
      localStorage.setItem(STREAK_KEY, JSON.stringify({
          count: newStreak,
          lastDate: new Date().toISOString()
      }));

      setTimeout(() => setAnimating(false), 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="h-full w-full bg-slate-50/50 flex flex-col overflow-y-auto custom-scrollbar p-4 md:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 md:mb-12 gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-1">
            {getGreeting()}, <span className="text-indigo-600">{userName}</span>.
          </h1>
          <p className="text-slate-500 text-lg">Ready to be productive today?</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {/* Streak Widget */}
            <button 
                onClick={handleCheckIn}
                className={`flex items-center gap-3 p-2 pr-4 rounded-full shadow-sm border transition-all duration-300 group
                    ${checkedIn 
                        ? 'bg-white border-orange-100 cursor-default' 
                        : 'bg-gradient-to-r from-orange-50 to-white border-orange-200 cursor-pointer hover:shadow-md hover:scale-105'
                    }
                `}
            >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-500 ${animating ? 'scale-125' : 'scale-100'}
                    ${checkedIn ? 'bg-orange-100 text-orange-500' : 'bg-white text-slate-300 group-hover:text-orange-400 shadow-inner'}`
                }>
                   🔥
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Study Streak</span>
                    <span className={`text-sm font-bold transition-colors ${checkedIn ? 'text-orange-600' : 'text-slate-600'}`}>
                        {streak} Days {checkedIn ? 'Active' : '• Check In'}
                    </span>
                </div>
            </button>

            {/* Profile Status Widget */}
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-slate-100 hidden sm:flex">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                    85%
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Status</span>
                    <span className="text-sm font-bold text-slate-800">Intermediate Level</span>
                </div>
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {features.map((f) => (
          <button
            key={f.id}
            onClick={() => onNavigate(f.view)}
            className={`group relative flex flex-col text-left p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fade-in-up`}
            style={{ animationDelay: f.delay }}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110 ${f.color}`}>
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions / Recent (Static for UI) */}
      <div className="mt-10 md:mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
          Quick Access
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
             <div className="min-w-[200px] p-4 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-lg cursor-pointer hover:opacity-90 transition">
                <div className="text-xs font-medium opacity-80 mb-1">Continue</div>
                <div className="font-bold text-lg mb-2">Physics: Kinematics</div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-white h-full w-[60%]"></div>
                </div>
             </div>
             <div className="min-w-[200px] p-4 bg-white border border-slate-200 rounded-xl text-slate-800 shadow-sm cursor-pointer hover:border-indigo-300 transition">
                <div className="text-xs font-bold text-rose-500 mb-1 uppercase">Due Today</div>
                <div className="font-bold text-lg mb-2">Math Practice Set</div>
                <div className="text-xs text-slate-400">15 mins remaining</div>
             </div>
             <div className="min-w-[200px] p-4 bg-white border border-slate-200 rounded-xl text-slate-800 shadow-sm cursor-pointer hover:border-indigo-300 transition">
                <div className="text-xs font-bold text-teal-500 mb-1 uppercase">New</div>
                <div className="font-bold text-lg mb-2">Weekly Summary</div>
                <div className="text-xs text-slate-400">View Report</div>
             </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
