'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Bericht {
  id: string;
  type: 'iris' | 'gebruiker';
  tekst: string;
}

interface IrisChatPanelProps {
  onClose: () => void;
}

export function IrisChatPanel({ onClose }: IrisChatPanelProps) {
  const [berichten, setBerichten] = useState<Bericht[]>([
    {
      id: '1',
      type: 'iris',
      tekst: 'Hoi! 👋 Ik ben Iris, je dating coach. Heb je een vraag over de les of je dating reis? Ik help je graag!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [berichten]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const vraag = input.trim();
    setInput('');

    // Voeg gebruiker bericht toe
    setBerichten(prev => [...prev, {
      id: Date.now().toString(),
      type: 'gebruiker',
      tekst: vraag
    }]);

    // Iris "typt..."
    setIsTyping(true);

    try {
      const response = await fetch('/api/iris/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vraag })
      });

      const { antwoord } = await response.json();

      setBerichten(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'iris',
        tekst: antwoord
      }]);
    } catch (error) {
      console.error('Iris chat error:', error);
      setBerichten(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'iris',
        tekst: 'Oeps, er ging iets mis. Probeer het nog eens!'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 mr-16
                 w-80 sm:w-96 h-[500px] max-h-[70vh]
                 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden
                 border border-gray-100"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Iris</h3>
            <p className="text-xs text-white/80">Jouw dating coach</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {berichten.map((bericht) => (
          <div
            key={bericht.id}
            className={`flex ${bericht.type === 'gebruiker' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                bericht.type === 'gebruiker'
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              <p className="text-sm">{bericht.tekst}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stel een vraag..."
            className="flex-1 px-4 py-2 bg-gray-50 rounded-full
                       border border-gray-200 focus:border-primary-500
                       focus:outline-none text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 bg-primary-500 hover:bg-primary-600
                       disabled:bg-gray-300 rounded-full
                       flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}