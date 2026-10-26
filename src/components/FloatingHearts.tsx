import React, { useEffect, useState } from 'react';

interface HeartParticle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}

export const FloatingHearts: React.FC = () => {
  const [particles, setParticles] = useState<HeartParticle[]>([]);

  useEffect(() => {
    const colors = [
      'rgba(244, 63, 94, 0.28)',
      'rgba(251, 113, 133, 0.35)',
      'rgba(244, 114, 182, 0.3)',
      'rgba(253, 164, 175, 0.4)',
      'rgba(251, 191, 36, 0.22)',
    ];

    const initialParticles: HeartParticle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 96 + 2,
      size: Math.random() * 18 + 10,
      duration: Math.random() * 8 + 8,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.5 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles(initialParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft ambient gradient orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-rose-100/60 rounded-full blur-2xl pointer-events-none" />

      {/* Floating upward drifting hearts */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            bottom: '-40px',
            animation: `floatUp ${p.duration}s infinite linear`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
            willChange: 'transform, opacity',
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 24 24"
            fill={p.color}
            className="filter drop-shadow-[0_2px_4px_rgba(244,63,94,0.15)]"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          15% {
            opacity: 0.6;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            transform: translate3d(0, -110vh, 0) rotate(35deg) scale(1.15);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
