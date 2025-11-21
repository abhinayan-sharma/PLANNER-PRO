
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { createInterviewChat } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';
import { marked } from 'marked';

interface ChatModeProps {
  userName: string;
  onUpdateHistory: (messages: ChatMessage[]) => void;
}

const ChatMode: React.FC<ChatModeProps> = ({ userName, onUpdateHistory }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize Chat
  useEffect(() => {
    const initChat = async () => {
      // Create chat only if not already created
      if (chatSessionRef.current) return;

      chatSessionRef.current = createInterviewChat(userName);
      setIsTyping(true);
      
      try {
        // Trigger the welcome message
        const result = await chatSessionRef.current.sendMessageStream({ message: "Start the conversation now. Introduce yourself." });
        
        let fullText = '';
        const botMsgId = Date.now().toString();
        
        // Initial placeholder
        setMessages([{ id: botMsgId, role: 'model', text: '', timestamp: Date.now() }]);

        for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          const text = c.text || '';
          fullText += text;
          setMessages(prev => {
            const others = prev.filter(m => m.id !== botMsgId);
            return [...others, { id: botMsgId, role: 'model', text: fullText, timestamp: Date.now() }];
          });
        }
        // Update history after first message
        onUpdateHistory([{ id: botMsgId, role: 'model', text: fullText, timestamp: Date.now() }]);

      } catch (e) {
        console.error("Failed to start chat", e);
      } finally {
        setIsTyping(false);
      }
    };

    initChat();
  }, [userName]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input;
    setInput(''); // Clear immediately
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    onUpdateHistory(newMessages);
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessageStream({ message: userText });
      
      let fullText = '';
      const botMsgId = (Date.now() + 1).toString();
      
      // Add bot placeholder
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: Date.now() }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullText += text;
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m));
      }

      // Sync final state to history
      const finalMessages = [...newMessages, { id: botMsgId, role: 'model', text: fullText, timestamp: Date.now() }];
      onUpdateHistory(finalMessages);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I'm having trouble connecting. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generatePDF = (htmlContent: string, title: string = 'Export') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups to export PDF.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Planner PRO - ${title}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; line-height: 1.6; color: #000; }
            h1 { border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 30px; color: #1e1b4b; }
            .header-info { margin-bottom: 30px; color: #64748b; font-size: 0.9em; }
            
            /* Markdown Styles for Print */
            table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 0.9em; page-break-inside: avoid; }
            th, td { border: 1px solid #000; padding: 8px 12px; text-align: left; color: #000 !important; }
            th { background-color: #f1f5f9; font-weight: 700; }
            ul, ol { margin: 10px 0; padding-left: 20px; }
            strong { color: #000; font-weight: 800; }
            .response-container { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="header-info">
            Generated for <strong>${userName}</strong> on ${new Date().toLocaleDateString()}
          </div>
          ${htmlContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleExportFullChat = () => {
    const content = messages.map(m => `
      <div style="margin-bottom: 20px; page-break-inside: avoid;">
        <div style="font-weight: bold; margin-bottom: 5px; color: ${m.role === 'user' ? '#334155' : '#4f46e5'};">
          ${m.role === 'user' ? 'You' : 'Planner PRO'}
        </div>
        <div class="prose-content" style="color: #000;">
          ${marked.parse(m.text)}
        </div>
      </div>
    `).join('');
    generatePDF(content, 'Study Plan Full Chat');
  };

  const handleExportSingleMessage = (msg: ChatMessage) => {
    const content = `
      <div class="response-container">
        <div style="font-weight: bold; margin-bottom: 5px; color: #4f46e5;">Planner PRO</div>
        <div class="prose-content" style="color: #000;">
          ${marked.parse(msg.text)}
        </div>
      </div>
    `;
    generatePDF(content, 'Study Plan Response');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-indigo-100 p-3 md:p-4 shadow-sm z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base md:text-xl shadow-lg shadow-indigo-200">
              P
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-800 text-sm md:text-lg truncate">Planner PRO</h1>
              <div className="flex items-center gap-2">
                  {isTyping ? (
                      <>
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full animate-ping"></span>
                          <span className="text-[10px] md:text-xs text-indigo-600 font-medium animate-pulse">Thinking...</span>
                      </>
                  ) : (
                      <>
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></span>
                          <span className="text-[10px] md:text-xs text-slate-500 font-medium">Online</span>
                      </>
                  )}
              </div>
            </div>
        </div>

        <button 
            onClick={handleExportFullChat}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm text-xs md:text-sm font-medium active:scale-95"
            title="Export Full Chat as PDF"
        >
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden md:inline">Export Chat</span>
            <span className="md:hidden">Export</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex max-w-[95%] md:max-w-[75%] gap-2 md:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-white shadow-sm mt-1
                ${msg.role === 'user' ? 'bg-slate-900' : 'bg-indigo-600'}`}>
                {msg.role === 'user' ? 'ME' : 'P'}
              </div>

              {/* Bubble */}
              <div className={`p-3 md:p-4 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden
                ${msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                
                {/* Markdown Content Render */}
                <div 
                    className="prose-content"
                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) as string }} 
                />
              </div>
            </div>

            {/* Individual Download Action for Model messages */}
            {msg.role === 'model' && !isTyping && (
                <div className="ml-10 md:ml-12 mt-1">
                    <button 
                        onClick={() => handleExportSingleMessage(msg)}
                        className="text-[10px] font-medium text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors uppercase tracking-wide p-1"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download
                    </button>
                </div>
            )}
          </div>
        ))}
        
        {/* Thinking Bubble Animation */}
        {isTyping && (
          <div className="flex w-full justify-start animate-fadeIn">
             <div className="flex max-w-[80%] md:max-w-[70%] gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-white shadow-sm mt-1">
                    P
                </div>
                <div className="bg-white border border-slate-100 p-3 md:p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                    <div className="flex space-x-1.5 pt-1.5 pb-1.5">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDuration: '1s' }}></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDuration: '1s', animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDuration: '1s', animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-xs font-medium text-indigo-400 italic">Analyzing...</span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isTyping ? "Thinking..." : "Type your message..."}
              className="w-full bg-slate-100 border-0 text-slate-800 rounded-full pl-4 md:pl-6 pr-12 md:pr-14 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isTyping}
              autoFocus
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 top-1.5 bottom-1.5 md:right-2 md:top-2 md:bottom-2 w-9 h-9 md:w-10 md:h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg transform active:scale-95"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
        </div>
        <div className="text-center mt-2 text-[10px] md:text-xs text-slate-400 hidden md:block">
           {isTyping ? 'Creating your personalized plan...' : 'Provide details to build your perfect schedule.'}
        </div>
      </div>
    </div>
  );
};

export default ChatMode;
