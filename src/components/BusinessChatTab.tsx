import React, { useState, useEffect, useRef } from 'react';
import { BusinessSpot } from '../types';
import { Message, fetchBusinessMessages, sendMessage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface BusinessChatTabProps {
  business: BusinessSpot;
}

export const BusinessChatTab: React.FC<BusinessChatTabProps> = ({ business }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const list = await fetchBusinessMessages(business.id);
      // sort by createdAt
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(list);
    } catch (err) {
      console.warn('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll for live updates
    return () => clearInterval(interval);
  }, [business.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    setSending(true);
    try {
      await sendMessage(business.id, {
        businessId: business.id,
        userId: user.uid,
        userName: user.displayName || 'EthioSpot User',
        userEmail: user.email || undefined,
        text: inputText.trim(),
        sender: 'user',
      });
      setInputText('');
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[380px] bg-[#f8f9fc] rounded-2xl border border-[#eceef0] overflow-hidden">
      {/* Chat Header banner */}
      <div className="p-3.5 bg-white border-b border-[#eceef0] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#005f2a]/10 text-[#005f2a] flex items-center justify-center font-bold text-[13px]">
            {business.name.charAt(0)}
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#191c1e]">{business.name}</p>
            <p className="text-[11px] text-[#3f493f]">Direct Merchant Inquiry & Support</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#005f2a] font-bold text-[11px] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#005f2a] animate-pulse"></span>
          Online
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {!user ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <span className="material-symbols-outlined text-[36px] text-[#6f7a6e] mb-2">lock</span>
            <p className="text-[14px] font-bold text-[#191c1e] mb-1">Sign in to message this merchant</p>
            <p className="text-[12px] text-[#3f493f]">Connect your Google account to start a direct secure chat inquiry.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-[#005f2a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-12 h-12 rounded-full bg-[#005f2a]/10 text-[#005f2a] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[24px]">chat</span>
            </div>
            <p className="text-[14px] font-bold text-[#191c1e]">No messages yet</p>
            <p className="text-[12px] text-[#3f493f] max-w-xs">
              Send an inquiry regarding pricing, stock availability, or B2B bulk orders.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.userId === user?.uid;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-bold text-[#6f7a6e]">
                    {isMe ? 'You' : m.userName}
                  </span>
                  <span className="text-[10px] text-[#8c968b]">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-[#005f2a] text-white rounded-tr-none'
                      : 'bg-white text-[#191c1e] border border-[#eceef0] rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      {user && (
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#eceef0] flex items-center gap-2">
          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your inquiry or order request..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#f2f4f6] border border-[#eceef0] text-[13px] text-[#191c1e] outline-none focus:border-[#005f2a] transition-colors"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="w-10 h-10 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      )}
    </div>
  );
};
