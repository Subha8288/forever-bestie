import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookMarked, Send, Heart, X, MessageSquareHeart, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { triggerGentleSparkle } from '../utils/confetti';

interface DiaryEntry {
  id: string;
  sender: string;
  note: string;
  time: string;
  color: string;
}

interface MiniDiaryNoteProps {
  bestieName: string;
}

export const MiniDiaryNote: React.FC<MiniDiaryNoteProps> = ({ bestieName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');

  const [entries, setEntries] = useState<DiaryEntry[]>([
    {
      id: '1',
      sender: 'Your Soul Sister',
      note: 'Promise me that this year you will choose yourself unapologetically. You give so much to everyone else—now it is your turn to bloom!',
      time: 'Just now',
      color: 'bg-rose-50 border-rose-200 text-rose-950',
    },
    {
      id: '2',
      sender: 'Partner in Crime',
      note: 'May your coffee be strong, your skin be glowing, and our weekend plans never get cancelled.',
      time: '1 hour ago',
      color: 'bg-amber-50 border-amber-200 text-amber-950',
    },
    {
      id: '3',
      sender: 'Forever Fan',
      note: 'Never lose your goofy laugh that fills the whole room. Happy Birthday gorgeous!',
      time: 'Earlier today',
      color: 'bg-pink-50 border-pink-200 text-pink-950',
    },
  ]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    soundManager.playSparkle();
    triggerGentleSparkle(0.85, 0.85);

    const newEntry: DiaryEntry = {
      id: `entry-${Date.now()}`,
      sender: authorName.trim() || 'A Secret Admirer',
      note: message.trim(),
      time: 'Just now',
      color: 'bg-rose-50 border-rose-200 text-rose-950',
    };

    setEntries([newEntry, ...entries]);
    setMessage('');
    setAuthorName('');
  };

  return (
    <>
      {/* Inline Section for the Page Layout */}
      <section id="diary-section" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-rose-200/80 relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-rose-600 mb-2">
              <MessageSquareHeart className="w-3.5 h-3.5" />
              <span>The Keepsake Guestbook</span>
            </div>
            <h3 className="font-serif-display text-3xl sm:text-4xl font-bold text-rose-950">
              Mini Diary of Birthday Wishes
            </h3>
            <p className="mt-2 text-sm text-rose-800/80 font-light">
              Leave a quick heartfelt blessing or note for {bestieName} to cherish.
            </p>
          </div>

          {/* Quick Input Bar */}
          <form onSubmit={handleAddEntry} className="mb-8 max-w-2xl mx-auto">
            <div className="bg-white/80 p-3 sm:p-4 rounded-2xl border border-rose-200 shadow-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Maya)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-rose-100 bg-rose-50/40 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <input
                  type="text"
                  required
                  placeholder="Write a sweet one-liner or wish..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="sm:col-span-2 px-3.5 py-2 text-xs rounded-xl border border-rose-100 bg-rose-50/40 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Post Quick Wish</span>
                </button>
              </div>
            </div>
          </form>

          {/* Entries Feed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {entries.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border ${item.color} shadow-sm relative flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-rose-800/70 mb-2">
                    <span className="truncate">{item.sender}</span>
                    <span>{item.time}</span>
                  </div>
                  <p className="font-handwriting text-lg leading-snug">
                    &ldquo;{item.note}&rdquo;
                  </p>
                </div>
                <div className="mt-3 flex justify-end">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Bottom Letter Launcher (Subtle Popup for quick wishes) */}
      <div className="fixed bottom-5 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundManager.playSparkle();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-600 text-white font-medium text-xs shadow-xl shadow-rose-900/20 hover:bg-rose-700 transition-all border border-rose-400 cursor-pointer"
        >
          <BookMarked className="w-4 h-4" />
          <span>Mini Diary Note</span>
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
        </motion.button>
      </div>

      {/* Slide-over Mini Diary Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-80 sm:w-96 max-h-[80vh] rounded-3xl glass-card-deep shadow-2xl border border-rose-200 overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-4 bg-white/70 border-b border-rose-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>
                <div>
                  <h4 className="font-serif-display font-bold text-sm text-rose-950">
                    Mini Diary of Wishes
                  </h4>
                  <p className="text-[10px] text-rose-600">Quick blessings for {bestieName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-rose-400 hover:text-rose-900 hover:bg-rose-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Composer */}
            <form onSubmit={handleAddEntry} className="p-3 bg-white/50 border-b border-rose-100">
              <input
                type="text"
                placeholder="Your Name..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full mb-1.5 px-3 py-1.5 text-xs rounded-lg border border-rose-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-400"
              />
              <textarea
                required
                rows={2}
                placeholder={`Leave a sweet birthday wish for ${bestieName}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 resize-none font-handwriting text-base"
              />
              <div className="flex justify-end mt-1.5">
                <button
                  type="submit"
                  className="px-3 py-1 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Wish</span>
                </button>
              </div>
            </form>

            {/* Scrollable Feed */}
            <div className="p-4 space-y-2.5 overflow-y-auto max-h-72">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-white/80 border border-rose-100 shadow-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-rose-700 font-semibold mb-1">
                    <span>{entry.sender}</span>
                    <span className="text-rose-400">{entry.time}</span>
                  </div>
                  <p className="font-handwriting text-base text-rose-950 leading-tight">
                    &ldquo;{entry.note}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-rose-50 text-center text-[10px] text-rose-600 border-t border-rose-100">
              <Sparkles className="w-3 h-3 inline mr-1 text-amber-500" />
              Tap anywhere outside or close to minimize
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
