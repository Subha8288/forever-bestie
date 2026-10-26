import React, { useState, useEffect } from 'react';
import {
  X,
  Crown,
  LogOut,
  Send,
  Sparkles,
  Heart,
  CheckCircle2,
  Music,
  Play,
  Square,
  Images,
  Cake,
  Mail,
  Clock,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundManager } from '../utils/audio';
import { triggerBirthdayConfetti, triggerHeartShower } from '../utils/confetti';
import { api } from '../utils/api';
import { uploadMedia, saveSharedSetting } from '../supabase';
import { Link } from 'react-router';

interface SakshiVIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestieName: string;
  senderName: string;
  onReplayAnimation?: () => void;
}

export const SakshiVIPModal: React.FC<SakshiVIPModalProps> = ({
  isOpen,
  onClose,
  bestieName = 'Sakshi',
  senderName = 'Subho',
  onReplayAnimation,
}) => {
  const { user, logout } = useAuth();
  const [replyTitle, setReplyTitle] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isPlayingFavSong, setIsPlayingFavSong] = useState(false);
  const [customSongTitle, setCustomSongTitle] = useState(() => soundManager.customSongTitle);
  const [isUploadingSong, setIsUploadingSong] = useState(false);

  useEffect(() => {
    // Check if favorite song is playing
    const interval = setInterval(() => {
      setIsPlayingFavSong(soundManager.getIsMelodyPlaying());
      setCustomSongTitle(soundManager.customSongTitle);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen || !user) return null;

  const toggleFavoriteSong = () => {
    if (isPlayingFavSong) {
      soundManager.stopMelody();
      setIsPlayingFavSong(false);
    } else {
      soundManager.resumeAudioContext().then(() => {
        soundManager.playSakshiFavoriteSong(true, () => {
          setIsPlayingFavSong(false);
        });
        setIsPlayingFavSong(true);
        soundManager.playSparkle();
      });
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSong(true);
    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const publicUrl = await uploadMedia(file, 'songs');
      await saveSharedSetting('default_song', { url: publicUrl, title: cleanName });
      soundManager.setCustomSong(publicUrl, cleanName);
      setCustomSongTitle(cleanName);
      soundManager.playSparkle();
      soundManager.playConfettiBurst();
      triggerBirthdayConfetti();
      soundManager.playSakshiFavoriteSong(true);
      setIsPlayingFavSong(true);
    } catch (error) {
      console.error('Failed to upload shared song:', error);
      window.alert(error instanceof Error ? error.message : 'Song upload failed. Check your Supabase setup.');
    } finally {
      setIsUploadingSong(false);
      e.target.value = '';
    }
  };

  const handleResetToDefaultSong = () => {
    soundManager.clearCustomSong();
    saveSharedSetting('default_song', { reset: true }).catch((error) => console.warn('Could not clear shared song setting:', error));
    setCustomSongTitle('');
    soundManager.playSparkle();
    if (isPlayingFavSong) {
      soundManager.playSakshiFavoriteSong(true);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsSending(true);
    try {
      const letterTitle = replyTitle.trim() || `Reply from ${bestieName} to ${senderName} 💕`;
      await api.addLetter({
        name: bestieName,
        title: letterTitle,
        msg: replyMessage.trim(),
        theme: 'from-pink-100 to-rose-200 border-rose-300 text-rose-950',
      });

      soundManager.playSparkle();
      soundManager.playConfettiBurst();
      triggerBirthdayConfetti();
      triggerHeartShower();

      setSentSuccess(true);
      setReplyMessage('');
      setReplyTitle('');
      setTimeout(() => setSentSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    if (isPlayingFavSong) {
      soundManager.stopMelody();
      setIsPlayingFavSong(false);
    }
    soundManager.playSparkle();
    logout();
    onClose();
  };

  const scrollTo = (id: string) => {
    onClose();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end transition-opacity duration-300"
    >
      {/* Side View Drawer */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl border-l-2 border-rose-200/90 shadow-2xl h-full flex flex-col justify-between overflow-y-auto text-rose-950 transform transition-transform duration-300 ease-out"
      >
        <div>
          {/* Top Bar */}
          <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/80 to-pink-50/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-display font-bold text-base text-rose-950 leading-tight">
                  Sakshi&apos;s Celebration Lounge
                </h3>
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">
                  All Access Unlocked ✓
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-rose-400 hover:text-rose-900 hover:bg-rose-100/70 transition-colors cursor-pointer"
              aria-label="Close side view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* Royal Welcome Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white shadow-lg shadow-rose-600/20 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Happy Birthday Sakshi</span>
              </div>
              <h2 className="font-serif-display text-2xl font-bold">
                Welcome, {bestieName}! 🎂💖
              </h2>
              <p className="text-xs text-rose-100/90 mt-1 leading-relaxed">
                You have full access to everything! Upload your own favorite songs, manage photos, and enjoy your birthday surprises.
              </p>
            </div>

            {/* Favorite Song & Upload Your Own Song Card */}
            <div className="p-4 rounded-2xl bg-pink-50/90 border border-pink-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-rose-900 font-semibold text-xs">
                  <Music className="w-4 h-4 text-rose-600" />
                  <span>Favorite Song Player</span>
                </div>
                {customSongTitle ? (
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-semibold">
                    Custom Song Loaded ✓
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-700 bg-rose-200/70 px-2 py-0.5 rounded-full font-medium">
                    Tum Hi Ho (Default)
                  </span>
                )}
              </div>

              {/* Player pill */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-rose-100 mb-3 shadow-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-serif-display font-bold text-sm text-rose-950 truncate">
                    {customSongTitle || "Tum Hi Ho 💕"}
                  </div>
                  <div className="text-[11px] text-rose-600/80 truncate">
                    {customSongTitle ? "Your Uploaded Favorite Track" : "Romantic Music Box Rendition"}
                  </div>
                </div>

                <button
                  onClick={toggleFavoriteSong}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                    isPlayingFavSong
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  {isPlayingFavSong ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-rose-800" />
                      <span>Play</span>
                    </>
                  )}
                </button>
              </div>

              {/* Upload Song Action Button */}
              <div className="flex items-center gap-2">
                <label className="flex-1 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingSong ? 'Uploading Song...' : 'Upload Your Own Song (MP3/Audio)'}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleAudioUpload}
                  />
                </label>

                {customSongTitle && (
                  <button
                    onClick={handleResetToDefaultSong}
                    className="p-2.5 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium cursor-pointer transition-colors shadow-xs"
                    title="Reset to default Tum Hi Ho"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-rose-700/70 mt-1.5 px-1 leading-normal">
                Upload any song from your phone or PC. It will play whenever your photos are viewed!
              </p>
            </div>

            {/* Replay Grand Celebration Animation */}
            {onReplayAnimation && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-amber-950 block">
                    Celebration Animation
                  </span>
                  <span className="text-[10px] text-amber-800/80 block">
                    Watch the cake, candles &amp; fireworks entrance
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onReplayAnimation();
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Cake className="w-3.5 h-3.5" />
                  <span>Show Animation</span>
                </button>
              </div>
            )}

            {/* Side Navigation Shortcuts */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800/80 block mb-2 px-1">
                Explore Your Celebration Side
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => scrollTo('memories-section')}
                  className="p-3 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl text-left transition-all flex flex-col gap-1 cursor-pointer"
                >
                  <Images className="w-4 h-4 text-rose-600" />
                  <span className="font-semibold text-rose-950">Photo Memories</span>
                  <span className="text-[10px] text-rose-600/70">Scrapbook with music</span>
                </button>

                <button
                  onClick={() => scrollTo('cake-section')}
                  className="p-3 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl text-left transition-all flex flex-col gap-1 cursor-pointer"
                >
                  <Cake className="w-4 h-4 text-rose-600" />
                  <span className="font-semibold text-rose-950">Birthday Cake</span>
                  <span className="text-[10px] text-rose-600/70">Make a wish</span>
                </button>

                <Link
                  to="/love-letter"
                  onClick={onClose}
                  className="p-3 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl text-left transition-all flex flex-col gap-1 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-rose-600" />
                  <span className="font-semibold text-rose-950">Love Letters</span>
                  <span className="text-[10px] text-rose-600/70">Notes from {senderName}</span>
                </Link>

                <button
                  onClick={() => scrollTo('countdown-watch')}
                  className="p-3 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl text-left transition-all flex flex-col gap-1 cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span className="font-semibold text-rose-950">Countdown Watch</span>
                  <span className="text-[10px] text-rose-600/70">27 Oct 2027</span>
                </button>
              </div>
            </div>

            {/* Note to Subho */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
              <div className="flex items-center gap-1.5 text-rose-900 font-semibold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Reply Back to {senderName}</span>
              </div>
              <p className="text-[11px] text-rose-700/80 mb-3">
                Send a direct thank-you note or chaotic bestie message to {senderName}:
              </p>

              {sentSuccess && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your note was sent and added to the love letters!</span>
                </div>
              )}

              <form onSubmit={handleSendReply} className="space-y-2">
                <input
                  type="text"
                  value={replyTitle}
                  onChange={(e) => setReplyTitle(e.target.value)}
                  placeholder="Title (e.g. Thanks for the surprise!)"
                  className="w-full px-3 py-1.5 bg-white rounded-lg border border-rose-200 text-xs text-rose-950 placeholder-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <textarea
                  rows={3}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={`Write your reply to ${senderName}...`}
                  className="w-full px-3 py-1.5 bg-white rounded-lg border border-rose-200 text-xs text-rose-950 placeholder-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSending || !replyMessage.trim()}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSending ? 'Sending...' : 'Send Note'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Logout */}
        <div className="p-4 border-t border-rose-100 flex items-center justify-between bg-white/80">
          <span className="text-[11px] text-rose-600/80 flex items-center gap-1">
            <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
            <span>Sakshi All Access Active</span>
          </span>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
