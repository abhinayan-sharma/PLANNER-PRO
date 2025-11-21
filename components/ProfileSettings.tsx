
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface ProfileSettingsProps {
  currentName: string;
  onUpdateName: (name: string) => void;
  onNavigate: (view: AppView) => void;
}

interface StudentDetails {
    country: string;
    state: string;
    board: string;
    grade: string;
    subjects: string[];
}

const STUDENT_DETAILS_KEY = 'planner_pro_student_details';

const COMMON_SUBJECTS = [
    "Physics", "Chemistry", "Mathematics", "Biology", 
    "Computer Science", "English", "Economics", 
    "Accountancy", "Business Studies", "History", 
    "Political Science", "Psychology", "Sociology"
];

const BOARDS = ["CBSE", "ICSE", "IGCSE", "IB", "State Board", "Other"];
const GRADES = ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "University"];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentName, onUpdateName, onNavigate }) => {
  const [name, setName] = useState(currentName);
  const [details, setDetails] = useState<StudentDetails>({
      country: '',
      state: '',
      board: '',
      grade: '',
      subjects: []
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STUDENT_DETAILS_KEY);
    if (saved) {
        setDetails(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STUDENT_DETAILS_KEY, JSON.stringify(details));
    onUpdateName(name);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const toggleSubject = (sub: string) => {
      setDetails(prev => {
          const exists = prev.subjects.includes(sub);
          if (exists) {
              return { ...prev, subjects: prev.subjects.filter(s => s !== sub) };
          } else {
              return { ...prev, subjects: [...prev.subjects, sub] };
          }
      });
  };

  // Check if grade is Class 11 or 12 (flexible matching)
  const showSubjects = details.grade.includes('11') || details.grade.includes('12');

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => onNavigate(AppView.DASHBOARD)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Edit Profile</h1>
                    <p className="text-slate-500 text-xs">Update your academic preferences</p>
                </div>
            </div>
            <button 
                onClick={handleSave}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                    isSaved 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95'
                }`}
            >
                {isSaved ? 'Saved!' : 'Save Changes'}
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
                
                {/* Personal Info Card */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Personal Information</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Country</label>
                                <input 
                                    type="text" 
                                    value={details.country}
                                    onChange={(e) => setDetails({...details, country: e.target.value})}
                                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
                                    placeholder="e.g. India"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">State / Region</label>
                                <input 
                                    type="text" 
                                    value={details.state}
                                    onChange={(e) => setDetails({...details, state: e.target.value})}
                                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
                                    placeholder="e.g. Karnataka"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Details Card */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Academic Profile</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Board of Education</label>
                            <div className="relative">
                                <select 
                                    value={details.board}
                                    onChange={(e) => setDetails({...details, board: e.target.value})}
                                    className="w-full p-3.5 appearance-none rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-slate-50 focus:bg-white font-medium text-slate-700"
                                >
                                    <option value="" disabled>Select Board</option>
                                    {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Current Class</label>
                            <div className="relative">
                                <select 
                                    value={details.grade}
                                    onChange={(e) => setDetails({...details, grade: e.target.value})}
                                    className="w-full p-3.5 appearance-none rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-slate-50 focus:bg-white font-medium text-slate-700"
                                >
                                    <option value="" disabled>Select Class</option>
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Subject Selection */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showSubjects ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-5 border border-teal-100">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-bold text-teal-800 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    Select Subjects
                                </label>
                                <span className="text-xs font-medium text-teal-600 bg-white px-2 py-1 rounded-md shadow-sm border border-teal-100">
                                    {details.subjects.length} Selected
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {COMMON_SUBJECTS.map(subject => {
                                    const isSelected = details.subjects.includes(subject);
                                    return (
                                        <button
                                            key={subject}
                                            onClick={() => toggleSubject(subject)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center gap-2 ${
                                                isSelected 
                                                ? 'bg-teal-600 text-white border-teal-600 shadow-md transform scale-[1.02]' 
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600 hover:shadow-sm'
                                            }`}
                                        >
                                            {subject}
                                            {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-4 flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input 
                                        type="text"
                                        placeholder="Add custom subject..."
                                        className="w-full pl-4 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white/50"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = e.currentTarget.value.trim();
                                                if (val && !details.subjects.includes(val)) {
                                                    toggleSubject(val);
                                                    e.currentTarget.value = '';
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-slate-400 whitespace-nowrap">Press Enter</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};

export default ProfileSettings;
