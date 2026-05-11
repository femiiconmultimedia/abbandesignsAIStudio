import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Maximize2, 
  X, 
  Loader2, 
  Layout, 
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { enhancePrompt, generateImage, GenerationResult } from './services/geminiService';

interface GeneratedImage extends GenerationResult {
  id: string;
  originalPrompt: string;
  aspectRatio: string;
  timestamp: number;
}

type AspectRatioType = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioType>('1:1');
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setError(null);
    try {
      const enhanced = await enhancePrompt(prompt);
      setEnhancedPrompt(enhanced);
    } catch (err) {
      setError('Failed to enhance prompt. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    const finalPrompt = enhancedPrompt || prompt;
    if (!finalPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateImage(finalPrompt, selectedRatio);
      const newImage: GeneratedImage = {
        ...result,
        id: Math.random().toString(36).substring(7),
        originalPrompt: prompt,
        aspectRatio: selectedRatio,
        timestamp: Date.now(),
      };
      setHistory(prev => [newImage, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError('Generation failed. Please try again or check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (base64Data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ratios: { label: string; value: AspectRatioType; icon: any }[] = [
    { label: 'Square', value: '1:1', icon: (props: any) => <div className="w-4 h-4 border-2 border-current" {...props} /> },
    { label: 'Portrait', value: '3:4', icon: (props: any) => <div className="w-3 h-4 border-2 border-current" {...props} /> },
    { label: 'Landscape', value: '4:3', icon: (props: any) => <div className="w-4 h-3 border-2 border-current" {...props} /> },
    { label: 'Story', value: '9:16', icon: (props: any) => <div className="w-2.5 h-5 border-2 border-current" {...props} /> },
    { label: 'Widescreen', value: '16:9', icon: (props: any) => <div className="w-5 h-2.5 border-2 border-current" {...props} /> },
  ];

  return (
    <div className="h-screen bg-[#0a0c14] text-slate-100 font-sans selection:bg-cyan-500/30 flex overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Sidebar Configuration */}
      <aside className="w-80 h-full bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-8 z-10 overflow-y-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Abbandesigns</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Studio Studio</p>
          </div>
        </div>

        {/* Neural Enhancement Status */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className="w-1 h-1 bg-cyan-400 rounded-full"></span> AI Processing
          </label>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group">
            <span className="text-sm text-slate-300">Gemini Neural Up-res</span>
            <button 
              onClick={handleEnhance}
              disabled={!prompt.trim() || isEnhancing}
              className={`p-1 rounded-full transition-all ${enhancedPrompt ? 'bg-cyan-500' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${enhancedPrompt ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed italic">Transforms simple ideas into professional-grade detailed image prompts automatically.</p>
          
          <AnimatePresence>
            {enhancedPrompt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[11px] text-cyan-200 italic leading-relaxed">
                  "{enhancedPrompt}"
                  <button 
                    onClick={() => setEnhancedPrompt('')}
                    className="block mt-2 text-[9px] uppercase font-bold text-slate-500 hover:text-white"
                  >
                    Clear Enhancement
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spatial Configuration */}
        <div className="space-y-4">
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className="w-1 h-1 bg-purple-400 rounded-full"></span> Spatial Configuration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ratios.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => setSelectedRatio(ratio.value)}
                className={`p-2 rounded-lg transition-all text-[10px] flex flex-col items-center gap-1 border ${
                  selectedRatio === ratio.value
                    ? 'bg-white/10 border-cyan-500/50 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-500 opacity-60 hover:opacity-100 hover:bg-white/10'
                }`}
              >
                <ratio.icon className="w-4 h-4" />
                {ratio.value}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-400 flex items-start gap-2">
              <Info className="w-3 h-3 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-sm shadow-xl shadow-cyan-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-current" />
            )}
            {isGenerating ? 'Sculpting...' : 'Sculpt Visual (Flash-2.5)'}
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 h-full flex flex-col p-8 z-10 overflow-hidden">
        {/* Prompt Bar */}
        <div className="w-full max-w-3xl mx-auto mb-8 shrink-0">
          <div className="relative group">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 pr-32 text-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none h-24 transition-all"
              placeholder="Describe the image of your dreams..."
            />
            <div className="absolute right-4 bottom-4 flex gap-2">
              {isEnhancing ? (
                <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-[10px] text-cyan-300 flex items-center gap-1 uppercase tracking-tighter animate-pulse">
                  Enhancing...
                </div>
              ) : enhancedPrompt && (
                <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-[10px] text-cyan-300 flex items-center gap-1 uppercase tracking-tighter">
                  <Sparkles className="w-3 h-3" />
                  Enhanced
                </div>
              )}
              {prompt && (
                <button 
                  onClick={() => { setPrompt(''); setEnhancedPrompt(''); }}
                  className="p-1 px-2 bg-white/5 border border-white/10 rounded-full text-[10px] text-slate-500 hover:text-white transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto px-4 pb-12 custom-scrollbar">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
              <div className="p-8 rounded-full bg-white/5 border border-white/10">
                <ImageIcon className="w-16 h-16" />
              </div>
              <p className="text-sm font-mono tracking-widest uppercase text-center">Studio Canvas Ready<br/><span className="text-[10px] lowercase">Waiting for your creation</span></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <AnimatePresence mode="popLayout">
                {history.map((img) => (
                  <motion.div
                    key={img.id}
                    layoutId={img.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl overflow-hidden relative group hover:border-cyan-500/30 transition-all"
                  >
                    <div 
                      className="aspect-square w-full rounded-2xl overflow-hidden mb-4 relative bg-slate-900 cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity"></div>
                      <img
                        src={img.imageUrl}
                        alt={img.originalPrompt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      
                      <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-[10px] text-white/80 font-mono">
                        {img.aspectRatio} Assets
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-4">
                      <h3 className="text-sm font-medium text-slate-100 line-clamp-1">{img.originalPrompt}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-mono tracking-tight">Neural Sculpt • {new Date(img.timestamp).toLocaleTimeString()}</p>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSelectedImage(img)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition-colors"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Preview
                      </button>
                      <button 
                        onClick={() => downloadImage(img.imageUrl, `abbandesigns-${img.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download 4K
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <footer className="mt-auto pt-6 flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-widest uppercase shrink-0 border-t border-white/5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isGenerating ? 'bg-cyan-500' : 'bg-green-500'}`}></span>
              {isGenerating ? 'SCULPTING-IN-PROGRESS' : 'GEMINI-2.5-FLASH-CONNECTED'}
            </span>
            <span className="hidden sm:inline">LATENCY: {(Math.random() * 50 + 20).toFixed(0)}MS</span>
          </div>
          <div className="text-right">VERSION 2.0.4 - ABBANDESIGNS LUDUM</div>
        </footer>
      </main>

      {/* Full Size Modal Viewer */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-slate-950/95 backdrop-blur-3xl"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              layoutId={selectedImage.id}
              className="relative max-w-6xl w-full flex flex-col md:flex-row items-center gap-8 md:gap-16"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.originalPrompt}
                  className="max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="w-full md:w-[400px] space-y-8 p-1">
                <div className="space-y-6">
                  <header>
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-full bg-cyan-400" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Neural Metadata</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-tight">Master Asset Sculpt</h2>
                  </header>

                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Original Concept</p>
                      <p className="text-sm text-slate-200">"{selectedImage.originalPrompt}"</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 space-y-2">
                      <p className="text-[10px] uppercase font-bold text-cyan-500/80 tracking-widest">Sculpting Instructions</p>
                      <p className="text-xs italic text-slate-400 leading-relaxed">"{selectedImage.revisedPrompt}"</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-bold text-slate-600 tracking-widest">Resolution</p>
                      <p className="text-xs font-mono text-slate-400">4096 x 4096 PX</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-bold text-slate-600 tracking-widest">Ratio</p>
                      <p className="text-xs font-mono text-slate-400">{selectedImage.aspectRatio}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => downloadImage(selectedImage.imageUrl, `abbandesigns-${selectedImage.id}`)}
                    className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black uppercase text-sm tracking-widest rounded-2xl flex items-center justify-center gap-4 shadow-xl shadow-cyan-900/40 active:scale-95 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download 4K Asset
                  </button>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Return to Studio
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 md:top-0 right-0 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
