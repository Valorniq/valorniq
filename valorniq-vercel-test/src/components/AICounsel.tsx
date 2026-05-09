import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Zap, BrainCircuit, X, MessageSquare, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { chatWithNexus } from '../services/gemini';
import { Lead, Product, SalesOrder } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AICounselProps {
  leads: Lead[];
  products: Product[];
  sales: SalesOrder[];
}

const AICounsel: React.FC<AICounselProps> = ({ leads, products, sales }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Systems online. I am ARIS. I have ingested your latest CRM and ERP datasets. How can I assist with your enterprise operations today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    const response = await chatWithNexus(userMessage, { leads, products, sales });
    
    setMessages(prev => [...prev, { role: 'assistant', content: response || "Neural error. Link dropped." }]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-600/30 flex items-center justify-center z-[100] group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <span className="text-2xl font-black">A</span>}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-8 w-[400px] h-[600px] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col z-[100] overflow-hidden"
          >
            <header className="p-6 bg-slate-900 shrink-0 relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-black">A</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      ARIS
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-[8px] text-indigo-300 uppercase tracking-[0.2em] font-black border border-indigo-500/30">V3.2</span>
                    </h2>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Valorniq Intelligence</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                    m.role === 'assistant' ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'
                  }`}>
                    {m.role === 'assistant' ? <span className="text-xs font-black">A</span> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                    m.role === 'assistant' 
                      ? 'bg-white border-slate-100 text-slate-800' 
                      : 'bg-indigo-600 border-indigo-500 text-white'
                  }`}>
                    <div className={`prose prose-sm max-w-none ${m.role === 'assistant' ? 'prose-p:text-slate-600' : 'prose-p:text-indigo-50 prose-strong:text-white'}`}>
                      <Markdown>{m.content}</Markdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center animate-pulse">
                    <span className="text-xs font-black">A</span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="relative">
                <input 
                  type="text" 
                  placeholder="Ask ARIS..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-5 pr-14 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICounsel;
