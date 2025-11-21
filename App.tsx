
import React, { useState, useEffect } from 'react';
import { AppView, SavedPlan } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/ModeSelector';
import SidePanel from './components/SidePanel';
import FocusMode from './components/FocusMode';
import Planner from './components/Planner';
import PlanViewer from './components/PlanViewer';
import { ResourceManager, NoteAnalyzer } from './components/StudyTools';
import ProfileSettings from './components/ProfileSettings';
import Flashcards from './components/Flashcards';

const USER_NAME_KEY = 'planner_pro_user_name';
const SAVED_PLANS_KEY = 'planner_pro_saved_plans';

const App: React.FC = () => {
  // API Key check
  const hasApiKey = !!process.env.API_KEY;

  // Initialize state from localStorage if available
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(USER_NAME_KEY) || '';
  });

  const [view, setView] = useState<AppView>(() => {
    // If name exists, skip onboarding
    return localStorage.getItem(USER_NAME_KEY) ? AppView.DASHBOARD : AppView.ONBOARDING;
  });

  // Saved Plans State
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    const saved = localStorage.getItem(SAVED_PLANS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Selected Plan for viewing
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(savedPlans));
  }, [savedPlans]);

  if (!hasApiKey) {
     return (
         <div className="flex items-center justify-center h-screen bg-gray-50 text-red-600 p-4 text-center">
             <div>
                 <h1 className="text-2xl font-bold mb-2">Configuration Error</h1>
                 <p>API_KEY not found. Please configure your environment variables.</p>
             </div>
         </div>
     );
  }

  const handleOnboardingComplete = (name: string) => {
    localStorage.setItem(USER_NAME_KEY, name);
    setUserName(name);
    setView(AppView.DASHBOARD);
  };

  const handleUpdateName = (name: string) => {
      localStorage.setItem(USER_NAME_KEY, name);
      setUserName(name);
  };

  const handleViewChange = (newView: AppView) => {
    setView(newView);
    setMobileMenuOpen(false);
  };

  const handleSelectPlan = (plan: SavedPlan) => {
      setSelectedPlan(plan);
      setView(AppView.VIEW_PLAN);
      setMobileMenuOpen(false);
  };

  const handleSavePlan = (plan: SavedPlan) => {
      setSavedPlans(prev => [...prev, plan]);
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_NAME_KEY);
    setUserName('');
    setView(AppView.ONBOARDING);
  };

  return (
    <div className="h-screen bg-neutral-50 font-sans text-neutral-900 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Mobile/Tablet Portrait Header */}
        {view !== AppView.ONBOARDING && (
          <div className="lg:hidden flex-shrink-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shadow-sm">
             <div className="font-bold text-lg text-slate-800 flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-indigo-200 shadow-sm">
                P
               </div>
               <span>Planner <span className="text-indigo-500">PRO</span></span>
             </div>
             <button 
               onClick={() => setMobileMenuOpen(true)}
               className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 transition-all"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
          </div>
        )}

        {/* Side Panel (Responsive) */}
        {view !== AppView.ONBOARDING && (
            <>
              {/* Mobile/Tablet Portrait Overlay */}
              <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Panel Container */}
              <div className={`fixed inset-y-0 left-0 z-50 h-full lg:relative lg:z-auto transform transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidePanel 
                    userName={userName} 
                    currentView={view}
                    savedPlans={savedPlans}
                    onChangeView={handleViewChange}
                    onSelectPlan={handleSelectPlan}
                    onLogout={handleLogout}
                    isMobileOpen={mobileMenuOpen}
                    onCloseMobile={() => setMobileMenuOpen(false)}
                />
              </div>
            </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 relative h-full overflow-hidden flex flex-col w-full">
            <div className="flex-1 overflow-hidden relative w-full h-full">
              {view === AppView.ONBOARDING && (
                  <Onboarding onComplete={handleOnboardingComplete} />
              )}

              {view === AppView.DASHBOARD && (
                  <Dashboard userName={userName} onNavigate={handleViewChange} />
              )}

              {view === AppView.FOCUS && (
                  <FocusMode onBack={() => handleViewChange(AppView.DASHBOARD)} />
              )}
              
              {view === AppView.PLANNER && (
                  <Planner 
                      onBack={() => handleViewChange(AppView.DASHBOARD)} 
                      savedPlans={savedPlans}
                      onSavePlan={handleSavePlan}
                  />
              )}

              {view === AppView.FLASHCARDS && (
                  <Flashcards onBack={() => handleViewChange(AppView.DASHBOARD)} />
              )}

              {view === AppView.VIEW_PLAN && selectedPlan && (
                  <PlanViewer 
                      plan={selectedPlan}
                      onBack={() => handleViewChange(AppView.DASHBOARD)}
                  />
              )}

              {view === AppView.RESOURCES && (
                  <ResourceManager onBack={() => handleViewChange(AppView.DASHBOARD)} />
              )}

              {view === AppView.ANALYZER && (
                  <NoteAnalyzer onBack={() => handleViewChange(AppView.DASHBOARD)} />
              )}

              {view === AppView.PROFILE && (
                  <ProfileSettings 
                    currentName={userName}
                    onUpdateName={handleUpdateName}
                    onNavigate={handleViewChange}
                  />
              )}
            </div>
        </div>
    </div>
  );
};

export default App;
