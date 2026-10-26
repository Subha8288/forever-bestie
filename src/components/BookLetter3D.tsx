import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, BookOpen, Camera, Sparkles, Heart, Pin } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BookLetterProps {
  bestieName: string;
  nickname: string;
  senderName: string;
}

export const BookLetter3D: React.FC<BookLetterProps> = ({
  bestieName,
  nickname,
  senderName,
}) => {
  // Current spread index: 0 = Cover, 1 = Pages 1&2, 2 = Pages 3&4, 3 = Pages 5&6
  const [currentSpread, setCurrentSpread] = useState(0);
  const totalSpreads = 4;

  // Custom user photo uploads for polaroids (keyed by spread)
  const [userPhotos, setUserPhotos] = useState<{ [key: number]: string }>({});

  const handlePhotoUpload = (spreadIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUserPhotos((prev) => ({
            ...prev,
            [spreadIndex]: e.target!.result as string,
          }));
          soundManager.playSparkle();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const nextPage = () => {
    if (currentSpread < totalSpreads - 1) {
      soundManager.playPageTurn();
      setCurrentSpread((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentSpread > 0) {
      soundManager.playPageTurn();
      setCurrentSpread((prev) => prev - 1);
    }
  };

  return (
    <section id="memory-book-section" className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-rose-600 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive 3D Keepsake</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-rose-950 tracking-tight">
            The Memory Book of Us
          </h2>
          <p className="mt-2 text-sm sm:text-base text-rose-800/80 font-light">
            Flip through real pages filled with our favorite moments, polaroids, and promises.
          </p>
        </div>

        {/* 3D Book Stage Container */}
        <div className="relative mx-auto max-w-4xl perspective-1500 min-h-[580px] sm:min-h-[540px] flex items-center justify-center">
          {/* Controls Bar Above Book */}
          <div className="absolute -top-12 right-0 sm:right-4 flex items-center gap-2 z-20">
            <span className="text-xs font-medium text-rose-800/70">
              {currentSpread === 0 ? 'Keepsake Cover' : `Chapter ${currentSpread} of 3`}
            </span>
            <div className="flex items-center gap-1 bg-white/80 rounded-full border border-rose-200/80 p-1 shadow-sm">
              <button
                onClick={prevPage}
                disabled={currentSpread === 0}
                className="p-1 rounded-full hover:bg-rose-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4 text-rose-800" />
              </button>
              <button
                onClick={nextPage}
                disabled={currentSpread === totalSpreads - 1}
                className="p-1 rounded-full hover:bg-rose-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4 text-rose-800" />
              </button>
            </div>
          </div>

          {/* Book Shadow & Glow Underneath */}
          <div className="absolute inset-x-8 bottom-2 h-14 bg-rose-950/15 blur-2xl rounded-full transform scale-90" />

          {/* SPREAD 0: THE LUXURY COVER */}
          <AnimatePresence mode="wait">
            {currentSpread === 0 && (
              <motion.div
                key="spread-cover"
                initial={{ opacity: 0, rotateY: -15, scale: 0.96 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: -70, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-lg aspect-[3/4] sm:aspect-[4/5] rounded-2xl relative shadow-2xl overflow-hidden border-4 border-rose-200/70 p-6 sm:p-10 flex flex-col justify-between text-center select-none"
                style={{
                  background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 45%, #f472b6 100%)',
                }}
              >
                {/* Book Spine highlight */}
                <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-rose-900/20 via-rose-900/5 to-transparent pointer-events-none" />

                {/* Embossed Corner Ornaments */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-300/80 rounded-tl-xl pointer-events-none" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-300/80 rounded-tr-xl pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-300/80 rounded-bl-xl pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-300/80 rounded-br-xl pointer-events-none" />

                {/* Foil Header */}
                <div className="pt-6 relative z-10">
                  <div className="inline-flex items-center gap-2 text-rose-900 text-xs font-semibold uppercase tracking-widest bg-white/40 backdrop-blur-sm px-4 py-1 rounded-full border border-white/60">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Special Edition Volume</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                </div>

                {/* Center Title Lockup */}
                <div className="my-auto relative z-10 py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50/80 border-2 border-amber-300/90 flex items-center justify-center shadow-inner">
                    <Heart className="w-8 h-8 text-rose-600 fill-rose-500 animate-gentle-float" />
                  </div>
                  <h3 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold text-rose-950 tracking-tight leading-tight">
                    For My Bestie,
                    <span className="block text-rose-800 italic">{bestieName}</span>
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-rose-900/85 font-medium max-w-xs mx-auto">
                    A handwritten anthology of laughter, secret tears, and endless support.
                  </p>
                </div>

                {/* Bottom Cover Footer / Open Call to Action */}
                <div className="pb-4 relative z-10">
                  <button
                    onClick={nextPage}
                    className="w-full sm:w-auto px-6 py-3 bg-white text-rose-800 hover:text-rose-950 font-semibold text-sm rounded-full shadow-lg shadow-rose-900/10 hover:shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer border border-rose-100"
                  >
                    <span>Open Memory Book</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="mt-3 text-[11px] text-rose-900/60 font-medium">
                    Bound with love by {senderName || 'Your Bestie'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* SPREAD 1: CHAPTER 1 - THE DAY WE MET & OUR CRAZY ADVENTURES */}
            {currentSpread === 1 && (
              <motion.div
                key="spread-1"
                initial={{ opacity: 0, rotateY: 20 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden border border-rose-200/90 bg-[#fffdfa]"
              >
                {/* Left Page: Letter */}
                <div className="p-6 sm:p-10 border-b md:border-b-0 md:border-r border-rose-200/70 relative paper-texture flex flex-col justify-between">
                  <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-rose-950/5 to-transparent pointer-events-none hidden md:block" />
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-rose-700/80 mb-3 border-b border-rose-200/60 pb-2">
                      <span>Chapter 01</span>
                      <span>The Beginning</span>
                    </div>
                    <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-rose-950">
                      The Universe Got It Right
                    </h3>
                    <div className="mt-4 font-handwriting text-xl sm:text-2xl text-rose-900 leading-relaxed space-y-3">
                      <p>
                        Dear {nickname || bestieName},
                      </p>
                      <p>
                        They say friends are the family you choose with your heart. Out of all the billions of people walking this planet, having you as my person is the greatest lottery win of my life.
                      </p>
                      <p>
                        From our very first conversation, you brought this genuine warmth and chaotic sunshine that instantly made the world feel safer. Thank you for never asking me to be anyone other than who I am.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-rose-200/50 flex items-center justify-between text-xs text-rose-700/70 font-medium">
                    <span>Page 1</span>
                    <span className="italic">&ldquo;In a world full of noise, you are home.&rdquo;</span>
                  </div>
                </div>

                {/* Right Page: Floating Polaroid Frame */}
                <div className="p-6 sm:p-10 relative paper-texture flex flex-col items-center justify-center">
                  <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-r from-rose-950/5 to-transparent pointer-events-none hidden md:block" />

                  {/* Polaroid Frame */}
                  <div className="relative bg-white p-4 pb-6 rounded shadow-xl border border-rose-100 max-w-xs w-full rotate-1 hover:rotate-0 transition-transform duration-300">
                    {/* Washi Tape */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-rose-200/70 backdrop-blur-sm -rotate-2 rounded-sm border border-rose-300/40 opacity-80" />

                    {/* Photo area */}
                    <div className="aspect-[4/3] rounded bg-rose-50 overflow-hidden relative border border-rose-100">
                      {userPhotos[1] ? (
                        <img
                          src={userPhotos[1]}
                          alt="Our best memory"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        /* Curated SVG Artwork: Golden Beach Sunset Friends */
                        <div className="w-full h-full bg-gradient-to-b from-rose-300 via-pink-200 to-amber-100 flex flex-col items-center justify-center relative p-4 text-center">
                          <svg viewBox="0 0 200 150" className="w-full h-full">
                            <circle cx="100" cy="70" r="32" fill="#fed7aa" opacity="0.9" />
                            {/* Waves / Beach */}
                            <path d="M 0 110 Q 50 100 100 112 T 200 108 L 200 150 L 0 150 Z" fill="#fda4af" />
                            <path d="M 0 125 Q 70 120 140 128 T 200 122 L 200 150 L 0 150 Z" fill="#fb7185" />
                            {/* Two silhouettes smiling */}
                            <circle cx="85" cy="78" r="10" fill="#881337" />
                            <path d="M 72 108 Q 85 92 98 108 Z" fill="#881337" />
                            <circle cx="115" cy="80" r="9" fill="#881337" />
                            <path d="M 104 108 Q 115 94 126 108 Z" fill="#881337" />
                            {/* Little heart between them */}
                            <path d="M 100 70 L 98 67 Q 96 64 100 60 Q 104 64 102 67 Z" fill="#e11d48" />
                          </svg>
                          <div className="absolute bottom-2 text-[10px] text-rose-950/70 font-semibold tracking-wider uppercase">
                            Golden Hour Moments
                          </div>
                        </div>
                      )}

                      {/* Photo Upload Overlay Button */}
                      <label className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-white text-rose-800 rounded-full shadow-md cursor-pointer transition-colors" title="Change to your own photo!">
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(1, e)}
                        />
                      </label>
                    </div>

                    {/* Polaroid Handwritten Caption */}
                    <div className="mt-4 text-center">
                      <p className="font-handwriting text-xl text-rose-950">
                        &ldquo;Chasing sunsets & laughing till our stomachs hurt.&rdquo;
                      </p>
                      <span className="text-[11px] text-rose-600/70 font-medium">Click camera icon to add your own photo!</span>
                    </div>
                  </div>

                  <div className="w-full mt-6 pt-4 border-t border-rose-200/50 flex items-center justify-between text-xs text-rose-700/70 font-medium">
                    <span>Page 2</span>
                    <button
                      onClick={nextPage}
                      className="text-rose-800 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next Page</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SPREAD 2: CHAPTER 2 - INSIDE JOKES & SACRED MEMORIES */}
            {currentSpread === 2 && (
              <motion.div
                key="spread-2"
                initial={{ opacity: 0, rotateY: 20 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden border border-rose-200/90 bg-[#fffdfa]"
              >
                {/* Left Page: Inside Jokes & Quirks */}
                <div className="p-6 sm:p-10 border-b md:border-b-0 md:border-r border-rose-200/70 relative paper-texture flex flex-col justify-between">
                  <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-rose-950/5 to-transparent pointer-events-none hidden md:block" />
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-rose-700/80 mb-3 border-b border-rose-200/60 pb-2">
                      <span>Chapter 02</span>
                      <span>The Unspoken Code</span>
                    </div>
                    <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-rose-950">
                      Our Hall of Fame Quirks
                    </h3>
                    <ul className="mt-5 space-y-3.5 text-sm sm:text-base text-rose-900 font-light">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                        <span>Communicating entire life emergencies across a crowded room with a single eyebrow raise.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                        <span>Sending 4-minute voice notes that sound like full investigative podcast episodes.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                        <span>Planning to stay home and be productive, only to end up getting late-night takeout together.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                        <span>Knowing every single person you dislike without you having to say a word.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-rose-200/50 flex items-center justify-between text-xs text-rose-700/70 font-medium">
                    <span>Page 3</span>
                    <span className="italic">Unfiltered & Unashamed</span>
                  </div>
                </div>

                {/* Right Page: Polaroid Frame #2 */}
                <div className="p-6 sm:p-10 relative paper-texture flex flex-col items-center justify-center">
                  <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-r from-rose-950/5 to-transparent pointer-events-none hidden md:block" />

                  <div className="relative bg-white p-4 pb-6 rounded shadow-xl border border-rose-100 max-w-xs w-full -rotate-1 hover:rotate-0 transition-transform duration-300">
                    {/* Golden Pin */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-500 drop-shadow">
                      <Pin className="w-5 h-5 fill-amber-400" />
                    </div>

                    <div className="aspect-[4/3] rounded bg-rose-50 overflow-hidden relative border border-rose-100">
                      {userPhotos[2] ? (
                        <img
                          src={userPhotos[2]}
                          alt="Cafe laughter"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        /* Curated SVG Artwork: Cafe & Matchas */
                        <div className="w-full h-full bg-gradient-to-b from-pink-100 via-rose-100 to-rose-200 flex flex-col items-center justify-center relative p-3">
                          <svg viewBox="0 0 200 150" className="w-full h-full">
                            {/* Coffee / Drink Cups */}
                            <rect x="55" y="60" width="35" height="50" rx="6" fill="#f472b6" />
                            <path d="M 50 60 L 95 60 L 90 53 L 55 53 Z" fill="#ffffff" />
                            <line x1="72" y1="35" x2="72" y2="53" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" />
                            {/* Second Cup */}
                            <rect x="110" y="55" width="35" height="55" rx="6" fill="#fb7185" />
                            <path d="M 105 55 L 150 55 L 145 48 L 110 48 Z" fill="#ffffff" />
                            <line x1="128" y1="30" x2="128" y2="48" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                            {/* Pastry plate */}
                            <ellipse cx="100" cy="120" rx="60" ry="14" fill="#ffffff" stroke="#fbcfe8" strokeWidth="2" />
                            <circle cx="90" cy="118" r="8" fill="#fda4af" />
                            <circle cx="112" cy="118" r="8" fill="#fef08a" />
                          </svg>
                          <div className="absolute bottom-2 text-[10px] text-rose-950/70 font-semibold tracking-wider uppercase">
                            Unlimited Cafe Gossip
                          </div>
                        </div>
                      )}

                      <label className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-white text-rose-800 rounded-full shadow-md cursor-pointer transition-colors" title="Change to your own photo!">
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(2, e)}
                        />
                      </label>
                    </div>

                    <div className="mt-4 text-center">
                      <p className="font-handwriting text-xl text-rose-950">
                        &ldquo;Fueled by iced coffee & inside jokes.&rdquo;
                      </p>
                      <span className="text-[11px] text-rose-600/70 font-medium">Click camera icon to customize photo!</span>
                    </div>
                  </div>

                  <div className="w-full mt-6 pt-4 border-t border-rose-200/50 flex items-center justify-between text-xs text-rose-700/70 font-medium">
                    <button
                      onClick={prevPage}
                      className="text-rose-800 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={nextPage}
                      className="text-rose-800 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Final Chapter</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SPREAD 3: CHAPTER 3 - LIFETIME PROMISES & SEALED BIRTHDAY WISH */}
            {currentSpread === 3 && (
              <motion.div
                key="spread-3"
                initial={{ opacity: 0, rotateY: 20 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden border border-rose-200/90 bg-[#fffdfa]"
              >
                {/* Left Page: Sacred Promises */}
                <div className="p-6 sm:p-10 border-b md:border-b-0 md:border-r border-rose-200/70 relative paper-texture flex flex-col justify-between">
                  <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-rose-950/5 to-transparent pointer-events-none hidden md:block" />
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-rose-700/80 mb-3 border-b border-rose-200/60 pb-2">
                      <span>Chapter 03</span>
                      <span>The Vows of Friendship</span>
                    </div>
                    <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-rose-950">
                      My Birthday Promises to You
                    </h3>
                    <div className="mt-4 space-y-3 font-handwriting text-xl text-rose-900 leading-snug">
                      <p>✨ I promise to always answer your call, even if it's 2am and you just want to talk about a song.</p>
                      <p>✨ I promise to hype you up in every room you enter, because you have no idea how brilliant you are.</p>
                      <p>✨ I promise to keep every secret you ever whisper to me safe forever.</p>
                      <p>✨ I promise that no matter how busy life gets, you will never have to face hard things alone.</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-rose-200/50 flex items-center justify-between text-xs text-rose-700/70 font-medium">
                    <span>Page 5</span>
                    <span className="italic">Written in gold ink</span>
                  </div>
                </div>

                {/* Right Page: Golden Wax Seal & Official Sign-off */}
                <div className="p-6 sm:p-10 relative paper-texture flex flex-col items-center justify-between text-center">
                  <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-r from-rose-950/5 to-transparent pointer-events-none hidden md:block" />

                  <div className="my-auto">
                    {/* Golden Rose Wax Seal */}
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-pink-500 p-1 shadow-lg shadow-rose-900/20 flex items-center justify-center transform hover:scale-105 transition-transform cursor-default">
                      <div className="w-full h-full rounded-full border-2 border-dashed border-amber-200/70 flex items-center justify-center text-white font-serif-display text-2xl font-bold">
                        ★
                      </div>
                    </div>

                    <h4 className="mt-4 font-serif-display text-2xl font-bold text-rose-950">
                      Forever & Always
                    </h4>

                    <p className="mt-2 font-handwriting text-2xl text-rose-800 max-w-xs mx-auto">
                      &ldquo;May your year be as extraordinary, breathtaking, and kind as your heart.&rdquo;
                    </p>

                    <div className="mt-4 inline-block border-b-2 border-rose-400 font-handwriting text-3xl text-rose-950 px-4 py-1">
                      {senderName || 'Your Devoted Bestie'}
                    </div>
                  </div>

                  <div className="w-full mt-6 pt-4 border-t border-rose-200/50 flex items-center justify-between text-xs text-rose-700/70 font-medium">
                    <button
                      onClick={prevPage}
                      className="text-rose-800 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={() => setCurrentSpread(0)}
                      className="text-rose-800 font-semibold hover:underline cursor-pointer"
                    >
                      Close to Cover
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
