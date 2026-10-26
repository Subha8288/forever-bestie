import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, Heart, User, Calendar, MessageCircle } from 'lucide-react';
import { BestieSettings } from '../types';
import { soundManager } from '../utils/audio';

interface PersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BestieSettings;
  onSave: (newSettings: BestieSettings) => void;
}

export const PersonalizationModal: React.FC<PersonalizeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<BestieSettings>({ ...settings });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSparkle();
    onSave(formData);
    onClose();
  };

  const applyPreset = (preset: { name: string; nick: string; greeting: string }) => {
    soundManager.playSparkle();
    setFormData((prev) => ({
      ...prev,
      nickname: preset.nick,
      customGreeting: preset.greeting,
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-rose-950/45 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-200 relative my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full text-rose-400 hover:text-rose-900 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Sparkles className="w-4 h-4 fill-rose-400" />
              </div>
              <h3 className="font-serif-display text-2xl font-bold text-rose-950">
                Personalize the Celebration
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-rose-700/80 mb-6">
              Tailor this entire page with your bestie&apos;s real name, private nicknames, and custom wishes!
            </p>

            {/* Quick Inspiration Presets */}
            <div className="mb-5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800/80 block mb-2">
                Quick Inspiration Archetypes:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      name: formData.bestieName,
                      nick: 'Soul Sister',
                      greeting: 'To the sister of my soul and the holder of all my deepest secrets. Happy Birthday!',
                    })
                  }
                  className="px-3 py-1 text-xs rounded-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 transition-colors cursor-pointer"
                >
                  🌸 Soul Sister
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      name: formData.bestieName,
                      nick: 'Partner in Crime',
                      greeting: 'Here is to another year of causing innocent trouble and laughing until we cannot breathe!',
                    })
                  }
                  className="px-3 py-1 text-xs rounded-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 transition-colors cursor-pointer"
                >
                  ✨ Partner in Crime
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      name: formData.bestieName,
                      nick: 'Sunshine',
                      greeting: 'Thank you for radiating warmth and bringing so much kindness into my life every single day.',
                    })
                  }
                  className="px-3 py-1 text-xs rounded-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 transition-colors cursor-pointer"
                >
                  ☀️ Sunshine
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-rose-500" />
                    <span>Bestie&apos;s Real Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bestieName}
                    onChange={(e) => setFormData({ ...formData, bestieName: e.target.value })}
                    placeholder="e.g. Sania"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Cute Nickname</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="e.g. Bubbles, Queen"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-rose-500" />
                    <span>Your Name (Sender)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    placeholder="e.g. Subhajit"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>Birthday Date</span>
                  </label>
                  <input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    placeholder="e.g. October 26"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Personal Opening Wish Message</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.customGreeting}
                  onChange={(e) => setFormData({ ...formData, customGreeting: e.target.value })}
                  placeholder="Write a custom opening message for the cake banner..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-rose-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-md shadow-rose-600/20 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Celebration Page</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
