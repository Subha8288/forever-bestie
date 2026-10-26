import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, BellRing, Lock, Unlock, Calendar, PartyPopper } from 'lucide-react';
import { triggerBirthdayConfetti, triggerHeartShower } from '../utils/confetti';
import { soundManager } from '../utils/audio';

interface CountdownWatchProps {
  bestieName: string;
  nickname: string;
  targetDate?: string;
  onMidnightUnlocked: () => void;
  isUnlocked: boolean;
  setIsUnlocked: (val: boolean) => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPassed: boolean;
}

export const CountdownWatch: React.FC<CountdownWatchProps> = ({
  bestieName = 'Sakshi',
  nickname = 'Kaleshi',
  onMidnightUnlocked,
  isUnlocked,
  setIsUnlocked,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Exact countdown calculation:
  // Today is Oct 26. The next 27 Oct is Oct 27 00:00:00 (less than 24 hours away = exactly 00 Days left!)
  // If date passes Oct 27, it resets for the next cycle.
  const getNext27OctMidnight = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // 27 Oct of current year at midnight 00:00:00
    let target = new Date(currentYear, 9, 27, 0, 0, 0, 0); // Month 9 is October (0-indexed)

    // If today is past Oct 27 23:59:59, reset to next year's Oct 27
    const endOf27Oct = new Date(currentYear, 9, 27, 23, 59, 59, 999);
    if (now.getTime() > endOf27Oct.getTime()) {
      target = new Date(currentYear + 1, 9, 27, 0, 0, 0, 0);
    }
    return target;
  };

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const target = getNext27OctMidnight();
      const difference = target.getTime() - now.getTime();

      // Check if right now is October 27 (Birthday Day!)
      const isBirthdayToday = now.getMonth() === 9 && now.getDate() === 27;

      if (isBirthdayToday || difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
        if (!isUnlocked && !hasCelebrated) {
          triggerMidnight();
        }
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isPassed: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [isUnlocked, hasCelebrated]);

  const triggerMidnight = () => {
    setHasCelebrated(true);
    setIsUnlocked(true);
    soundManager.playConfettiBurst();
    triggerBirthdayConfetti();
    triggerHeartShower();
    setTimeout(() => {
      soundManager.playHappyBirthdayMelody();
    }, 500);
    onMidnightUnlocked();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-6 select-none">
      <div className="relative rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-white/85 border-2 border-rose-300 shadow-2xl shadow-rose-950/20 overflow-hidden">
        {/* Glow ambient background rings */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-rose-400/25 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-amber-300/20 to-rose-300/25 rounded-full blur-3xl pointer-events-none" />

        {/* Header Kicker */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-rose-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
              <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '18s' }} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-extrabold text-rose-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Exact Midnight Watch (27 Oct)</span>
              </div>
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-rose-950 tracking-tight">
                Countdown to 12:00 AM · 27 Oct
              </h3>
            </div>
          </div>

          {/* Quick Simulation / Midnight Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isUnlocked) {
                  setIsUnlocked(false);
                } else {
                  triggerMidnight();
                }
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                isUnlocked
                  ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                  : 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white shadow-md shadow-rose-600/30'
              }`}
            >
              {isUnlocked ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Countdown</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Simulate 12:00 AM Midnight</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Clock Watch Face Display with exact 00 DAYS */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center my-4">
          {/* Days - Exactly 00 Left */}
          <div className="bg-white/90 rounded-2xl p-3 sm:p-5 border border-rose-200/90 shadow-md">
            <span className="font-mono text-3xl sm:text-6xl font-black text-rose-950 block tracking-tight">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700/80 mt-1 block">
              Days Left
            </span>
          </div>

          {/* Hours */}
          <div className="bg-white/90 rounded-2xl p-3 sm:p-5 border border-rose-200/90 shadow-md">
            <span className="font-mono text-3xl sm:text-6xl font-black text-rose-950 block tracking-tight">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700/80 mt-1 block">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div className="bg-white/90 rounded-2xl p-3 sm:p-5 border border-rose-200/90 shadow-md">
            <span className="font-mono text-3xl sm:text-6xl font-black text-rose-950 block tracking-tight">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700/80 mt-1 block">
              Minutes
            </span>
          </div>

          {/* Seconds */}
          <div className="bg-gradient-to-tr from-rose-600 to-pink-500 text-white rounded-2xl p-3 sm:p-5 shadow-xl shadow-rose-600/30 border border-rose-400">
            <span className="font-mono text-3xl sm:text-6xl font-black block tracking-tight animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-100 mt-1 block">
              Seconds
            </span>
          </div>
        </div>

        {/* Dynamic Status Banner */}
        <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border border-rose-200 text-center flex items-center justify-center gap-2">
          {isUnlocked || timeLeft.isPassed ? (
            <div className="inline-flex items-center gap-2 text-rose-950 font-bold text-xs sm:text-sm">
              <PartyPopper className="w-4 h-4 text-rose-600" />
              <span>
                🎉 IT&apos;S 12:00 AM! HAPPY BIRTHDAY SAKSHI ({nickname})! The grand celebration is live!
              </span>
              <PartyPopper className="w-4 h-4 text-rose-600" />
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-rose-900 text-xs sm:text-sm font-semibold">
              <BellRing className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>
                Exact countdown: <span className="underline">00 Days left</span>! Midnight strikes at 12:00 AM on 27 Oct. (Click &quot;Simulate 12:00 AM&quot; above to unlock now!)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
