import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, RotateCcw, Heart, Gift } from 'lucide-react';
import { triggerBirthdayConfetti, triggerHeartShower } from '../utils/confetti';
import { soundManager } from '../utils/audio';

interface CakeAndCandleProps {
  bestieName: string;
  nickname: string;
  customGreeting: string;
  senderName: string;
  birthDate: string;
}

export const CakeAndCandle: React.FC<CakeAndCandleProps> = ({
  bestieName,
  nickname,
  customGreeting,
  senderName,
  birthDate,
}) => {
  const [candlesLit, setCandlesLit] = useState(true);
  const [hasBlown, setHasBlown] = useState(false);
  const [wishCount, setWishCount] = useState(0);

  const handleBlowCandles = () => {
    if (!candlesLit) return;
    soundManager.playBlowCandle();
    setCandlesLit(false);
    setHasBlown(true);
    setWishCount((prev) => prev + 1);

    // Audio & celebratory confetti
    setTimeout(() => {
      soundManager.playConfettiBurst();
      triggerBirthdayConfetti();
      triggerHeartShower();
    }, 200);

    setTimeout(() => {
      soundManager.playHappyBirthdayMelody();
    }, 800);
  };

  const handleRelight = () => {
    soundManager.playSparkle();
    setCandlesLit(true);
  };

  return (
    <section id="cake-section" className="relative py-12 lg:py-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Top Editorial Kicker */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-rose-600 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A Magical Celebration For My Favorite Soul</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        {/* Animated Headline Reveal */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-serif-display text-4xl sm:text-6xl md:text-7xl font-bold text-rose-950 tracking-tight leading-tight max-w-3xl mx-auto"
        >
          Happy Birthday,{' '}
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700">
            {bestieName}
            <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-rose-400/0 via-rose-400 to-rose-400/0" />
          </span>
          !
        </motion.h1>

        {/* Subtitle / Custom Greeting */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-4 text-base sm:text-lg text-rose-800/80 max-w-xl mx-auto font-light leading-relaxed"
        >
          {customGreeting || `To the one who makes every ordinary day shine brighter. Today is all about celebrating the wonder of you.`}
        </motion.p>

        {/* Cake Stage Card */}
        <div className="relative mt-10 max-w-2xl mx-auto">
          {/* Glass backdrop card */}
          <div className="glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden">
            {/* Candle Lighting Atmosphere Ambient Radial */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
                candlesLit
                  ? 'opacity-100 bg-radial from-amber-200/35 via-rose-200/20 to-transparent'
                  : 'opacity-20 bg-radial from-rose-100/10 via-transparent to-transparent'
              }`}
            />

            {/* Instruction Banner */}
            <div className="relative z-10 mb-6">
              <span className="text-xs uppercase tracking-wider font-semibold text-rose-700/80 bg-rose-50/80 px-4 py-1.5 rounded-full border border-rose-200/60 inline-flex items-center gap-1.5">
                {candlesLit ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                    Make a heartfelt wish and tap the cake or button!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    Wish granted! May all your wildest dreams blossom this year.
                  </>
                )}
              </span>
            </div>

            {/* SVG Interactive Birthday Cake */}
            <div
              onClick={candlesLit ? handleBlowCandles : undefined}
              className={`relative z-10 w-full max-w-md mx-auto aspect-[16/12] flex items-end justify-center select-none ${
                candlesLit ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.99]' : ''
              } transition-transform duration-300`}
              title={candlesLit ? "Click to blow out candles!" : "Candles are blown!"}
            >
              <svg
                viewBox="0 0 400 320"
                className="w-full h-full filter drop-shadow-[0_16px_28px_rgba(225,29,72,0.14)]"
              >
                <defs>
                  {/* Gradients for Cake Frosting */}
                  <linearGradient id="frostingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fff1f3" />
                    <stop offset="100%" stopColor="#fecdd3" />
                  </linearGradient>
                  <linearGradient id="tier2Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffe4e6" />
                    <stop offset="100%" stopColor="#fda4af" />
                  </linearGradient>
                  <linearGradient id="tier1Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fda4af" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </linearGradient>
                  <linearGradient id="plateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f1f5f9" />
                  </linearGradient>
                  <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fef08a" />
                  </linearGradient>
                  <radialGradient id="candleGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(251, 191, 36, 0.9)" />
                    <stop offset="40%" stopColor="rgba(244, 63, 94, 0.4)" />
                    <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
                  </radialGradient>
                </defs>

                {/* Cake Ceramic Stand / Platter */}
                <ellipse cx="200" cy="295" rx="160" ry="18" fill="url(#plateGradient)" stroke="#e2e8f0" strokeWidth="2" />
                <ellipse cx="200" cy="295" rx="156" ry="14" fill="none" stroke="url(#goldRim)" strokeWidth="1.5" />
                <path d="M 185 295 L 180 315 L 220 315 L 215 295 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                <ellipse cx="200" cy="315" rx="45" ry="6" fill="#e2e8f0" />

                {/* Tier 1 (Bottom Cake Tier) */}
                <rect x="75" y="210" width="250" height="75" rx="16" fill="url(#tier1Gradient)" />
                {/* Decorative Drips Tier 1 */}
                <path
                  d="M 75 220 Q 95 245 115 220 Q 135 240 155 220 Q 175 248 195 220 Q 215 242 235 220 Q 255 245 275 220 Q 295 240 325 220 L 325 210 L 75 210 Z"
                  fill="#ffffff"
                  opacity="0.85"
                />
                {/* Sugar Pearls Tier 1 */}
                <circle cx="100" cy="265" r="4" fill="#ffffff" opacity="0.9" />
                <circle cx="140" cy="265" r="4" fill="#ffffff" opacity="0.9" />
                <circle cx="180" cy="265" r="4" fill="#ffffff" opacity="0.9" />
                <circle cx="220" cy="265" r="4" fill="#ffffff" opacity="0.9" />
                <circle cx="260" cy="265" r="4" fill="#ffffff" opacity="0.9" />
                <circle cx="300" cy="265" r="4" fill="#ffffff" opacity="0.9" />

                {/* Tier 2 (Middle Cake Tier) */}
                <rect x="105" y="150" width="190" height="65" rx="14" fill="url(#tier2Gradient)" />
                <path
                  d="M 105 160 Q 125 180 145 160 Q 165 185 185 160 Q 205 180 225 160 Q 245 185 265 160 Q 280 175 295 160 L 295 150 L 105 150 Z"
                  fill="#ffffff"
                  opacity="0.9"
                />
                <circle cx="130" cy="195" r="3.5" fill="#fef08a" />
                <circle cx="165" cy="195" r="3.5" fill="#fef08a" />
                <circle cx="200" cy="195" r="3.5" fill="#fef08a" />
                <circle cx="235" cy="195" r="3.5" fill="#fef08a" />
                <circle cx="270" cy="195" r="3.5" fill="#fef08a" />

                {/* Tier 3 (Top Cake Tier) */}
                <rect x="135" y="95" width="130" height="58" rx="12" fill="url(#frostingGradient)" />
                <path
                  d="M 135 105 Q 150 120 165 105 Q 180 125 195 105 Q 210 120 225 105 Q 245 125 265 105 L 265 95 L 135 95 Z"
                  fill="#ffffff"
                />

                {/* Sweet strawberries on top */}
                <g transform="translate(148, 86)">
                  <path d="M 0 8 Q 6 -2 12 8 Q 6 16 0 8 Z" fill="#e11d48" />
                  <polygon points="6,0 4,4 8,4" fill="#22c55e" />
                </g>
                <g transform="translate(240, 86)">
                  <path d="M 0 8 Q 6 -2 12 8 Q 6 16 0 8 Z" fill="#e11d48" />
                  <polygon points="6,0 4,4 8,4" fill="#22c55e" />
                </g>

                {/* CANDLES */}
                {/* Left Candle */}
                <g transform="translate(165, 52)">
                  <rect x="0" y="8" width="8" height="35" rx="3" fill="#ffffff" stroke="#fda4af" strokeWidth="1" />
                  <line x1="1" y1="16" x2="7" y2="14" stroke="#f43f5e" strokeWidth="2" />
                  <line x1="1" y1="26" x2="7" y2="24" stroke="#f43f5e" strokeWidth="2" />
                  <line x1="4" y1="8" x2="4" y2="1" stroke="#334155" strokeWidth="1.5" />
                </g>

                {/* Center Candle (Tall Gold Candle) */}
                <g transform="translate(196, 40)">
                  <rect x="0" y="8" width="9" height="47" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                  <line x1="1" y1="18" x2="8" y2="16" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="1" y1="30" x2="8" y2="28" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="1" y1="42" x2="8" y2="40" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="4.5" y1="8" x2="4.5" y2="1" stroke="#334155" strokeWidth="1.5" />
                </g>

                {/* Right Candle */}
                <g transform="translate(227, 52)">
                  <rect x="0" y="8" width="8" height="35" rx="3" fill="#ffffff" stroke="#fda4af" strokeWidth="1" />
                  <line x1="1" y1="16" x2="7" y2="14" stroke="#f43f5e" strokeWidth="2" />
                  <line x1="1" y1="26" x2="7" y2="24" stroke="#f43f5e" strokeWidth="2" />
                  <line x1="4" y1="8" x2="4" y2="1" stroke="#334155" strokeWidth="1.5" />
                </g>

                {/* CANDLE FLAMES OR SMOKE */}
                {candlesLit ? (
                  <>
                    {/* Left Candle Flame */}
                    <g transform="translate(169, 52)" className="animate-flame">
                      <circle cx="0" cy="-6" r="14" fill="url(#candleGlow)" />
                      <path d="M 0 -15 C -4 -7 -4 -2 0 1 C 4 -2 4 -7 0 -15 Z" fill="#fbbf24" />
                      <path d="M 0 -11 C -2 -6 -2 -2 0 0 C 2 -2 2 -6 0 -11 Z" fill="#ffffff" />
                    </g>
                    {/* Center Candle Flame */}
                    <g transform="translate(200.5, 40)" className="animate-flame" style={{ animationDelay: '0.2s' }}>
                      <circle cx="0" cy="-8" r="18" fill="url(#candleGlow)" />
                      <path d="M 0 -20 C -6 -10 -5 -2 0 2 C 5 -2 6 -10 0 -20 Z" fill="#f59e0b" />
                      <path d="M 0 -15 C -3 -7 -3 -2 0 0 C 3 -2 3 -7 0 -15 Z" fill="#ffffff" />
                    </g>
                    {/* Right Candle Flame */}
                    <g transform="translate(231, 52)" className="animate-flame" style={{ animationDelay: '0.4s' }}>
                      <circle cx="0" cy="-6" r="14" fill="url(#candleGlow)" />
                      <path d="M 0 -15 C -4 -7 -4 -2 0 1 C 4 -2 4 -7 0 -15 Z" fill="#fbbf24" />
                      <path d="M 0 -11 C -2 -6 -2 -2 0 0 C 2 -2 2 -6 0 -11 Z" fill="#ffffff" />
                    </g>
                  </>
                ) : (
                  <>
                    {/* Gentle smoke trails on blow out */}
                    <path
                      d="M 169 50 Q 163 38 171 28 T 167 15"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="animate-pulse opacity-70"
                    />
                    <path
                      d="M 200 38 Q 206 24 196 14 T 202 2"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-pulse opacity-80"
                    />
                    <path
                      d="M 231 50 Q 237 38 229 28 T 233 15"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="animate-pulse opacity-70"
                    />
                  </>
                )}
              </svg>
            </div>

            {/* Action Bar Beneath Cake */}
            <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
              {candlesLit ? (
                <button
                  onClick={handleBlowCandles}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 rounded-full shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Flame className="w-4 h-4 fill-white text-white" />
                  <span>Blow Out the Candles & Make a Wish</span>
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleRelight}
                    className="px-5 py-2.5 text-xs font-semibold text-rose-800 bg-white hover:bg-rose-50 border border-rose-200 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Relight Candles</span>
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playConfettiBurst();
                      triggerBirthdayConfetti();
                      triggerHeartShower();
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Shower More Confetti!</span>
                  </button>
                </div>
              )}
            </div>

            {/* Wishes Made Counter / Celebration Reveal Note */}
            <AnimatePresence>
              {hasBlown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 pt-6 border-t border-rose-100 text-center"
                >
                  <div className="inline-flex items-center gap-1.5 text-rose-700 font-medium text-xs bg-rose-100/70 px-3.5 py-1 rounded-full mb-2">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{wishCount} Birthday Wish Registered in the Universe!</span>
                  </div>
                  <p className="font-handwriting text-xl sm:text-2xl text-rose-900 max-w-lg mx-auto">
                    &ldquo;May every candle extinguished illuminate a new joy in your life. You deserve all the stars, {nickname || bestieName}.&rdquo;
                  </p>
                  <div className="mt-2 text-xs text-rose-600/80">
                    Forever & always, your {senderName || 'bestie'} · {birthDate || 'Special Day'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
