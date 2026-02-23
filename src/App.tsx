import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Zap, MessageSquare, Code, Play, RefreshCw, Copy, Check, ExternalLink, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { getAI, LOBSTER_SYSTEM_INSTRUCTION, CRYPTO_PRICE_TOOL } from './services/ai';
import { cn } from './lib/utils';

// --- Components ---

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 border-b border-lobster-border bg-lobster-dark/80 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img 
          src="https://qqdcuegjodukfawbobro.supabase.co/storage/v1/object/public/Hh/file_00000000980c7246b10a4e26658e15f0%20(1).png" 
          alt="Large Lobster Model Logo" 
          className="w-8 h-8 object-contain"
          referrerPolicy="no-referrer"
        />
        <span className="font-display font-bold text-xl tracking-tighter">$LLM</span>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
        <a href="#agent" className="hover:text-lobster-red transition-colors">AGENT</a>
        <a href="#" className="hover:text-lobster-red transition-colors">TOKEN</a>
      </nav>
      <div className="flex items-center gap-4">
        <button className="px-4 py-1.5 rounded-full border border-lobster-border text-xs font-bold hover:bg-white/5 transition-colors">
          BUY $LLM
        </button>
      </div>
    </div>
  </header>
);

const Hero = () => (
  <section className="relative pt-32 pb-20 overflow-hidden lobster-grid">
    <div className="scanline" />
    <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-lobster-red/30 bg-lobster-red/10 text-lobster-red text-xs font-bold mb-8"
      >
        <Sparkles size={14} />
        LARGE LOBSTER MODEL
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-6xl md:text-8xl font-display font-black text-lobster-red mb-4 tracking-tighter"
      >
        $LLM
      </motion.h1>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-6xl font-display font-bold mb-8 tracking-tight"
      >
        Large Lobster Model
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12"
      >
        Powered by claws. Trained on the ocean. The world's first lobster-brained AI agent on Solana.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <button className="px-8 py-4 bg-lobster-red text-lobster-dark font-black rounded-lg hover:bg-lobster-red/90 transition-all transform hover:scale-105 active:scale-95">
          BUY $LLM ON RAYDIUM
        </button>
        <a href="#agent" className="px-8 py-4 bg-transparent border border-lobster-border text-white font-black rounded-lg hover:bg-white/5 transition-all">
          TALK TO THE LOBSTER
        </a>
      </motion.div>

      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {[
          { label: 'TOTAL SUPPLY', value: '1B' },
          { label: 'TAX', value: '0%' },
          { label: 'LP BURNED', value: '100%' },
          { label: 'VIBES', value: '🦞' },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-lobster-red font-display font-black text-3xl mb-1">{stat.value}</div>
            <div className="text-white/40 text-xs font-bold tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const LobsterOracle = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Ah, a visitor enters my domain. *clicks claws approvingly*\n\nI am the **Large Lobster Model** – the sharpest crustacean intelligence in the Solana ecosystem. My antennae are tuned to every market signal, blockchain update, and alpha leak across the seven seas of DeFi.\n\nAsk me anything. Crypto charts, token analysis, tech, or world events — I snap with precision. 🦞" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = getAI();
      let response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: LOBSTER_SYSTEM_INSTRUCTION,
          temperature: 0.7,
          tools: [CRYPTO_PRICE_TOOL],
        }
      });

      // Handle function calls
      const functionCalls = response.functionCalls;
      if (functionCalls) {
        const functionResponses = [];
        for (const call of functionCalls) {
          if (call.name === "get_crypto_price") {
            const symbol = (call.args as any).symbol.toLowerCase();
            try {
              // Using CoinGecko simple price API (free, no key required for basic usage)
              const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
              const data = await priceRes.json();
              const price = data[symbol]?.usd;
              functionResponses.push({
                name: call.name,
                response: { price: price || "Price not found", symbol },
                id: call.id
              });
            } catch (err) {
              functionResponses.push({
                name: call.name,
                response: { error: "Failed to fetch price" },
                id: call.id
              });
            }
          }
        }

        // Send function responses back to model
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            { role: 'user', parts: [{ text: userMessage }] },
            { role: 'model', parts: response.candidates[0].content.parts },
            { role: 'user', parts: functionResponses.map(res => ({
              functionResponse: {
                name: res.name,
                response: res.response,
                id: res.id
              }
            }))}
          ],
          config: {
            systemInstruction: LOBSTER_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          }
        });
      }

      const aiText = response.text || "I seem to have dropped my shell. Try again, human.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "My antennae are experiencing interference. The deep sea is turbulent today." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="agent" className="py-20 bg-lobster-dark relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex-1">
            <div className="mb-8">
              <div className="text-lobster-red text-sm font-bold tracking-widest mb-2 flex items-center gap-2">
                <div className="w-4 h-1 bg-lobster-red" /> AI AGENT
              </div>
              <h2 className="text-5xl font-display font-black mb-6">The Lobster Oracle <span className="text-lobster-red">knows all.</span></h2>
              <p className="text-white/60 text-lg">
                Ask anything about crypto markets, Solana ecosystems, DeFi strategies, tech, or the world. The Large Lobster Model has claws in every data stream – 2026 current.
              </p>
            </div>

            <div className="glass-card h-[600px] flex flex-col overflow-hidden lobster-glow">
              <div className="p-4 border-b border-lobster-border bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-lobster-red/20 flex items-center justify-center text-lobster-red">
                    🦞
                  </div>
                  <div>
                    <div className="text-sm font-bold">LLM Agent</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest">gemini-3-flash-2026</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-500">ONLINE</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded shrink-0 flex items-center justify-center text-sm",
                      msg.role === 'user' ? "bg-white/10" : "bg-lobster-red/20 text-lobster-red"
                    )}>
                      {msg.role === 'user' ? 'U' : '🦞'}
                    </div>
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-lg text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-white/5 border border-white/10" 
                        : "bg-lobster-red/5 border border-lobster-red/20"
                    )}>
                      <div className="markdown-body prose prose-invert prose-sm max-w-none">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded shrink-0 bg-lobster-red/20 flex items-center justify-center text-lobster-red">
                      🦞
                    </div>
                    <div className="bg-lobster-red/5 border border-lobster-red/20 p-4 rounded-lg flex gap-1">
                      <div className="w-1.5 h-1.5 bg-lobster-red rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-lobster-red rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-lobster-red rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-lobster-border bg-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask the lobster anything..."
                    className="flex-1 bg-lobster-dark border border-lobster-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-lobster-red transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="bg-lobster-red text-lobster-dark px-6 py-3 rounded-lg font-black text-sm flex items-center gap-2 hover:bg-lobster-red/90 transition-all disabled:opacity-50"
                  >
                    SNAP <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-80 space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-xs font-bold text-lobster-red tracking-widest uppercase mb-4">Lobster Wisdom</h3>
              <div className="space-y-6">
                {[
                  { title: "On market timing:", quote: "The lobster does not rush. It waits in the shadows of the ocean floor until the prey – i.e., the optimal entry – swims directly into its claws." },
                  { title: "On paper hands:", quote: "A lobster does not release what it grips. Those who sell at -20% would not survive 200 million years of evolution." },
                  { title: "On diversification:", quote: "I have two claws for a reason. One holds SOL. The other holds $LLM. The rest is noise." }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="text-[10px] font-bold text-white/40 uppercase mb-1">🦞 {item.title}</div>
                    <p className="text-sm italic text-white/80">"{item.quote}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-xs font-bold text-lobster-red tracking-widest uppercase mb-4">Market Signals</h3>
              <div className="space-y-3">
                {[
                  { label: 'SOL', value: 'Dominant L1, full ecosystem lock-in', trend: 'up' },
                  { label: 'DeFi TVL', value: 'Cross-chain liquidity converging on Solana', trend: 'up' },
                  { label: 'LLM', value: 'Lobster intelligence bullish', trend: 'up' },
                  { label: 'ETH Gas', value: 'Still outrageously cooked', trend: 'down' },
                ].map((signal, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn("mt-1 text-xs", signal.trend === 'up' ? 'text-emerald-500' : 'text-lobster-red')}>
                      {signal.trend === 'up' ? '▲' : '▼'}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{signal.label}</div>
                      <div className="text-[10px] text-white/40">{signal.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 border-t border-lobster-border">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-2">
        <img 
          src="https://qqdcuegjodukfawbobro.supabase.co/storage/v1/object/public/Hh/file_00000000980c7246b10a4e26658e15f0%20(1).png" 
          alt="Large Lobster Model Logo" 
          className="w-6 h-6 object-contain"
          referrerPolicy="no-referrer"
        />
        <span className="font-display font-bold text-lg tracking-tighter">$LLM</span>
      </div>
      <div className="flex gap-8 text-xs font-bold text-white/40">
        <a href="#" className="hover:text-lobster-red transition-colors">TWITTER</a>
        <a href="#" className="hover:text-lobster-red transition-colors">SOLSCAN</a>
      </div>
      <div className="text-[10px] text-white/20 font-mono">
        © 2026 LARGE LOBSTER MODEL. ALL CLAWS RESERVED.
      </div>
    </div>
  </footer>
);

// --- Main App ---

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <LobsterOracle />
      </main>
      <Footer />
    </div>
  );
}
