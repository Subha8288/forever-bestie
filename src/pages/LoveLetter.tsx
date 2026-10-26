import React, { useEffect, useState } from 'react';
import heartImg from '../assets/heart.png';
import sakshiPhoto from '../assets/sakshi_photo.png';
import { Link } from 'react-router';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  X,
  RotateCw,
  Heart,
  Send,
  BookOpen,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { triggerBirthdayConfetti, triggerGentleSparkle } from '../utils/confetti';
import { api, SharedLetter } from '../utils/api';
import '../LoveLetter.css';

interface LoveLetterProps {
  bestieName?: string;
  senderName?: string;
}

const DEFAULT_LETTERS: SharedLetter[] = [
  {
    id: 1,
    name: 'Subho',
    title: 'Happy Birthday, My Favorite Kaleshi!',
    msg: 'Wish you the absolute happiest birthday, Sakshi! You make life a million times funnier, warmer, and more exciting just by existing. Never stop being your dramatic, hilarious, golden self!',
    theme: 'from-rose-100 to-pink-100 border-rose-300 text-rose-950',
    createdAt: '27 Oct 2027',
  },
  {
    id: 2,
    name: 'Subho',
    title: 'The Unstoppable Duo',
    msg: 'One message or phone call from you can change my whole day, my whole mood, and my whole mindset. Nobody gets my chaotic thoughts like you do.',
    theme: 'from-amber-100 to-yellow-100 border-amber-300 text-amber-950',
    createdAt: '27 Oct 2027',
  },
  {
    id: 3,
    name: 'Subho',
    title: '3 AM Laughs & Inside Jokes',
    msg: 'Even when life gets crazy or stressful, our laughs reach each other like instant medicine. Here is to a lifetime of late-night gossips and unhinged voice notes.',
    theme: 'from-purple-100 to-pink-100 border-purple-300 text-purple-950',
    createdAt: '27 Oct 2027',
  },
  {
    id: 4,
    name: 'Subho',
    title: 'A Constant Through Every Season',
    msg: "Every notification from you feels like a reminder that no matter what happens, we've got each other's back through thick and thin.",
    theme: 'from-rose-100 to-rose-200 border-rose-300 text-rose-950',
    createdAt: '27 Oct 2027',
  },
  {
    id: 5,
    name: 'Subho',
    title: 'My Birthday Promise to You',
    msg: 'I promise to always hype you up, listen to your dramatic rants, support your biggest dreams, and bring you food without even asking. Happy Birthday, Kaleshi!',
    theme: 'from-pink-100 to-rose-100 border-pink-300 text-pink-950',
    createdAt: '27 Oct 2027',
  },
];

const LoveLetter: React.FC<LoveLetterProps> = ({
  bestieName = 'Sakshi',
  senderName = 'subho',
}) => {
  const [openEnvelope, setOpenEnvelope] = useState(false);
  const [letters, setLetters] = useState<SharedLetter[]>(() => {
    try {
      const saved = localStorage.getItem('sakshi_love_letters');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_LETTERS;
  });

  const [zIndexCounter, setZIndexCounter] = useState(30);
  const [isComposing, setIsComposing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<SharedLetter | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load online letters from shared server on mount
  useEffect(() => {
    api.getSharedData().then((data) => {
      if (data && data.letters && data.letters.length > 0) {
        setLetters(data.letters);
        try {
          localStorage.setItem('sakshi_love_letters', JSON.stringify(data.letters));
        } catch {
          // Ignore
        }
      }
    });
  }, []);

  const handleOpenEnvelope = () => {
    soundManager.playSparkle();
    soundManager.playConfettiBurst();
    triggerGentleSparkle(0.5, 0.5);
    setOpenEnvelope(true);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    const isTouch = 'touches' in e;
    const startEvent = isTouch ? e.touches[0] : (e as React.MouseEvent);

    if ((startEvent.target as HTMLElement).closest('button')) return;

    soundManager.playPageTurn();
    const letterEl = e.currentTarget as HTMLElement;
    const rect = letterEl.getBoundingClientRect();

    const offsetX = startEvent.clientX - rect.left;
    const offsetY = startEvent.clientY - rect.top;

    const startLeft = rect.left + window.scrollX;
    const startTop = rect.top + window.scrollY;

    letterEl.style.transform = 'none';
    letterEl.classList.remove('-translate-x-1/2');
    letterEl.classList.remove('-translate-y-1/2');

    letterEl.style.position = 'absolute';
    letterEl.style.left = `${startLeft}px`;
    letterEl.style.top = `${startTop}px`;
    letterEl.style.margin = '0';
    letterEl.style.zIndex = `${zIndexCounter + 1}`;
    setZIndexCounter((prev) => prev + 1);

    const moveAt = (posX: number, posY: number) => {
      letterEl.style.left = `${posX - offsetX}px`;
      letterEl.style.top = `${posY - offsetY}px`;
    };

    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const ev = 'touches' in moveEvent ? moveEvent.touches[0] : (moveEvent as MouseEvent);
      moveAt(ev.clientX, ev.clientY);
    };

    const onMouseUp = () => {
      if (isTouch) {
        document.removeEventListener('touchmove', onMouseMove);
        document.removeEventListener('touchend', onMouseUp);
      } else {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
    };

    if (isTouch) {
      document.addEventListener('touchmove', onMouseMove);
      document.addEventListener('touchend', onMouseUp);
    } else {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  };

  const handleCloseLetter = async (id: number) => {
    soundManager.playSparkle();
    setLetters((prev) => prev.filter((l) => l.id !== id));
    try {
      const updated = letters.filter((l) => l.id !== id);
      localStorage.setItem('sakshi_love_letters', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    await api.deleteLetter(id);
  };

  const handleResetLetters = () => {
    soundManager.playSparkle();
    setLetters(DEFAULT_LETTERS);
    setOpenEnvelope(true);
    try {
      localStorage.setItem('sakshi_love_letters', JSON.stringify(DEFAULT_LETTERS));
    } catch {
      // Ignore
    }
  };

  const handleCreateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    soundManager.playConfettiBurst();
    triggerBirthdayConfetti();
    setIsSyncing(true);

    const newLetterData = {
      name: senderName || 'Subho',
      title: newTitle.trim() || `A Special Letter for ${bestieName}`,
      msg: newContent.trim(),
      theme: 'from-rose-100 to-pink-100 border-rose-300 text-rose-950',
    };

    // Save online to server
    const savedServerLetter = await api.addLetter(newLetterData);
    const addedLetter: SharedLetter = savedServerLetter || {
      id: Date.now(),
      ...newLetterData,
      createdAt: 'Today',
    };

    const updated = [addedLetter, ...letters];
    setLetters(updated);
    try {
      localStorage.setItem('sakshi_love_letters', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    setIsSyncing(false);
    setIsComposing(false);
    setNewTitle('');
    setNewContent('');
    setOpenEnvelope(true);
  };

  return (
    <main
      className="munna min-h-screen w-full overflow-x-hidden relative select-none pb-24"
      style={{
        background: 'linear-gradient(160deg, #880e4f 0%, #ad1457 35%, #d81b60 70%, #ec407a 100%)',
      }}
    >
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-black/25 backdrop-blur-md px-4 py-3 border-b border-white/20 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/25 hover:bg-white/40 text-white font-semibold text-xs backdrop-blur-md border border-white/40 shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Celebration Stage</span>
          </Link>
          <button
            onClick={handleResetLetters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-medium text-xs backdrop-blur-md border border-white/30 shadow-md transition-all cursor-pointer"
            title="Reset default letters"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Action Controls & Sakshi Avatar Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsComposing(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-rose-800 font-bold text-xs shadow-lg hover:bg-rose-50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write Letter</span>
          </button>

          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-sm">
            <img
              src={sakshiPhoto}
              alt="Sakshi"
              className="w-7 h-7 rounded-full object-cover border border-white shadow-xs"
            />
            <span className="text-white text-xs font-semibold">For Sakshi (Kaleshi)</span>
          </div>
        </div>
      </header>

      {/* Main Envelope Stage */}
      <section className="munna cssletter z-10 pt-6 sm:pt-10 flex flex-col items-center">
        <div className={`envelope ${openEnvelope ? 'active' : ''} shadow-2xl`}>
          <button
            className="munna heart cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            id="openEnvelope"
            aria-label="Open Envelope"
            onClick={handleOpenEnvelope}
          >
            <span className="munna heart-text">Open</span>
          </button>

          <div className="munna envelope-flap text-black relative">
            <div className="munna absolute left-1/2 top-[20%] -translate-x-1/2 flex items-center justify-center flex-col md:gap-y-2 text-center w-full px-2">
              <span className="munna font-sriracha md:text-2xl text-lg text-rose-950 font-bold">
                Envelope Of Love
              </span>
              <span className="munna font-dancingScript md:text-3xl text-xl text-rose-800 font-bold">
                Dear {bestieName}
              </span>
            </div>
          </div>

          <div className="munna envelope-folds">
            <div className="munna envelope-left"></div>
            <div className="munna envelope-right"></div>
            <div className="munna envelope-bottom"></div>
          </div>
        </div>

        {/* DRAGGABLE & READABLE LETTERS */}
        {openEnvelope && (
          <div className="munna letters w-full max-w-2xl mx-auto min-h-[380px] relative mt-4">
            {letters.map((letter, idx) => (
              <blockquote
                key={letter.id}
                className={`munna letter cursor-grab active:cursor-grabbing rounded-2xl p-4 sm:p-5 border-2 bg-gradient-to-br ${letter.theme}`}
                id={String(letter.id)}
                tabIndex={0}
                style={{
                  position: 'absolute',
                  top: `${48 + (idx % 4) * 6}%`,
                  left: `${50 + (idx % 2 === 0 ? -4 : 4)}%`,
                  transform: `translate(-50%, -50%) rotate(${(idx % 3 === 0 ? -3 : idx % 2 === 0 ? 3 : -1.5)}deg)`,
                  zIndex: 10 + idx,
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
              >
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-black/10">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700">
                    💌 Note #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        soundManager.playPageTurn();
                        setSelectedLetter(letter);
                      }}
                      className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-rose-800 text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Read</span>
                    </button>
                    <button
                      className="closeLetter"
                      title="Remove letter"
                      onClick={() => handleCloseLetter(letter.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <h4 className="font-serif-display font-bold text-sm sm:text-base text-rose-950 mb-1 line-clamp-1">
                  {letter.title}
                </h4>
                <p className="font-handwriting text-lg sm:text-xl text-rose-900 leading-snug line-clamp-3">
                  {letter.msg}
                </p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 text-xs text-rose-800">
                  <span className="text-[10px] opacity-75">{letter.createdAt || '27 Oct 2027'}</span>
                  <cite className="font-bold not-italic font-handwriting text-base">
                    — {letter.name}
                  </cite>
                </div>
              </blockquote>
            ))}
          </div>
        )}
      </section>

      {/* Helper Banner When Closed */}
      {!openEnvelope && (
        <div className="text-center mt-10 relative z-20 px-4">
          <button
            onClick={handleOpenEnvelope}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/95 text-rose-950 font-bold text-xs sm:text-sm shadow-2xl backdrop-blur-md animate-bounce border-2 border-rose-300 cursor-pointer hover:bg-white"
          >
            <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
            <span>Tap the Heart Seal to Open Sakshi&apos;s Love Letters!</span>
          </button>
        </div>
      )}

      {/* Card Carousel List for Quick Mobile Reading */}
      {openEnvelope && (
        <div className="mt-16 max-w-xl mx-auto px-4 relative z-20">
          <div className="text-center mb-4">
            <span className="text-white/80 font-serif-display text-xs uppercase tracking-widest font-semibold block">
              Quick Card Reader
            </span>
            <p className="text-white/70 text-[11px]">
              Tap any letter below to read it in full parchment view
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {letters.map((letter, i) => (
              <div
                key={letter.id}
                onClick={() => {
                  soundManager.playPageTurn();
                  setSelectedLetter(letter);
                }}
                className="bg-white/90 hover:bg-white p-3.5 rounded-2xl shadow-md border border-rose-200 cursor-pointer transition-all hover:scale-[1.02] text-rose-950"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-rose-500 mb-1">
                  <span>LETTER #{i + 1}</span>
                  <Heart className="w-3 h-3 fill-rose-500" />
                </div>
                <h5 className="font-serif-display font-bold text-xs line-clamp-1 mb-1">
                  {letter.title}
                </h5>
                <p className="font-handwriting text-base text-rose-800 line-clamp-2">
                  {letter.msg}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full-Screen Letter Reading Lightbox */}
      {selectedLetter && (
        <div
          onClick={() => setSelectedLetter(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#fffdfa] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-rose-300 relative text-rose-950"
            style={{
              backgroundImage: 'radial-gradient(#ffe4e6 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-rose-400 hover:text-rose-900 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4 border-b-2 border-rose-200 pb-3">
              <span className="text-[11px] uppercase tracking-widest font-bold text-rose-500 block mb-1">
                A Letter from {selectedLetter.name} to Sakshi (Kaleshi)
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-rose-950">
                {selectedLetter.title}
              </h3>
            </div>

            <p className="font-handwriting text-2xl sm:text-3xl text-rose-950 leading-relaxed whitespace-pre-line my-5">
              &ldquo;{selectedLetter.msg}&rdquo;
            </p>

            <div className="mt-6 pt-4 border-t-2 border-rose-200 flex items-center justify-between text-xs text-rose-800">
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span className="font-semibold">Dedicated with love</span>
              </div>
              <span className="font-bold font-handwriting text-2xl text-rose-950">
                — {selectedLetter.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Composer Modal for New Letter */}
      {isComposing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-200 relative">
            <button
              onClick={() => setIsComposing(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-rose-400 hover:text-rose-900 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Heart className="w-4 h-4 fill-rose-500" />
              </div>
              <h3 className="font-serif-display text-xl font-bold text-rose-950">
                Write a Letter for Sakshi
              </h3>
            </div>
            <p className="text-xs text-rose-700/80 mb-4">
              Add a heartfelt note or funny wish to the envelope from {senderName || 'Subho'}. It will be saved online!
            </p>

            <form onSubmit={handleCreateLetter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  Letter Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Favorite Kaleshi Memory..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write a sweet, chaotic or emotional note for Sakshi..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none font-handwriting text-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Saving Online...' : 'Save & Put in Envelope'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Falling Hearts Animation */}
      <div className="munna snowflakes z-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="munna snowflake">
            <img src={heartImg} width="25" alt="Heart" />
          </div>
        ))}
      </div>
    </main>
  );
};

export default LoveLetter;
