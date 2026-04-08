import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Skull, Gift, AlertOctagon } from 'lucide-react';

const TERMINAL_LINES = [
  "CRITICAL: Bypassing device firewall...",
  "CRITICAL: Gaining root access...",
  "Scanning for WhatsApp backups...",
  "Extracting chat history...",
  "Accessing gallery and private photos...",
  "Uploading data to remote server [10%]...",
  "Uploading data to remote server [45%]...",
  "Uploading data to remote server [89%]...",
  "Upload complete. 3.2GB transferred.",
  "Decrypting saved passwords...",
  "Banking apps detected...",
  "Extracting credentials...",
  "Locking device bootloader...",
  "Encrypting local files...",
  "System override successful.",
  "Finalizing lock..."
];

let audioCtx: AudioContext | null = null;

const playScarySound = (stage: number) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    const ctx = audioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (stage === 1) {
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 2);
    } else if (stage === 2) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 3);
    } else if (stage === 3) {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 6);
    } else if (stage === 4) {
      // Siren sound for the final dangerous page
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 1.5);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 2);
    } else {
      return;
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (stage === 3 ? 6 : 2));

    osc.start();
    osc.stop(ctx.currentTime + (stage === 3 ? 6 : 2));
  } catch (e) {
    console.error(e);
  }
};

const GlitchText = ({ children, className = "", as: Component = "div" }: any) => (
  <Component className={`relative inline-block ${className}`}>
    <span className="absolute top-0 left-[3px] -ml-[3px] text-red-600 opacity-80 mix-blend-screen animate-[pulse_0.1s_infinite] pointer-events-none">{children}</span>
    <span className="absolute top-0 left-[-3px] -ml-[3px] text-cyan-600 opacity-80 mix-blend-screen animate-[pulse_0.15s_infinite] pointer-events-none">{children}</span>
    <span className="relative">{children}</span>
  </Component>
);

const RandomNumbers = () => {
  const [num, setNum] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setNum(Math.random().toString(16).substring(2, 10).toUpperCase());
    }, 50);
    return () => clearInterval(interval);
  }, []);
  return <span className="text-red-700 ml-2 opacity-70">[{num}]</span>;
};

const TerminalScreen = () => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines(prev => (prev < TERMINAL_LINES.length ? prev + 1 : prev));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLines]);

  return (
    <div className="bg-black text-red-500 font-mono p-4 sm:p-6 rounded-none w-full max-w-md shadow-[0_0_30px_rgba(220,38,38,0.5)] border border-red-900 text-xs sm:text-sm h-72 overflow-y-auto relative uppercase">
      <div className="flex items-center gap-2 mb-4 border-b border-red-900 pb-2 sticky top-0 bg-black z-10">
        <Terminal size={16} />
        <span>root@target-device:~#</span>
        <RandomNumbers />
      </div>
      <div className="space-y-1">
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between">
            <span>{line}</span>
            <RandomNumbers />
          </motion.div>
        ))}
        {visibleLines < TERMINAL_LINES.length && (
          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.2 }}>█</motion.div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default function App() {
  const [stage, setStage] = useState(0);
  const [isDancing, setIsDancing] = useState(true);

  useEffect(() => {
    if (stage > 0 && stage <= 4) {
      playScarySound(stage);
    }

    if (stage === 1) {
      const timer = setTimeout(() => setStage(2), 2000);
      return () => clearTimeout(timer);
    }
    if (stage === 2) {
      const timer = setTimeout(() => setStage(3), 3000);
      return () => clearTimeout(timer);
    }
    if (stage === 3) {
      const timer = setTimeout(() => setStage(4), 6000);
      return () => clearTimeout(timer);
    }
    if (stage === 4) {
      const timer = setTimeout(() => setIsDancing(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const startHack = () => {
    setStage(1);
    try {
      document.documentElement.requestFullscreen().catch(() => {});
    } catch (e) {}
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-red-900 ${stage === 0 ? 'bg-zinc-950' : 'bg-black text-zinc-100 font-mono'}`}>
      {stage > 0 && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50" />
      )}

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="stage0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center max-w-lg bg-gradient-to-b from-zinc-900 to-black p-10 rounded-3xl border border-yellow-500/30 shadow-[0_0_100px_rgba(234,179,8,0.15)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1)_0%,transparent_70%)] animate-pulse" />
            <Gift className="w-24 h-24 text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-bounce" />
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 mb-4">
              Exclusive Reward Unlocked!
            </h1>
            <p className="text-zinc-300 mb-8 text-lg">
              Congratulations! You have been randomly selected to receive a premium mystery gift valued at over <strong className="text-yellow-400">$1,000,000</strong>.
            </p>
            <button
              onClick={startHack}
              className="relative group bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-black text-xl px-10 py-4 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105 transition-all w-full overflow-hidden"
            >
              <span className="relative z-10">Claim Your Gift Now</span>
              <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="stage1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-full flex flex-col items-center gap-4"
          >
            <GlitchText as="h2" className="text-red-500 font-mono text-xl uppercase tracking-widest flex items-center gap-2">
              Executing Payload <RandomNumbers />
            </GlitchText>
            <TerminalScreen />
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="stage2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="flex flex-col items-center"
            >
              <div className="relative bg-black p-8 rounded-none border-4 border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.8)]">
                <Skull size={150} className="text-red-600 animate-pulse" />
              </div>
              <GlitchText as="h2" className="text-red-600 font-black text-5xl md:text-7xl mt-8 tracking-widest text-center uppercase">
                DEVICE HACKED
              </GlitchText>
            </motion.div>
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div
            key="stage3"
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black border-2 border-red-600 p-8 sm:p-12 shadow-[0_0_100px_rgba(220,38,38,0.6)] max-w-xl w-full text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.1)_10px,rgba(220,38,38,0.1)_20px)]" />

            <div className="relative z-10">
              <div className="w-24 h-24 bg-red-950 text-red-500 rounded-none flex items-center justify-center mx-auto mb-6 border-2 border-red-600 animate-pulse">
                <AlertOctagon size={60} />
              </div>

              <GlitchText as="h1" className="text-4xl sm:text-5xl font-black text-red-500 uppercase tracking-widest mb-6">
                SYSTEM LOCKED
              </GlitchText>

              <div className="bg-red-950/80 p-6 border border-red-600 mb-8 flex flex-col gap-4">
                <p className="text-red-400 font-bold text-xl sm:text-2xl leading-relaxed" dir="rtl">
                  اپنا <span className="text-white font-black font-mono" dir="ltr">Data retrieve</span> کرنے کے لیے <span className="text-white font-black font-mono" dir="ltr">$10,000 pay</span> کریں۔
                </p>
                <p className="text-red-500/90 font-medium text-lg leading-relaxed" dir="rtl">
                  اگر آپ اس <span className="text-white font-mono" dir="ltr">matter</span> پر <span className="text-white font-mono" dir="ltr">discuss</span> کرنا چاہتے ہیں، تو نیچے دیے گئے <span className="text-white font-mono" dir="ltr">representative</span> سے <span className="text-white font-mono" dir="ltr">contact</span> کریں۔
                </p>
                <div className="mt-2 p-3 bg-black border border-red-800 text-red-500 font-mono text-sm text-left" dir="ltr">
                  <p>{">"} REPRESENTATIVE ID: <span className="text-white">#X99-DARK</span></p>
                  <p>{">"} CONTACT: <span className="text-white">@ShadowBroker99</span></p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 4 && (
          <motion.div
            key="stage4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen w-full bg-red-950 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden relative pb-32 z-50"
          >
            {/* Extreme Danger Visuals */}
            {isDancing ? (
              <>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50 animate-[pulse_0.1s_infinite]" />
                <div className="absolute inset-0 bg-red-600 mix-blend-overlay animate-[ping_1s_infinite]" />
                <div className="absolute inset-0 bg-black/50 animate-[pulse_0.2s_infinite]" />
              </>
            ) : (
              <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-wrap justify-center items-center gap-8 p-8 overflow-hidden">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div key={i} className="text-red-600 flex flex-col items-center">
                    <AlertOctagon size={64} />
                    <span className="font-mono text-xs mt-2">SYSTEM FAILURE</span>
                  </div>
                ))}
              </div>
            )}

            <motion.div
              animate={
                isDancing
                  ? { x: [-15, 15, -15], y: [-15, 15, -15] }
                  : { x: 0, y: 0 }
              }
              transition={
                isDancing
                  ? { repeat: Infinity, duration: 0.1 }
                  : { duration: 0.5 }
              }
              className="relative z-10 flex flex-col items-center w-full px-4 mt-20"
            >
              <motion.div
                animate={
                  isDancing
                    ? {}
                    : { y: [-20, 20, -20] }
                }
                transition={
                  isDancing
                    ? {}
                    : { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }
              >
                <GlitchText className="text-[150px] md:text-[250px] leading-none drop-shadow-[0_0_100px_rgba(255,0,0,1)] mb-4">
                  🖕
                </GlitchText>
              </motion.div>
              
              <motion.div 
                drag={!isDancing}
                dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                className={`bg-black/80 p-6 border-8 border-red-600 shadow-[0_0_100px_rgba(255,0,0,0.8)] w-full max-w-4xl ${!isDancing ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <GlitchText as="h1" className="text-5xl md:text-7xl font-black text-white uppercase tracking-widest mb-6 text-center">
                  Your device has been hacked
                </GlitchText>
                <GlitchText as="p" className="text-2xl md:text-4xl text-red-500 uppercase tracking-widest font-black text-center">
                 Agar apna data wapas lena hai to 10,000 ki payment karni ho gi, to us kilye is Gmail par message karo: mirkhan.g3@gmail.com
                </GlitchText>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
