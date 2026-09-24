import React, { useState, useRef, useEffect } from 'react';
import { BusinessSpot } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface BusinessAssistantChatProps {
  businesses: BusinessSpot[];
  onSelectBusiness: (b: BusinessSpot) => void;
  lang: 'EN' | 'አማ';
}

export const BusinessAssistantChat: React.FC<BusinessAssistantChatProps> = ({
  businesses,
  onSelectBusiness,
  lang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: lang === 'አማ'
        ? 'ሰላም! እኔ የኢትዮስፖት አርቴፊሻል ኢንተለጀንስ የንግድ ረዳት ነኝ። በአዲስ አበባ ያሉ ምርጥ የቡና ቆዪዎች፣ ምግብ ቤቶች፣ ክሊኒኮች እና አገልግሎቶችን እንድያገኙ ልርዳዎት?'
        : 'Hello! I am your EthioSpot AI Business Assistant. Ask me anything about finding coffee roasteries, traditional dining, clinics, or services in Addis Ababa!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend.trim(), businesses }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get AI response');

      const aiMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'ai',
        text: 'Sorry, I encountered an issue connecting to the Gemini AI assistant. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const presetQueries = [
    'Where can I buy authentic Yirgacheffe coffee beans?',
    'Best traditional Kitfo and Beyaynetu in Bole?',
    '24/7 emergency clinic and pharmacy near Kirkos',
    'Executive spa and steam bath in Medhanialem',
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 bg-[#005f2a] text-white px-3.5 py-3 rounded-full shadow-2xl hover:scale-105 transition-all cursor-pointer border border-[#97f8a9]/40"
          type="button"
          title="Open AI Business Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          </div>
          <div className="flex items-center gap-1 px-1">
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </div>
        </button>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl border border-[#eceef0] w-80 sm:w-96 flex flex-col h-[520px] overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#005f2a] to-[#0f7a3a] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] text-[15px] font-extrabold">EthioSpot AI Assistant</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Powered by Gemini API
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f8f9fc]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#005f2a] text-white rounded-br-none'
                      : 'bg-white text-[#191c1e] border border-[#eceef0] rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-[#6f7a6e] mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-[#eceef0] w-fit shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-[#005f2a] animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-[#005f2a] animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-[#005f2a] animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[12px] text-[#6f7a6e] font-medium ml-1">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Chips */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-white border-t border-[#eceef0] flex gap-1.5 overflow-x-auto scrollbar-none">
              {presetQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#005f2a] font-semibold whitespace-nowrap border border-emerald-200 transition-all cursor-pointer"
                  type="button"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[#eceef0] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about coffee, dining, clinics..."
              className="flex-1 bg-[#f0f2f5] text-[#191c1e] text-[13px] px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
