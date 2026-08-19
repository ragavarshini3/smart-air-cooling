import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  HelpCircle, 
  Loader2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { postAIChat } from '../services/api';
import { AIChatMessage } from '../types';

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Cooling Assistant powered by Google Gemini. I have real-time context on system temperatures, humidity, fan status, thermal threshold rules, and alerts. How can I assist your climate operations today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || sending) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend, time: timeStr }]);
    if (!customText) setInput('');
    setSending(true);

    try {
      const res: AIChatMessage = await postAIChat(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.ai_response,
          time: new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I encountered an issue querying the Gemini AI service. Please verify your GEMINI_API_KEY in backend/.env.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    'Why is the fan running at high speed?',
    'What was the highest temperature today?',
    "Give me today's cooling performance summary.",
    'How can I improve cooling efficiency?',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* Header Banner */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 shrink-0 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              AI Cooling Assistant
              <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30 flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" /> GEMINI AI
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">Database-grounded operational climate insights</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center space-x-2 transition-all hover:bg-slate-800"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="flex-1 bg-slate-850 border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-5 min-h-[380px] shadow-inner">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3.5 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md ${
                msg.sender === 'user'
                  ? 'bg-sky-600'
                  : 'bg-gradient-to-tr from-sky-500 to-indigo-600'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-3xl space-y-1.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-4 sm:p-5 rounded-2xl text-sm sm:text-base leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white font-medium rounded-tr-none shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none font-sans whitespace-pre-wrap shadow-md'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-xs text-slate-400 font-mono px-1 block">
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {sending && (
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 text-white animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl rounded-tl-none text-sm font-medium text-sky-400 flex items-center space-x-3 shadow-md">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing database metrics & consulting Gemini AI...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Recommendations */}
      <div className="shrink-0 space-y-2.5">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-sky-400" /> Suggested Prompts
        </span>
        <div className="flex flex-wrap gap-2.5">
          {quickPrompts.map((promptText, i) => (
            <button
              key={i}
              onClick={() => handleSend(promptText)}
              disabled={sending}
              className="text-xs sm:text-sm bg-slate-850 hover:bg-slate-800 text-slate-200 font-medium border border-slate-800 hover:border-sky-500/50 px-4 py-2 rounded-xl transition-all disabled:opacity-50 text-left shadow-sm"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="shrink-0 flex items-center space-x-3 bg-slate-850 border border-slate-800 p-2.5 rounded-2xl shadow-lg"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Assistant about thermal trends, fan speeds, or system status..."
          disabled={sending}
          className="flex-1 bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-400 px-4 py-2.5 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-sky-500 hover:bg-sky-600 text-white p-3 rounded-xl transition-all shadow-md shadow-sky-500/30 disabled:opacity-40 disabled:hover:bg-sky-500"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
