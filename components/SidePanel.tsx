
import React from 'react';
import { AppView, SavedPlan } from '../types';

interface SidePanelProps {
  userName: string;
  currentView: AppView;
  savedPlans: SavedPlan[];
  onChangeView: (view: AppView) => void;
  onSelectPlan: (plan: SavedPlan) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
    badge?: number;
    special?: boolean;
    category?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ 
    icon, 
    label, 
    active, 
    onClick,
    badge,
    special,
    category
  }) => {
    
  if (category) {
      return (
          <div className="px-4 pt-6 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              {label}
          </div>
      );
  }

  return (
      <button 
          onClick={onClick}
          className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group active:scale-95 relative mb-1
              ${active 
              ? 'bg-indigo-50 text-indigo-600 shadow-sm font-medium' 
              : special 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md hover:shadow-lg hover:scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }
          `}
      >
          {/* Icon Container */}
          <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 transition-colors 
              ${active ? 'text-indigo-600' : special ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-600'}
          `}>
              {icon}
          </div>

          {/* Label */}
          <span className="font-medium whitespace-nowrap flex-1 text-left overflow-hidden truncate">
              {label}
          </span>

          {/* Badge */}
          {badge !== undefined && badge > 0 && (
              <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {badge}
              </span>
          )}
      </button>
  );
};

const SidePanel: React.FC<SidePanelProps> = ({ 
    userName, 
    currentView, 
    savedPlans,
    onChangeView, 
    onSelectPlan,
    onLogout, 
    isMobileOpen, 
    onCloseMobile 
}) => {

  const handleNavClick = (action: () => void) => {
    action();
    if (isMobileOpen) onCloseMobile();
  };

  return (
    <div className="h-full bg-white border-r border-slate-100 flex flex-col shadow-xl lg:shadow-none w-72">
      {/* Header */}
      <div className="p-6 flex items-center justify-between mb-2 flex-shrink-0 h-20">
        <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-indigo-200 shadow-lg flex-shrink-0">
              P
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800 whitespace-nowrap">
              Planner <span className="text-indigo-500">PRO</span>
            </span>
        </div>
        
        {isMobileOpen && (
            <button onClick={onCloseMobile} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 lg:hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        )}
      </div>

      {/* User Info */}
      <div className="px-3 mb-2 flex-shrink-0">
        <div 
            onClick={() => handleNavClick(() => onChangeView(AppView.PROFILE))}
            title="View Profile"
            className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 overflow-hidden cursor-pointer hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all duration-300 group"
        >
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors uppercase">
                {userName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{userName}</div>
                <div className="text-xs text-slate-400 group-hover:text-slate-500 truncate">Student Account</div>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 overflow-y-auto custom-scrollbar pb-4">
        <NavItem 
            active={currentView === AppView.DASHBOARD}
            onClick={() => handleNavClick(() => onChangeView(AppView.DASHBOARD))}
            label="Dashboard"
            icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            }
        />
        
        <NavItem category label="Core" onClick={() => {}} icon={null} />

        <NavItem 
            active={currentView === AppView.PLANNER}
            onClick={() => handleNavClick(() => onChangeView(AppView.PLANNER))}
            label="Study Planner"
            icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            }
        />

        <NavItem 
            active={currentView === AppView.FOCUS}
            onClick={() => handleNavClick(() => onChangeView(AppView.FOCUS))}
            label="Deep Focus"
            icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            }
        />

        <NavItem category label="Tools" onClick={() => {}} icon={null} />

        <NavItem 
            active={currentView === AppView.FLASHCARDS}
            onClick={() => handleNavClick(() => onChangeView(AppView.FLASHCARDS))}
            label="Flashcards"
            icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            }
        />

        <NavItem 
            active={currentView === AppView.RESOURCES}
            onClick={() => handleNavClick(() => onChangeView(AppView.RESOURCES))}
            label="Resource Finder"
            icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            }
        />

        <NavItem 
            active={currentView === AppView.ANALYZER}
            onClick={() => handleNavClick(() => onChangeView(AppView.ANALYZER))}
            label="Note Analyzer"
            icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            }
        />

        {/* Saved Plans Section */}
        {savedPlans.length > 0 && (
            <>
                <NavItem category label="Saved Plans" onClick={() => {}} icon={null} />
                <div className="space-y-1">
                    {savedPlans.slice().reverse().map((plan) => (
                        <NavItem 
                            key={plan.id}
                            label={plan.title || `Plan: ${plan.date}`}
                            onClick={() => handleNavClick(() => onSelectPlan(plan))} 
                            active={false}
                            icon={
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            }
                        />
                    ))}
                </div>
            </>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-slate-100 flex-shrink-0">
        <button 
            onClick={onLogout}
            title="Sign Out"
            className="w-full flex items-center gap-4 p-3 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors group active:scale-95"
        >
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </div>
            <span className="font-medium whitespace-nowrap">
                Sign Out
            </span>
        </button>
      </div>
    </div>
  );
};

export default SidePanel;
