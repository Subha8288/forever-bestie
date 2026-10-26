import confetti from 'canvas-confetti';

// Color palette for romantic rose gold & pink confetti
const ROSE_PALETTE = ['#f43f5e', '#fb7185', '#fda4af', '#fbbf24', '#f59e0b', '#e11d48', '#fbcfe8', '#ffffff'];

export function triggerBirthdayConfetti() {
  // Center explosive burst
  confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.6 },
    colors: ROSE_PALETTE,
    ticks: 300,
    gravity: 0.8,
    scalar: 1.1,
  });

  // Left & right cannons after a slight delay
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ROSE_PALETTE,
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ROSE_PALETTE,
    });
  }, 250);
}

export function triggerHeartShower() {
  // Floating stars and hearts
  const heartShape = confetti.shapeFromPath({
    path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
  });

  confetti({
    shapes: [heartShape],
    scalar: 2.2,
    particleCount: 35,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#f43f5e', '#fb7185', '#e11d48', '#fda4af'],
    ticks: 350,
    gravity: 0.6,
  });
}

export function triggerGentleSparkle(xRatio: number = 0.5, yRatio: number = 0.5) {
  confetti({
    particleCount: 25,
    spread: 45,
    startVelocity: 18,
    origin: { x: xRatio, y: yRatio },
    colors: ['#f43f5e', '#fbbf24', '#ffffff'],
    ticks: 120,
    gravity: 0.7,
    scalar: 0.8,
  });
}
