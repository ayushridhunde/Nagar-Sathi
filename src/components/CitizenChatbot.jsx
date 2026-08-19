import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, X, Send, BrainCircuit, Trash2, MapPin, 
  Paperclip, Plus, ArrowUpRight, Copy, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CitizenChatbot() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaskar! I am Nagar Sathi AI, your ChatGPT-like Nagpur Citizen Assistant. Ask me anything about Nagpur municipal services, or type a complaint ID like NGP-2026-00124.' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const chatEndRef = useRef(null);

  const quickReplies = [
    "Water leak near Dharampeth",
    "mere area mein road kharab hai",
    "garbage collection schedule",
    "NGP-2026-00124 status"
  ];

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingText]);

  // Listen to dashboard suggested questions events
  useEffect(() => {
    const handleOpenChat = (e) => {
      setIsOpen(true);
      if (e.detail) {
        handleSend(e.detail);
      }
    };
    window.addEventListener('open-nagar-sathi-chat', handleOpenChat);
    return () => window.removeEventListener('open-nagar-sathi-chat', handleOpenChat);
  }, []);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Append User message
    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          userId: user?.id
        })
      });

      const data = await res.json();
      setIsTyping(false);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get chatbot response');
      }

      // Streaming-style typing simulation
      let fullText = data.message;
      let currentText = '';
      let charIdx = 0;

      // Add placeholder bot message
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: '', 
        streaming: true, 
        suggestedActions: data.suggestedActions 
      }]);

      const interval = setInterval(() => {
        if (charIdx < fullText.length) {
          currentText += fullText[charIdx];
          setStreamingText(currentText);

          // Update the text in messages array
          setMessages(prev => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            if (copy[lastIdx] && copy[lastIdx].streaming) {
              copy[lastIdx].text = currentText;
            }
            return copy;
          });

          charIdx++;
        } else {
          clearInterval(interval);
          setStreamingText('');
          // Finalize streaming
          setMessages(prev => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            if (copy[lastIdx]) {
              copy[lastIdx].streaming = false;
            }
            return copy;
          });
        }
      }, 15);

    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, I am facing connectivity issues. Please try again later.' 
      }]);
    }
  };

  const handleActionClick = (action) => {
    if (action.type === 'report') {
      // Pre-fill categories and redirect to report issue form
      setIsOpen(false);
      navigate('/citizen/report', { 
        state: { 
          category: action.category, 
          description: `Reported via AI Assistant: ${messages[messages.length - 2]?.text || ''}` 
        } 
      });
    } else if (action.type === 'location') {
      handleSend("Shared coordinates: 21.145800, 79.088200 (Dharampeth Nagpur)");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const regenerateLastMessage = () => {
    // Find last user message
    const userMsgs = messages.filter(m => m.sender === 'user');
    if (userMsgs.length > 0) {
      const lastUserText = userMsgs[userMsgs.length - 1].text;
      handleSend(lastUserText);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-nagpur-navy hover:bg-nagpur-navy-light text-white p-4 rounded-full shadow-2xl flex items-center justify-center border-2 border-nagpur-yellow/40 hover:scale-105 transition-all cursor-pointer relative group"
        >
          <MessageSquare className="w-6 h-6 text-nagpur-yellow animate-pulse" />
          <span className="absolute right-full mr-2 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold border border-slate-700 pointer-events-none">
            Chat with Nagar Sathi AI
          </span>
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        </button>
      )}

      {/* Upgraded Large ChatGPT-Like Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[550px] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-slide-up">
          
          {/* Header */}
          <div className="bg-nagpur-navy text-white p-4 flex justify-between items-center border-b border-nagpur-yellow/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-nagpur-yellow/30 shrink-0 animate-pulse">
                <BrainCircuit className="w-4 h-4 text-nagpur-yellow" />
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-xs tracking-wider uppercase text-nagpur-yellow leading-none">Nagar Sathi AI</h3>
                <span className="text-[9px] text-slate-400 font-medium">ChatGPT-powered Civic Intelligence</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([{ sender: 'bot', text: 'Namaskar! Chat history cleared. How can I help you today?' }])}
                title="Clear chat"
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] space-y-2.5 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  
                  {/* Bubble */}
                  <div className={`p-3 rounded-xl text-xs leading-relaxed text-left relative group ${
                    m.sender === 'user'
                      ? 'bg-nagpur-navy text-white rounded-tr-none font-medium shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                  }`}>
                    {m.text}

                    {/* Copy button on hover for bot messages */}
                    {m.sender === 'bot' && !m.streaming && (
                      <div className="absolute right-2 bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white border border-slate-100 rounded px-1 py-0.5 shadow-sm">
                        <button 
                          onClick={() => copyToClipboard(m.text)} 
                          title="Copy response"
                          className="text-[9px] text-slate-400 hover:text-slate-600 font-bold"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={regenerateLastMessage} 
                          title="Regenerate"
                          className="text-[9px] text-slate-400 hover:text-slate-600 font-bold"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions (Dispatch Buttons) */}
                  {!m.streaming && m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 justify-start">
                      {m.suggestedActions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act)}
                          className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold text-[10px] py-1.5 px-3 rounded-lg border border-sky-200 transition-colors flex items-center gap-1 shadow-sm"
                        >
                          {act.label}
                          <Plus className="w-3 h-3 animate-pulse" />
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-400 rounded-xl rounded-tl-none p-3 text-xs flex gap-1 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Replies list */}
          <div className="px-4 py-2 border-t border-slate-100 overflow-x-auto no-scrollbar flex gap-2 bg-white">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(reply)}
                className="py-1.5 px-3 rounded-full bg-slate-100 hover:bg-nagpur-yellow hover:text-nagpur-navy-dark text-[10px] text-slate-600 font-bold border border-slate-200 transition-colors whitespace-nowrap"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Form Box */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                title="Share Geolocation"
                onClick={() => handleSend("Shared coordinates: 21.145800, 79.088200 (Dharampeth Nagpur)")}
                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <MapPin className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Upload Photo Attachment"
                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type in English, Marathi, Hindi, Hinglish..."
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-nagpur-navy"
            />
            <button
              type="submit"
              className="bg-nagpur-navy hover:bg-nagpur-navy-light text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-nagpur-yellow" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
