import React, { useState } from 'react';
import { X, Lock, Mail, Eye, EyeOff, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundManager } from '../utils/audio';
import { triggerBirthdayConfetti, triggerGentleSparkle } from '../utils/confetti';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Minor natural delay for smooth interaction feel
    setTimeout(() => {
      const result = login(email, password);
      setIsSubmitting(false);

      if (result.success) {
        soundManager.playSparkle();
        soundManager.playConfettiBurst();
        triggerBirthdayConfetti();
        triggerGentleSparkle();
        setEmail('');
        setPassword('');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        onClose();
      } else {
        setError(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 350);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white/95 backdrop-blur-md rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-200/80 relative text-rose-950 overflow-hidden"
      >
        {/* Soft background ambient glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-pink-200/50 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-rose-400 hover:text-rose-900 hover:bg-rose-50 transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center relative z-10 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif-display font-bold text-2xl text-rose-950">
            Sakshi&apos;s Sign In
          </h2>
          <p className="text-xs text-rose-700/80 mt-1 max-w-xs">
            Sign in with your email and password to unlock all access, your custom music, and celebration features.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="relative z-10 mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-start gap-2 animate-shake">
            <span className="text-rose-600 font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-rose-900 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-2.5 bg-rose-50/50 border border-rose-200 rounded-xl text-sm text-rose-950 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-rose-900 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-2.5 bg-rose-50/50 border border-rose-200 rounded-xl text-sm text-rose-950 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-700 p-1 cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-rose-600/25 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Unlocking Access...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sign In &amp; Unlock All Access</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 text-center relative z-10">
          <span className="text-[11px] text-rose-600/70 inline-flex items-center gap-1">
            <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
            <span>Dedicated to Sakshi (Kaleshi) from Subho</span>
          </span>
        </div>
      </div>
    </div>
  );
};
