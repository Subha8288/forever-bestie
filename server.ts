import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// High payload limit for photo uploads (base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared persistent data storage
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'birthday_shared.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default data if none exists
const DEFAULT_DATA = {
  avatar: '/assets/aistudio/image_412bf481.png',
  bestieName: 'Sakshi',
  nickname: 'Kaleshi',
  senderName: 'subho',
  birthDate: '27 Oct 2027',
  targetDateTime: '2027-10-27T00:00:00',
  photos: [
    {
      id: 1,
      url: '/assets/aistudio/image_412bf481.png',
      caption: 'Happy Birthday to my favorite Kaleshi! 🎂✨',
      date: '27 Oct 2027',
      location: 'Celebration Day',
      category: 'Portrait',
      uploadedBy: 'Subho',
    },
    {
      id: 2,
      url: '/assets/aistudio/image_412bf481.png',
      caption: 'The most chaotic yet sweetest best friend in the world 💕',
      date: 'Memories of Us',
      location: 'Forever Besties',
      category: 'Friends',
      uploadedBy: 'Subho',
    },
    {
      id: 3,
      url: '/assets/aistudio/image_412bf481.png',
      caption: 'Here is to a lifetime of dramatic rants and laughing till our stomach hurts! 🎉',
      date: 'Late Night Talks',
      location: 'Unfiltered Sakshi',
      category: 'Candid',
      uploadedBy: 'Subho',
    },
  ],
  letters: [
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
  ],
  wishes: [
    {
      id: 1,
      name: 'Subho',
      message: 'Happy Birthday Sakshi! May this year bring you all the happiness, laughter and success you deserve. Always stay as cute and kaleshi as you are! 💖',
      time: 'Just now',
      emoji: '🎂',
    },
  ],
};

function readSharedData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
      return DEFAULT_DATA;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading shared data, using defaults:', err);
    return DEFAULT_DATA;
  }
}

function writeSharedData(data: typeof DEFAULT_DATA) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing shared data:', err);
    return false;
  }
}

// Ensure initial file exists
readSharedData();

// --- API Endpoints for Online Sync ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Get shared birthday data
app.get('/api/shared-data', (req, res) => {
  const data = readSharedData();
  res.json(data);
});

// Update Sakshi's shared avatar
app.post('/api/shared-data/avatar', (req, res) => {
  const { avatar } = req.body;
  if (!avatar) {
    return res.status(400).json({ error: 'Avatar is required' });
  }
  const data = readSharedData();
  data.avatar = avatar;
  writeSharedData(data);
  res.json({ success: true, avatar: data.avatar });
});

// Upload/Add photo to shared scrapbook
app.post('/api/shared-data/photo', (req, res) => {
  const { url, caption, date, location, category, uploadedBy } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Photo URL or data is required' });
  }
  const data = readSharedData();
  const newPhoto = {
    id: Date.now(),
    url,
    caption: caption || 'Special Memory with Sakshi 💕',
    date: date || '27 Oct 2027',
    location: location || 'Celebration',
    category: category || 'Memories',
    uploadedBy: uploadedBy || 'Subho',
  };
  data.photos.unshift(newPhoto);
  writeSharedData(data);
  res.json({ success: true, photo: newPhoto, photos: data.photos });
});

// Delete photo
app.delete('/api/shared-data/photo/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = readSharedData();
  data.photos = data.photos.filter((p: { id: number }) => p.id !== id);
  writeSharedData(data);
  res.json({ success: true, photos: data.photos });
});

// Add love letter
app.post('/api/shared-data/letter', (req, res) => {
  const { name, title, msg, theme } = req.body;
  if (!msg) {
    return res.status(400).json({ error: 'Message content is required' });
  }
  const data = readSharedData();
  const newLetter = {
    id: Date.now(),
    name: name || 'Subho',
    title: title || 'A Special Letter for Sakshi',
    msg,
    theme: theme || 'from-rose-100 to-pink-100 border-rose-300 text-rose-950',
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
  data.letters.unshift(newLetter);
  writeSharedData(data);
  res.json({ success: true, letter: newLetter, letters: data.letters });
});

// Delete love letter
app.delete('/api/shared-data/letter/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = readSharedData();
  data.letters = data.letters.filter((l: { id: number }) => l.id !== id);
  writeSharedData(data);
  res.json({ success: true, letters: data.letters });
});

// Add guestbook birthday wish
app.post('/api/shared-data/wish', (req, res) => {
  const { name, message, emoji } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  const data = readSharedData();
  const newWish = {
    id: Date.now(),
    name: name || 'A Friend',
    message,
    emoji: emoji || '🎉',
    time: 'Just now',
  };
  data.wishes.unshift(newWish);
  writeSharedData(data);
  res.json({ success: true, wish: newWish, wishes: data.wishes });
});

// Vite middleware for dev or static serving for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (dev & API ready)`);
  });
}

startServer();
