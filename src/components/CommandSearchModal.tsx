import React, { useState, useEffect } from 'react';
import { BusinessSpot } from '../types';

interface CommandSearchModalProps {
  businesses: BusinessSpot[];
  isOpen: boolean;
  onClose: () => void;
  onSelectBusiness: (b: BusinessSpot) => void;
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({
  businesses,
  isOpen,
  onClose,
  onSelectBusiness,
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setSpeechSupported(true);
      }
    }
  }, []);

  const handleToggleVoiceSearch = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript.trim());
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = businesses.filter((b) => {
    const q = query.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.nameAmharic.includes(q) ||
      b.categoryLabel.toLowerCase().includes(q) ||
      b.district.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)) ||
      b.licenseNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#eceef0] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#eceef0] gap-3">
          <span className="material-symbols-outlined text-[#005f2a] text-[24px]">search</span>
          <input
            autoFocus
            type="text"
            placeholder={isListening ? "Listening... Speak business name or category" : "Search verified businesses, sectors, or MoT license #..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#191c1e] placeholder:text-[#6f7a6e]"
          />
          {speechSupported && (
            <button
              type="button"
              onClick={handleToggleVoiceSearch}
              title={isListening ? "Listening (click to stop)" : "Voice Search (speak business name or category)"}
              className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'bg-[#f2f4f6] hover:bg-[#e4ebe4] text-[#005f2a]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isListening ? 'mic' : 'mic'}
              </span>
            </button>
          )}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#6f7a6e] hover:text-[#191c1e] text-[12px] px-2 py-1 bg-[#f2f4f6] rounded-lg cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[#6f7a6e] hover:text-[#191c1e] text-[12px] px-2.5 py-1 bg-[#f2f4f6] rounded-lg font-mono cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#f2f4f6]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[#6f7a6e] text-[14px]">
              No verified Ethiopian enterprises matched &ldquo;{query}&rdquo;.
              <p className="text-[12px] text-[#3f493f] mt-1">Try searching &ldquo;Tomoca&rdquo;, &ldquo;Bole&rdquo;, or &ldquo;Hardware&rdquo;.</p>
            </div>
          ) : (
            filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  onSelectBusiness(b);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-2xl hover:bg-[#f8f9fc] flex items-center gap-3.5 transition-colors group"
              >
                <img
                  src={b.imageUrl}
                  alt={b.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#eceef0] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[14px] font-bold text-[#191c1e] truncate group-hover:text-[#005f2a] transition-colors">
                      {b.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-[#005f2a] px-2 py-0.5 rounded-full bg-[#97f8a9]/30 flex-shrink-0">
                      {b.categoryLabel}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#3f493f] truncate">
                    {b.address} • {b.priceRange}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#6f7a6e] text-[20px] group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#f8f9fc] border-t border-[#eceef0] flex items-center justify-between text-[11px] text-[#6f7a6e]">
          <span>EthioSpot Sovereign Commercial Index</span>
          <span className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-[#eceef0] rounded">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-[#eceef0] rounded">↓</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-[#eceef0] rounded">Enter</kbd>
          </span>
        </div>
      </div>
    </div>
  );
};
