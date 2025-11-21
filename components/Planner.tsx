
import React, { useState, useEffect, useRef } from 'react';
import { createInteractivePlannerChat } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';
import { marked } from 'marked';
import { SavedPlan } from '../types';

interface PlannerProps {
  onBack: () => void;
  savedPlans: SavedPlan[];
  onSavePlan: (plan: SavedPlan) => void;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

const STORAGE_KEY_PROFILE = 'planner_pro_student_details';

const Planner: React.FC<PlannerProps> = ({ onBack, savedPlans, onSavePlan }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Load initial context and start chat
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initPlanner = async () => {
      // 1. Load Profile
      const profileStr = localStorage.getItem(STORAGE_KEY_PROFILE);
      const profile = profileStr ? JSON.parse(profileStr) : {};
      
      // 2. Load History Context (Previous plans from props)
      // We prioritize the most recent plan for full context
      let historyContext = "No previously saved plans found.";
      if (savedPlans.length > 0) {
          // Take the last 2 plans max to avoid token limit issues, but prioritize the absolute latest
          const recentPlans = savedPlans.slice(-2);
          historyContext = recentPlans.map(p => 
              `--- START PREVIOUS PLAN (${p.date}) ---\nTitle: ${p.title}\nSummary: ${p.summary}\nContent: ${p.fullContent}\n--- END PREVIOUS PLAN ---`
          ).join('\n\n');
      }

      // 3. Create Chat with Context
      chatRef.current = createInteractivePlannerChat(profile, historyContext);

      setIsTyping(true);
      try {
        // Initial greeting prompt
        const result = await chatRef.current.sendMessageStream({ 
            message: "Start the planning session. Check the profile and previous plans context provided in system instructions. If a previous plan exists, mention it to show continuity. Ask what the goal is for the NEW plan." 
        });

        let text = '';
        const msgId = Date.now().toString();
        setMessages([{ id: msgId, role: 'model', text: '' }]);

        for await (const chunk of result) {
            const c = chunk as GenerateContentResponse;
            text += c.text || '';
            setMessages([{ id: msgId, role: 'model', text }]);
        }
      } catch (e) {
          console.error(e);
          setMessages([{ id: 'err', role: 'model', text: "Connection failed. Please check your API key or internet." }]);
      } finally {
          setIsTyping(false);
      }
    };

    initPlanner();
  }, [savedPlans]);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
      scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
      if (!input.trim() || isTyping) return;
      const userText = input;
      setInput('');
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
      setIsTyping(true);

      try {
          const result = await chatRef.current.sendMessageStream({ message: userText });
          let botText = '';
          const botId = (Date.now()+1).toString();
          
          setMessages(prev => [...prev, { id: botId, role: 'model', text: '' }]);

          for await (const chunk of result) {
              const c = chunk as GenerateContentResponse;
              botText += c.text || '';
              setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: botText } : m));
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsTyping(false);
      }
  };

  const handleFinalizePlan = () => {
      // We save the last model message as the "Plan"
      const lastModelMsg = [...messages].reverse().find(m => m.role === 'model');
      if (!lastModelMsg) return;

      setIsFinalizing(true);

      // Heuristic to find a title (e.g., first line or just "Plan for Date")
      const lines = lastModelMsg.text.split('\n').filter(l => l.trim().length > 0);
      const titleCandidate = lines.find(l => l.startsWith('#'))?.replace(/#/g, '').trim() || `Plan created on ${new Date().toLocaleDateString()}`;

      const newPlan: SavedPlan = {
          id: Date.now(),
          title: titleCandidate,
          date: new Date().toLocaleDateString(),
          summary: lastModelMsg.text.substring(0, 150) + "...", // Simple summary
          fullContent: lastModelMsg.text
      };

      // Call parent handler
      onSavePlan(newPlan);

      setTimeout(() => {
          setIsFinalizing(false);
          alert("Plan Finalized and Saved! It is now available in the 'Saved Plans' sidebar.");
      }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-white relative">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition active:scale-95"
                    title="Exit to Dashboard"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                    <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        Interactive Planner
                        <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Live</span>
                    </h1>
                </div>
            </div>
            <button 
                onClick={handleFinalizePlan}
                disabled={messages.length < 2 || isFinalizing}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                    isFinalizing 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
            >
                {isFinalizing ? (
                    <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                        Saving...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                        Finalize Plan
                    </>
                )}
            </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
            {/* Info Banner */}
            <div className="text-center py-2">
                <p className="text-xs text-slate-400">
                    Gemini 3 Pro is reviewing your profile and {savedPlans.length} saved plans to build the perfect schedule.
                </p>
            </div>

            {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-1 ${msg.role === 'user' ? 'bg-slate-800' : 'bg-indigo-600'}`}>
                            {msg.role === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base overflow-hidden ${
                            msg.role === 'user' 
                            ? 'bg-white text-slate-800 border border-slate-100 rounded-tr-none' 
                            : 'bg-white text-slate-800 border border-indigo-100 rounded-tl-none'
                        }`}>
                            <div 
                                className="prose-content" 
                                dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) as string }} 
                            />
                        </div>
                    </div>
                </div>
            ))}
            
            {isTyping && (
                <div className="flex justify-start animate-pulse">
                    <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none ml-11">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-100 p-4">
            <div className="max-w-4xl mx-auto relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Discuss your plan (e.g., 'I have a math exam on Friday')"
                    className="w-full bg-slate-50 border border-slate-200 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition shadow-sm"
                    disabled={isTyping}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-300 transition-all active:scale-95 shadow-md"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </div>
        </div>
    </div>
  );
};

export default Planner;
