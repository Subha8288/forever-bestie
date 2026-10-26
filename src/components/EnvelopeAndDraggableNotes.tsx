import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Heart, Sparkles, RotateCw, Plus, Trash2, X } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { triggerGentleSparkle } from '../utils/confetti';

interface LoveCardData {
  id: string;
  title: string;
  tag: string;
  frontPreview: string;
  backMessage: string;
  bgGradient: string;
  textColor: string;
  badgeBg: string;
  initialOffset: { x: number; y: number };
  rotation: number;
}

interface EnvelopeNotesProps {
  bestieName: string;
  senderName: string;
}

export const EnvelopeAndDraggableNotes: React.FC<EnvelopeNotesProps> = ({
  bestieName,
  senderName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [flippedCards, setFlippedCards] = useState<{ [id: string]: boolean }>({});
  const [topCardId, setTopCardId] = useState<string>('card-1');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // New note form state
  const [newTitle, setNewTitle] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const [cards, setCards] = useState<LoveCardData[]>([
    {
      id: 'card-1',
      title: "Top 5 Reasons You're My Soul Bestie",
      tag: "The Facts",
      frontPreview: "Tap card to flip & reveal why you're 100% irreplaceable 💌",
      backMessage: "1. You never judge my questionable decisions.\n2. You laugh at my dumb jokes.\n3. You remember my exact food orders.\n4. Even sitting in silence with you is fun.\n5. You have the purest, biggest heart on Earth.",
      bgGradient: "from-rose-100 to-pink-200 border-rose-300",
      textColor: "text-rose-950",
      badgeBg: "bg-rose-200 text-rose-800",
      initialOffset: { x: -60, y: -40 },
      rotation: -3,
    },
    {
      id: 'card-2',
      title: "Official Birthday Pass",
      tag: "Voucher",
      frontPreview: "Golden coupon valid forever across all parallel universes ✨",
      backMessage: "Redeemable for:\n• Unlimited 3am crisis calls\n• Free emergency fries delivery\n• Unconditional hype speeches before big moments\n\nExpiration: Never.",
      bgGradient: "from-amber-100 to-yellow-200 border-amber-300",
      textColor: "text-amber-950",
      badgeBg: "bg-amber-200 text-amber-900",
      initialOffset: { x: 50, y: -70 },
      rotation: 4,
    },
    {
      id: 'card-3',
      title: "Emergency Dopamine Booster",
      tag: "Read When Sad",
      frontPreview: "Open whenever you need a reminder of how incredible you are 🌸",
      backMessage: "You are stronger than any obstacle you've faced this year. You light up spaces just by being in them, and whatever is worrying you right now will pass. I am in your corner forever.",
      bgGradient: "from-purple-100 to-pink-100 border-purple-200",
      textColor: "text-purple-950",
      badgeBg: "bg-purple-200 text-purple-800",
      initialOffset: { x: -30, y: 30 },
      rotation: -2,
    },
    {
      id: 'card-4',
      title: "Our Craziest Late-Night Laughs",
      tag: "Core Memory",
      frontPreview: "A little secret from that one night we'll never forget 🤫",
      backMessage: "Remember when we laughed so hysterically that no sound came out, just wheezing and tears? That exact moment is etched in my soul as pure joy.",
      bgGradient: "from-rose-200 to-rose-300 border-rose-400",
      textColor: "text-rose-950",
      badgeBg: "bg-white/80 text-rose-800",
      initialOffset: { x: 70, y: 40 },
      rotation: 5,
    },
  ]);

  const toggleEnvelope = () => {
    soundManager.playSparkle();
    setIsOpen(!isOpen);
    if (!isOpen) {
      triggerGentleSparkle(0.5, 0.7);
    }
  };

  const flipCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playSparkle();
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCardFocus = (id: string) => {
    setTopCardId(id);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBack.trim()) return;

    const newCard: LoveCardData = {
      id: `card-${Date.now()}`,
      title: newTitle,
      tag: "Custom Wish",
      frontPreview: newFront || "A special personal surprise card for you 💖",
      backMessage: newBack,
      bgGradient: "from-rose-100 to-pink-200 border-rose-300",
      textColor: "text-rose-950",
      badgeBg: "bg-rose-200 text-rose-800",
      initialOffset: { x: 0, y: 0 },
      rotation: Math.floor(Math.random() * 8) - 4,
    };

    setCards((prev) => [newCard, ...prev]);
    setTopCardId(newCard.id);
    setIsAddingNote(false);
    setNewTitle('');
    setNewFront('');
    setNewBack('');
    soundManager.playConfettiBurst();
  };

  const handleDeleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <section id="envelope-section" className="py-16 sm:py-24 relative overflow-hidden bg-rose-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-rose-600 mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>Interactive Surprise Mailbox</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-rose-950 tracking-tight">
            The Envelope of Love Notes
          </h2>
          <p className="mt-2 text-sm sm:text-base text-rose-800/80 font-light">
            Tap the wax seal to open the envelope, then drag and flip each love letter to uncover secret messages.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <button
            onClick={toggleEnvelope}
            className="px-5 py-2 text-xs font-semibold text-rose-900 bg-white hover:bg-rose-100 border border-rose-200 rounded-full shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-rose-600" />
            <span>{isOpen ? 'Close Envelope' : 'Open Envelope'}</span>
          </button>
          <button
            onClick={() => setIsAddingNote(true)}
            className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write New Love Note</span>
          </button>
        </div>

        {/* Draggable Playground Container */}
        <div
          ref={containerRef}
          className="relative w-full h-[540px] sm:h-[600px] rounded-3xl glass-card overflow-hidden border border-rose-200/80 p-4 sm:p-8 flex items-center justify-center select-none"
        >
          {/* Background Ambient Note Grid Clue */}
          <div className="absolute inset-0 paper-texture opacity-40 pointer-events-none" />

          {/* THE 3D ENVELOPE BASE */}
          <div className="relative w-72 sm:w-88 aspect-[16/11] z-10 flex items-center justify-center">
            {/* Envelope Back Body */}
            <div className="absolute inset-0 bg-rose-300 rounded-2xl shadow-2xl border-2 border-rose-400" />

            {/* Envelope Interior Lining Pattern */}
            <div className="absolute inset-2 bg-rose-100/90 rounded-xl overflow-hidden border border-rose-200 flex items-center justify-center">
              <span className="font-handwriting text-2xl text-rose-400/50 -rotate-12 select-none pointer-events-none">
                With all my heart for {bestieName}
              </span>
            </div>

            {/* ENVELOPE TOP FLAP */}
            <motion.div
              onClick={toggleEnvelope}
              animate={{
                rotateX: isOpen ? 180 : 0,
                zIndex: isOpen ? 0 : 30,
              }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -top-1 inset-x-0 h-1/2 origin-top transform-style-3d cursor-pointer"
              title="Click wax seal to open or close"
            >
              {/* Flap Outer Triangle */}
              <div
                className="w-full h-full bg-rose-400 rounded-t-2xl flex items-center justify-center relative shadow-md"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                }}
              >
                {/* Wax Seal Button on the flap tip */}
                {!isOpen && (
                  <div className="absolute bottom-2 w-12 h-12 rounded-full bg-gradient-to-tr from-rose-800 to-rose-600 border-2 border-amber-300 shadow-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 active:scale-95 transition-transform">
                    <Heart className="w-5 h-5 fill-amber-300 text-amber-300" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Envelope Front Left & Right Pockets */}
            <div
              className="absolute inset-0 bg-rose-300/80 pointer-events-none rounded-2xl border-t border-rose-400/40 z-20"
              style={{
                clipPath: 'polygon(0% 0%, 50% 50%, 100% 0%, 100% 100%, 0% 100%)',
              }}
            />
            {/* Envelope Front Bottom Fold */}
            <div
              className="absolute inset-0 bg-rose-200/95 pointer-events-none rounded-b-2xl z-20 shadow-inner"
              style={{
                clipPath: 'polygon(0% 100%, 50% 45%, 100% 100%)',
              }}
            />

            {/* Stamp on the front pocket */}
            <div className="absolute bottom-4 right-4 z-25 pointer-events-none bg-white p-1 rounded shadow-sm border border-rose-200 rotate-6">
              <div className="w-10 h-12 border border-dashed border-rose-300 flex flex-col items-center justify-center text-[8px] font-bold text-rose-700 uppercase">
                <span>Air Mail</span>
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500 my-0.5" />
                <span>Love</span>
              </div>
            </div>
          </div>

          {/* DRAGGABLE CARDS */}
          <AnimatePresence>
            {isOpen &&
              cards.map((card, index) => {
                const isFlipped = !!flippedCards[card.id];
                const isTop = topCardId === card.id;

                return (
                  <motion.div
                    key={card.id}
                    drag
                    dragConstraints={containerRef}
                    dragElastic={0.2}
                    dragMomentum={false}
                    onDragStart={() => handleCardFocus(card.id)}
                    onClick={() => handleCardFocus(card.id)}
                    initial={{
                      scale: 0.2,
                      y: 80,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      x: card.initialOffset.x + (index % 2 === 0 ? -20 : 20),
                      y: card.initialOffset.y - index * 15,
                      opacity: 1,
                      rotate: card.rotation,
                      zIndex: isTop ? 50 : 25 + index,
                    }}
                    exit={{
                      scale: 0.2,
                      y: 80,
                      opacity: 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                      delay: index * 0.1,
                    }}
                    className={`absolute w-64 sm:w-72 min-h-[170px] rounded-2xl p-5 shadow-xl border cursor-grab active:cursor-grabbing backdrop-blur-md bg-gradient-to-br ${card.bgGradient} ${card.textColor} transition-shadow hover:shadow-2xl`}
                    style={{
                      touchAction: 'none',
                    }}
                  >
                    {/* Header Tag and Flip Button */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${card.badgeBg}`}>
                        {card.tag}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => flipCard(card.id, e)}
                          className="p-1 rounded-full bg-white/70 hover:bg-white text-rose-800 transition-colors cursor-pointer"
                          title="Flip card to read"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        {card.tag === 'Custom Wish' && (
                          <button
                            onClick={(e) => handleDeleteCard(card.id, e)}
                            className="p-1 rounded-full bg-white/70 hover:bg-white text-rose-800 transition-colors cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Content based on flip state */}
                    {!isFlipped ? (
                      <div>
                        <h4 className="font-serif-display text-base font-bold leading-tight">
                          {card.title}
                        </h4>
                        <p className="mt-2 text-xs font-light opacity-90 leading-relaxed">
                          {card.frontPreview}
                        </p>
                        <div className="mt-4 pt-2 border-t border-rose-900/10 flex items-center justify-between text-[10px] opacity-70">
                          <span>Drag anywhere · Tap icon to flip</span>
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h5 className="font-bold text-xs uppercase tracking-wider text-rose-800/80 mb-1">
                          Secret Message:
                        </h5>
                        <p className="font-handwriting text-lg leading-snug whitespace-pre-line text-rose-950">
                          {card.backMessage}
                        </p>
                        <div className="mt-3 text-[10px] text-right font-medium opacity-75">
                          — {senderName || 'Your Bestie'}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {/* If envelope is closed, helper hint */}
          {!isOpen && (
            <div className="absolute bottom-6 z-30 pointer-events-none text-center">
              <span className="text-xs font-medium text-rose-900 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-rose-200/80 shadow-md">
                💌 Tap the heart seal to unleash the love notes!
              </span>
            </div>
          )}
        </div>

        {/* Modal for adding custom note */}
        <AnimatePresence>
          {isAddingNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-rose-950/40 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 relative"
              >
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-rose-400 hover:text-rose-900 hover:bg-rose-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="font-serif-display text-2xl font-bold text-rose-950 mb-1">
                  Write a Special Note
                </h3>
                <p className="text-xs text-rose-700/80 mb-4">
                  Add a new surprise card for {bestieName} to drag and flip.
                </p>

                <form onSubmit={handleCreateNote} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-rose-900 mb-1">
                      Note Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., That One Time In New York..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-rose-900 mb-1">
                      Front Teaser
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Flip to see why I couldn't stop laughing..."
                      value={newFront}
                      onChange={(e) => setNewFront(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-rose-900 mb-1">
                      Heartfelt Message
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Write your secret wish or favorite inside joke..."
                      value={newBack}
                      onChange={(e) => setNewBack(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none font-handwriting text-lg"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-full"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-sm"
                    >
                      Add to Envelope
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
