import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Lock, Crown } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { SakshiVIPModal } from './SakshiVIPModal';

interface HeaderNavProps {
  onOpenPersonalize: () => void;
  bestieName: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onOpenPersonalize, bestieName }) => {
  const { isLoggedIn } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVIPModalOpen, setIsVIPModalOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMusic = () => {
    if (isPlayingMusic) {
      soundManager.stopMelody();
      setIsPlayingMusic(false);
    } else {
      soundManager.isMuted = false;
      setIsMuted(false);
      setIsPlayingMusic(true);
      soundManager.playHappyBirthdayMelody(false, () => {
        setIsPlayingMusic(false);
      });
    }
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    soundManager.isMuted = nextState;
    setIsMuted(nextState);
    if (nextState && isPlayingMusic) {
      soundManager.stopMelody();
      setIsPlayingMusic(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-rose-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#"
          className="font-serif-display text-xl sm:text-2xl font-bold tracking-tight text-rose-950 whitespace-nowrap shrink-0 hover:text-rose-700 transition-colors"
        >
          Forever Bestie
        </a>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-rose-800/80">
          <a
            href="#cake-section"
            className="hover:text-rose-950 transition-colors whitespace-nowrap shrink-0"
          >
            Cake & Wishes
          </a>
          <a
            href="#memory-book-section"
            className="hover:text-rose-950 transition-colors whitespace-nowrap shrink-0"
          >
            Memory Book
          </a>
          <a
            href="#envelope-section"
            className="hover:text-rose-950 transition-colors whitespace-nowrap shrink-0"
          >
            Love Notes
          </a>
          <a
            href="#diary-section"
            className="hover:text-rose-950 transition-colors whitespace-nowrap shrink-0"
          >
            Secret Diary
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sound Synthesizer Melody Button */}
          <button
            onClick={toggleMusic}
            title={isPlayingMusic ? "Pause music box" : "Play Happy Birthday chime"}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
              isPlayingMusic
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 animate-pulse'
                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{isPlayingMusic ? 'Playing Melody' : 'Play Song'}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 text-rose-700 hover:text-rose-950 hover:bg-rose-100/70 rounded-full transition-colors cursor-pointer"
            title={isMuted ? "Unmute all sounds" : "Mute all sounds"}
            aria-label="Toggle mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* VIP Auth Button */}
          {isLoggedIn ? (
            <button
              onClick={() => setIsVIPModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 rounded-full shadow-xs hover:shadow border border-amber-400 transition-all cursor-pointer ring-2 ring-amber-300/50"
              title="Sakshi VIP Profile & Note"
            >
              <Crown className="w-3.5 h-3.5 text-amber-800 fill-amber-500" />
              <span>👑 Sakshi VIP</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-full border border-rose-200 shadow-xs transition-all cursor-pointer"
              title="VIP Bestie Login"
            >
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>VIP Login</span>
            </button>
          )}

          {/* Personalize Button */}
          <button
            onClick={onOpenPersonalize}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            Customize for {bestieName}
          </button>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => setIsVIPModalOpen(true)}
      />

      <SakshiVIPModal
        isOpen={isVIPModalOpen}
        onClose={() => setIsVIPModalOpen(false)}
        bestieName={bestieName}
        senderName="Subho"
      />
    </header>
  );
};
