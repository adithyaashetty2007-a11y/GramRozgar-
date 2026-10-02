import React, { useState } from 'react';
import { Language } from '../types';
import { T } from '../services/translations';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface AiAdvisorDrawerProps {
  language: Language;
  businessContext?: {
    businessTitle: string;
    locationName: string;
    capital: number;
  };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export const AiAdvisorDrawer: React.FC<AiAdvisorDrawerProps> = ({
  language,
  businessContext,
}) => {
  const isKn = language === 'kn';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: isKn
        ? 'ನಮಸ್ಕಾರ! ನಾನು ಗ್ರಾಮರೋಜ್‌ಗಾರ್ ವ್ಯವಹಾರ ಸಲಹೆಗಾರ. ನಿಮ್ಮ ವ್ಯಾಪಾರ, ಸರ್ಕಾರಿ ಸಾಲ, ಬ್ಯಾಂಕ್ ದಾಖಲೆ ಅಥವಾ ಮಾರುಕಟ್ಟೆಯ ಬಗ್ಗೆ ಯಾವುದೇ ಅನುಮಾನವಿದ್ದರೆ ಕೇಳಿ.'
        : "Namaste! I am your GramRozgar Rural Business Advisor. Ask me anything about your idea, bank loans, subsidy documents, or local market steps.",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.text,
          context: businessContext,
          language,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text:
          data.reply ||
          (isKn
            ? 'ಉತ್ತರ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
            : 'Could not fetch guidance. Please try again.'),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'assistant',
          text: isKn
            ? 'ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ತೊಂದರೆ ಇದೆ. ದಯವಿಟ್ಟು ನೇರವಾಗಿ ಪ್ರಯತ್ನಿಸಿ.'
            : 'Network connection issue. Please retry.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const speakText = async (text: string) => {
    // Try server-side Gemini TTS first
    try {
      const res = await fetch('/api/advisor/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn('Chat TTS fallback:', err);
    }

    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = isKn ? 'kn-IN' : 'en-IN';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer group"
          title={isKn ? 'ಎಐ ಸಲಹೆಗಾರರೊಂದಿಗೆ ಮಾತನಾಡಿ' : 'Ask AI Business Advisor'}
        >
          <Sparkles className="w-4 h-4 text-emerald-300 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold tracking-wide">
            {isKn ? 'ಸಲಹೆ ಕೇಳಿ (AI Advisor)' : 'Ask Business Advisor'}
          </span>
        </button>
      )}

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div className="no-print fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-emerald-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-xs font-bold">
                    {isKn ? 'ಗ್ರಾಮರೋಜ್‌ಗಾರ್ ಎಐ ಸಲಹೆಗಾರ' : 'GramRozgar AI Advisor'}
                  </h3>
                  <span className="text-[10px] text-emerald-200">
                    {isKn ? 'ಗ್ರಾಮೀಣ ಉದ್ಯಮ ಮಾರ್ಗದರ್ಶಿ' : 'Rural Business Guidance'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsOpen(false);
                }}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${
                      isUser ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                        isUser
                          ? 'bg-stone-800 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>

                    <div
                      className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                        isUser
                          ? 'bg-emerald-800 text-white rounded-tr-xs'
                          : 'bg-stone-100 text-stone-800 rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>

                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => speakText(m.text)}
                          className="mt-2 text-[10px] text-emerald-800 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{isKn ? 'ಕೇಳಿ' : 'Listen'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2 text-stone-400 text-xs">
                  <div className="w-3 h-3 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                  <span>{isKn ? 'ಯೋಚಿಸುತ್ತಿದೆ...' : 'Advisor is thinking...'}</span>
                </div>
              )}
            </div>

            {/* Quick Sample Questions */}
            <div className="p-3 border-t border-stone-100 bg-stone-50 overflow-x-auto flex gap-2">
              {[
                isKn ? 'ಮುದ್ರಾ ಸಾಲಕ್ಕೆ ಯಾವ ದಾಖಲೆ ಬೇಕು?' : 'What documents for Mudra?',
                isKn ? 'ಕಡಿಮೆ ಬಂಡವಾಳದಲ್ಲಿ ಆರಂಭಿಸುವುದು ಹೇಗೆ?' : 'How to start with lower capital?',
                isKn ? 'ಗ್ರಾಹಕರನ್ನು ಆಕರ್ಷಿಸಲು ಸಲಹೆ' : 'Tips to attract first customers',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(chip)}
                  className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-[11px] text-stone-700 whitespace-nowrap hover:bg-stone-100 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-stone-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isKn
                    ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...'
                    : 'Ask your business question...'
                }
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-700"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
