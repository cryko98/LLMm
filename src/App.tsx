import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Zap, MessageSquare, Code, Play, RefreshCw, Copy, Check, ExternalLink, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { getAI, LOBSTER_SYSTEM_INSTRUCTION, VIBE_CODER_SYSTEM_INSTRUCTION, CRYPTO_PRICE_TOOL } from './services/ai';
import { cn } from './lib/utils';

// --- Components ---

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 border-b border-lobster-border bg-lobster-dark/80 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-lobster-red rounded flex items-center justify-center">
          <span className="font-display font-bold text-lobster-dark text-xl">L</span>
        </div>
        <span className="font-display font-bold text-xl tracking-tighter">$LLM</span>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
        <a href="#agent" className="hover:text-lobster-red transition-colors">AGENT</a>
        <a href="#vibe-coder" className="hover:text-lobster-red transition-colors">VIBE CODER</a>
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

const VibeCoder = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedCode(null);

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: VIBE_CODER_SYSTEM_INSTRUCTION,
          temperature: 0.2, // Lower temperature for more consistent code output
        }
      });

      let code = response.text || "";
      // Clean up markdown if the model included it despite instructions
      code = code.replace(/^```html\n/, '').replace(/\n```$/, '');
      setGeneratedCode(code);
      setView('preview');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const examples = [
    "Snake game", "Portfolio tracker", "Lobster Todo App", "NFT landing page", "CSS 3D cube", "Pomodoro timer"
  ];

  return (
    <section id="vibe-coder" className="py-20 bg-lobster-dark/50 lobster-grid relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <div className="text-lobster-red text-sm font-bold tracking-widest mb-2 flex items-center gap-2">
            <div className="w-4 h-1 bg-lobster-red" /> VIBE CODER
          </div>
          <h2 className="text-5xl font-display font-black mb-6">Build anything. <span className="text-lobster-red">Just describe it.</span></h2>
          <p className="text-white/60 text-lg max-w-3xl">
            Type a description of any app, website, minigame, or tool. The lobster generates complete, runnable HTML – instantly rendered in the preview pane. No coding skills required. Just vibes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-xs font-bold text-white/40 uppercase self-center mr-2">Try:</span>
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="px-3 py-1.5 rounded-lg border border-lobster-border bg-white/5 text-xs font-medium hover:border-lobster-red/50 hover:bg-lobster-red/5 transition-all"
            >
              {ex}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="glass-card p-6 h-[500px] flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-lobster-red">
                <Sparkles size={18} />
                <span className="font-display font-bold">Vibe Prompt</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your app, website, game, or tool in plain English...

Examples:
• A dark-themed crypto price ticker with animated numbers
• A browser-based Pong game with a lobster skin
• A minimal personal homepage with animated gradient
• A countdown timer to the next Bitcoin halving

The lobster will build it for you. 🦞"
                className="flex-1 bg-lobster-dark/50 border border-lobster-border rounded-lg p-4 text-sm focus:outline-none focus:border-lobster-red transition-colors resize-none font-mono"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="mt-4 w-full bg-lobster-red text-lobster-dark py-4 rounded-lg font-black flex items-center justify-center gap-2 hover:bg-lobster-red/90 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    CLAWING CODE...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    GENERATE VIBE
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card h-[500px] flex flex-col overflow-hidden">
              <div className="p-3 border-b border-lobster-border bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-lobster-red/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                  <div className="ml-4 px-3 py-1 bg-lobster-dark rounded border border-lobster-border text-[10px] text-white/40 font-mono">
                    about:blank
                  </div>
                </div>
                <div className="flex bg-lobster-dark rounded border border-lobster-border p-0.5">
                  <button
                    onClick={() => setView('preview')}
                    className={cn(
                      "px-3 py-1 rounded text-[10px] font-bold transition-all",
                      view === 'preview' ? "bg-lobster-red text-lobster-dark" : "text-white/40 hover:text-white"
                    )}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setView('code')}
                    className={cn(
                      "px-3 py-1 rounded text-[10px] font-bold transition-all",
                      view === 'code' ? "bg-lobster-red text-lobster-dark" : "text-white/40 hover:text-white"
                    )}
                  >
                    Code
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-white relative">
                {generatedCode ? (
                  view === 'preview' ? (
                    <iframe
                      srcDoc={generatedCode}
                      title="Vibe Preview"
                      className="w-full h-full border-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-lobster-dark p-4 overflow-auto font-mono text-xs text-white/80">
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={copyToClipboard}
                          className="p-2 hover:bg-white/10 rounded transition-colors text-white/60"
                        >
                          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <pre>{generatedCode}</pre>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full bg-lobster-dark flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-lobster-red/10 flex items-center justify-center text-lobster-red mb-4">
                      <Code size={32} />
                    </div>
                    <h4 className="text-xl font-display font-bold mb-2">Awaiting your vision</h4>
                    <p className="text-white/40 text-sm max-w-xs">
                      Describe something above and the lobster will build it. Rendered live right here.
                    </p>
                  </div>
                )}
                {isGenerating && (
                  <div className="absolute inset-0 bg-lobster-dark/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-lobster-red border-t-transparent rounded-full animate-spin mb-4" />
                    <div className="text-lobster-red font-display font-bold animate-pulse">CLAWING...</div>
                  </div>
                )}
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
        <div className="w-6 h-6 bg-lobster-red rounded flex items-center justify-center">
          <span className="font-display font-bold text-lobster-dark text-sm">L</span>
        </div>
        <span className="font-display font-bold text-lg tracking-tighter">$LLM</span>
      </div>
      <div className="flex gap-8 text-xs font-bold text-white/40">
        <a href="#" className="hover:text-lobster-red transition-colors">TWITTER</a>
        <a href="#" className="hover:text-lobster-red transition-colors">TELEGRAM</a>
        <a href="#" className="hover:text-lobster-red transition-colors">DEXTOOLS</a>
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
        <VibeCoder />
      </main>
      <Footer />
    </div>
  );
}
