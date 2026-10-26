import React, { useState, useEffect } from 'react';
import {
  Camera,
  Plus,
  X,
  Heart,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  ZoomIn,
  Music,
  Play,
  Square,
  Upload,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { MemoryPhoto } from '../types';
import sakshiPhoto from '../assets/sakshi_photo.png';
import {
  subscribeToMemories,
  saveMemoryToSupabase,
  deleteMemoryFromSupabase,
  compressImageForStorage,
  uploadMedia,
  saveSharedSetting,
} from '../supabase';
import type { SupabaseMemory } from '../supabase';

interface MemoriesGalleryProps {
  bestieName: string;
  nickname: string;
  senderName: string;
}

const DEFAULT_PHOTOS: MemoryPhoto[] = [
  {
    id: 'photo-1',
    url: sakshiPhoto,
    title: 'The Iconic Kaleshi Smile',
    caption: 'That one smile that immediately turns any boring day into pure laughter and chaos.',
    date: 'Forever Favorite',
    rotation: -1.5,
  },
  {
    id: 'photo-2',
    url: sakshiPhoto,
    title: 'Unstoppable Partners In Crime',
    caption: 'Nobody gets our weird humor like we do. Always ready to back each other up.',
    date: 'Core Memory',
    rotation: 1.5,
  },
  {
    id: 'photo-3',
    url: sakshiPhoto,
    title: '3 AM Chaotic Voice Notes',
    caption: 'When 2-minute updates accidentally become 45-minute podcasts full of life drama.',
    date: 'Midnight Files',
    rotation: -1.5,
  },
  {
    id: 'photo-4',
    url: sakshiPhoto,
    title: 'Pure Sunshine & Drama Queen',
    caption: 'You bring so much genuine color, energy, and warmth everywhere you step.',
    date: 'Best Moments',
    rotation: 1.5,
  },
];

export const MemoriesGallery: React.FC<MemoriesGalleryProps> = ({
  bestieName = 'Sakshi',
  nickname = 'Kaleshi',
  senderName = 'Subho',
}) => {
  const [photos, setPhotos] = useState<MemoryPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('sakshi_memories_gallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p) => ({
            ...p,
            url: p.url && !p.url.includes('Screenshot_20261026_124913') ? p.url : sakshiPhoto,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PHOTOS;
  });

  const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSongUrl, setNewSongUrl] = useState('');
  const [newSongTitle, setNewSongTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [isPlayingFavSong, setIsPlayingFavSong] = useState(false);
  const [customSongTitle, setCustomSongTitle] = useState(() => soundManager.customSongTitle);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlayingFavSong(soundManager.getIsMelodyPlaying());
      setCustomSongTitle(soundManager.customSongTitle);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const publicUrl = await uploadMedia(file, 'songs');
      await saveSharedSetting('default_song', { url: publicUrl, title: cleanName });
      soundManager.setCustomSong(publicUrl, cleanName);
      setCustomSongTitle(cleanName);
      soundManager.playSparkle();
      soundManager.playSakshiFavoriteSong(true);
      setIsPlayingFavSong(true);
    } catch (error) {
      console.error('Could not upload song to Supabase:', error);
      window.alert(error instanceof Error ? error.message : 'Song upload failed. Check your Supabase setup.');
    } finally {
      e.target.value = '';
    }
  };

  const handleModalSongUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const publicUrl = await uploadMedia(file, 'songs');
      setNewSongUrl(publicUrl);
      setNewSongTitle(file.name.replace(/\.[^/.]+$/, ''));
      soundManager.playSparkle();
    } catch (error) {
      console.error('Could not upload photo song to Supabase:', error);
      window.alert(error instanceof Error ? error.message : 'Song upload failed.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSinglePhotoSongUpload = async (photoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const publicSongUrl = await uploadMedia(file, 'songs');
      const cleanSongTitle = file.name.replace(/\.[^/.]+$/, '');
      const target = photos.find((p) => p.id === photoId);
      const targetUrl = target?.url || sakshiPhoto;

      setPhotos((prev) => prev.map((p) => (
        p.id === photoId ? { ...p, songUrl: publicSongUrl, songTitle: cleanSongTitle } : p
      )));
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto((current) => current ? { ...current, songUrl: publicSongUrl, songTitle: cleanSongTitle } : null);
      }

      await soundManager.resumeAudioContext();
      soundManager.playPhotoSong(publicSongUrl, cleanSongTitle, true);
      setIsPlayingFavSong(true);

      await saveMemoryToSupabase({
        url: targetUrl,
        caption: target?.title || `Memory of ${bestieName}`,
        date: target?.date || '27 Oct 2027',
        location: target?.caption || 'Special Day',
        category: 'Celebration',
        uploadedBy: senderName || 'Subho',
        createdAt: new Date().toISOString(),
        songUrl: publicSongUrl,
        songTitle: cleanSongTitle,
      }, photoId);
    } catch (error) {
      console.error('Could not save this photo song:', error);
      window.alert(error instanceof Error ? error.message : 'Could not save the song for this photo.');
    } finally {
      e.target.value = '';
    }
  };

  // Play photo's own song when photo is clicked
  const handlePhotoClick = (item: MemoryPhoto) => {
    setSelectedPhoto(item);
    soundManager.resumeAudioContext().then(() => {
      soundManager.playPhotoSong(item.songUrl, item.songTitle || item.title, true, () => {
        setIsPlayingFavSong(false);
      });
      setIsPlayingFavSong(true);
    });
  };

  // Automatically turn off the song when backing out of the photo!
  const closePhotoModal = () => {
    soundManager.stop();
    setIsPlayingFavSong(false);
    setSelectedPhoto(null);
  };

  // Supabase sync for online photo storage
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = subscribeToMemories(
        (sharedMemories: SupabaseMemory[]) => {
          setIsCloudConnected(true);
          if (sharedMemories.length > 0) {
            const mapped: MemoryPhoto[] = sharedMemories.map((m, idx) => ({
              id: m.id,
              url: m.url || sakshiPhoto,
              title: m.caption || `Memory of ${bestieName}`,
              caption: m.location ? `${m.caption} • ${m.location}` : m.caption,
              date: m.date || '27 Oct 2027',
              rotation: (idx % 2 === 0 ? -1.5 : 1.5) * ((idx % 2) + 0.5),
              songUrl: m.songUrl,
              songTitle: m.songTitle,
            }));
            setPhotos(mapped);
            try {
              localStorage.setItem('sakshi_memories_gallery', JSON.stringify(mapped));
            } catch {
              // Ignore
            }
          } else {
            // First-time migration: carry locally saved memories (including Base64 media) into Supabase.
            // This prevents old local-only uploads from being replaced by the four demo photos.
            let localMemories: MemoryPhoto[] = [];
            try {
              const cached = localStorage.getItem('sakshi_memories_gallery');
              const parsed = cached ? JSON.parse(cached) : [];
              if (Array.isArray(parsed)) {
                localMemories = parsed.filter((p) => p && typeof p.url === 'string').map((p) => ({
                  ...p,
                  url: p.url && !p.url.includes('Screenshot_20261026_124913') ? p.url : sakshiPhoto,
                }));
              }
            } catch (error) {
              console.warn('Could not read local memories for migration:', error);
            }
            const memoriesToSeed = localMemories.length ? localMemories : DEFAULT_PHOTOS;
            memoriesToSeed.forEach((photo, idx) => {
              saveMemoryToSupabase(
                {
                  url: photo.url,
                  caption: photo.title || `Memory of ${bestieName}`,
                  date: photo.date || '27 Oct 2027',
                  location: photo.caption || 'Special Day',
                  category: 'Celebration',
                  uploadedBy: senderName || 'Subho',
                  createdAt: new Date(Date.now() - (idx + 1) * 60000).toISOString(),
                  songUrl: photo.songUrl,
                  songTitle: photo.songTitle,
                },
                photo.id || `seed-${idx + 1}`
              ).catch((e) => console.warn('Could not migrate local memory to Supabase', e));
            });
          }
        },
        (err) => {
          console.warn('Supabase memory sync failed:', err);
          setIsCloudConnected(false);
        }
      );
    } catch (e) {
      console.warn('Supabase sync error:', e);
      setIsCloudConnected(false);
    }


    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [bestieName, senderName]);

  useEffect(() => {
    try {
      localStorage.setItem('sakshi_memories_gallery', JSON.stringify(photos));
    } catch {
      // Ignore
    }
  }, [photos]);

  const handleSinglePhotoUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress for a fast preview, then upload the image file to Supabase Storage.
        const compressed = await compressImageForStorage(file, 1200, 0.85);
        const publicImageUrl = await uploadMedia(compressed, 'photos');
        soundManager.playSparkle();

        setPhotos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, url: publicImageUrl } : p))
        );

        // Save the image URL while preserving this memory's title, caption, and attached song.
        const target = photos.find((photo) => photo.id === id);
        await saveMemoryToSupabase(
          {
            url: publicImageUrl,
            caption: target?.title || `Memory of ${bestieName}`,
            date: target?.date || '27 Oct 2027',
            location: target?.caption || 'Celebration Memories',
            category: 'Sakshi',
            uploadedBy: senderName || 'Subho',
            createdAt: new Date().toISOString(),
            songUrl: target?.songUrl,
            songTitle: target?.songTitle,
          },
          id
        );

      } catch (err) {
        console.error('Error uploading photo:', err);
        window.alert(err instanceof Error ? err.message : 'Photo upload failed. Check your Supabase setup.');
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleAddNewPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl) return;

    setIsUploading(true);
    soundManager.playConfettiBurst();

    try {
      // Store media files in Supabase Storage; keep only public URLs in the database.
      const compressed = await compressImageForStorage(newImageUrl, 1200, 0.85);
      const publicImageUrl = await uploadMedia(compressed, 'photos');

      const newEntry: MemoryPhoto = {
        id: `mem-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`,
        url: publicImageUrl,
        title: newTitle || `Special Moment with ${bestieName}`,
        caption: newCaption || `Unforgettable laughter and memories with my favorite ${nickname}.`,
        date: 'Just Added',
        rotation: Math.floor(Math.random() * 6) - 3,
        songUrl: newSongUrl || undefined,
        songTitle: newSongTitle || undefined,
      };

      setPhotos([newEntry, ...photos]);

      // 1. Save metadata to Supabase Database
      await saveMemoryToSupabase({
        url: publicImageUrl,
        caption: newEntry.title,
        date: newEntry.date || 'Just Added',
        location: newEntry.caption || 'Special Day',
        category: 'Celebration',
        uploadedBy: senderName || 'Subho',
        createdAt: new Date().toISOString(),
        songUrl: newSongUrl || undefined,
        songTitle: newSongTitle || undefined,
      }, newEntry.id);

    } catch (err) {
      console.error('Error adding photo to cloud:', err);
      window.alert(err instanceof Error ? err.message : 'Could not save this memory. Check your Supabase setup.');
    } finally {
      setIsUploading(false);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewCaption('');
      setNewImageUrl('');
      setNewSongUrl('');
      setNewSongTitle('');
    }
  };

  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageForStorage(file, 1200, 0.85);
        setNewImageUrl(compressed);
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }
  };

  const handleDeletePhoto = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedPhoto?.id === id) setSelectedPhoto(null);

    // Remove the memory row from Supabase Database
    try {
      await deleteMemoryFromSupabase(id);
    } catch (err) {
      console.warn('Could not delete from Supabase, removing locally:', err);
    }
  };

  return (
    <section id="memories-section" className="py-12 sm:py-20 relative select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-rose-600 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Memories Scrapbook</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-rose-950 tracking-tight">
            Memories of {bestieName}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-rose-800/80 font-light">
            A gallery of photos, laughter, and irreplaceable moments dedicated to {nickname} from {senderName}.
          </p>
          {!isCloudConnected && (
            <p role="status" className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Cloud uploads are not connected yet. Add your Supabase URL/key and run <code>supabase-setup.sql</code> to enable shared photo and song uploads.
            </p>
          )}

          {/* Action Buttons: Add Sakshi's Photo & Upload Default Song */}
          <div className="mt-8 mb-6 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-lg shadow-rose-600/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sakshi&apos;s Photo</span>
            </button>

            {/* Upload Default Favorite Song */}
            <label className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-rose-800 bg-white hover:bg-rose-50 border border-rose-300 rounded-full shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 text-rose-600" />
              <span className="truncate max-w-[160px] sm:max-w-[220px]">
                {customSongTitle ? `Song: ${customSongTitle}` : 'Upload Song (MP3)'}
              </span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioUpload}
              />
            </label>
          </div>
        </div>

        {/* Polaroids Grid with plenty of top clearance so tape never overlaps header buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mt-16 sm:mt-24 pt-8">
          {photos.map((item) => (
            <div
              key={item.id}
              onClick={() => handlePhotoClick(item)}
              style={{ transform: `rotate(${item.rotation || 0}deg)` }}
              className="bg-white p-4 pb-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-rose-100 cursor-pointer relative group flex flex-col justify-between"
            >
              {/* Tape Effect */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-rose-200/60 backdrop-blur-sm -rotate-2 rounded-sm border border-rose-300/40 pointer-events-none" />

              <div>
                {/* Photo Container */}
                <div className="aspect-[4/5] rounded-xl bg-rose-50 overflow-hidden relative border border-rose-100 shadow-inner">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Per-Photo Song Badge if attached */}
                  {item.songTitle && (
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1 z-10 shadow-xs">
                      <Music className="w-3 h-3 text-pink-300" />
                      <span className="truncate max-w-[110px]">{item.songTitle}</span>
                    </div>
                  )}

                  {/* Upload Replacement Photo Overlay Button */}
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-2 right-2 p-2 bg-white/90 hover:bg-white text-rose-800 rounded-full shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 z-20"
                    title="Change this photo"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSinglePhotoUpload(item.id, e)}
                    />
                  </label>

                  {/* Zoom & Favorite Song Indicator */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white pointer-events-none">
                    <span className="p-2.5 rounded-full bg-rose-600 text-white shadow-lg transform group-hover:scale-110 transition-transform">
                      <Music className="w-5 h-5 animate-bounce" />
                    </span>
                    <span className="text-[11px] font-semibold bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      Play Her Favorite Song
                    </span>
                  </div>
                </div>

                {/* Polaroid Caption */}
                <div className="mt-4 px-1">
                  <h3 className="font-serif-display font-bold text-base text-rose-950 truncate">
                    {item.title}
                  </h3>
                  <p className="font-handwriting text-lg text-rose-800/90 leading-tight mt-1 line-clamp-2">
                    {item.caption}
                  </p>
                </div>
              </div>

              {/* Bottom Details & Delete */}
              <div className="mt-3 pt-2 border-t border-rose-100 flex items-center justify-between text-xs text-rose-600/80 px-1">
                <span className="font-medium text-[11px]">{item.date}</span>
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <button
                    onClick={(e) => handleDeletePhoto(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-900 transition-opacity cursor-pointer"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Photo Modal */}
      {selectedPhoto && (
        <div
          onClick={closePhotoModal}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 relative text-rose-950"
          >
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 p-2 rounded-full text-rose-400 hover:text-rose-900 hover:bg-rose-50 transition-colors cursor-pointer z-10"
              title="Close and stop song"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-rose-50 shadow-inner border border-rose-100">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-5 text-center px-2">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  <span>{selectedPhoto.date}</span>
                </span>
                
                {/* Sakshi's Photo Song Player Pill */}
                <button
                  onClick={() => {
                    if (isPlayingFavSong) {
                      soundManager.stop();
                      setIsPlayingFavSong(false);
                    } else {
                      soundManager.resumeAudioContext().then(() => {
                        soundManager.playPhotoSong(selectedPhoto.songUrl, selectedPhoto.songTitle || selectedPhoto.title, true);
                        setIsPlayingFavSong(true);
                      });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-medium shadow-xs hover:shadow transition-all cursor-pointer"
                  title="Toggle Song"
                >
                  <Music className={`w-3.5 h-3.5 ${isPlayingFavSong ? 'animate-spin' : ''}`} />
                  <span className="truncate max-w-[170px]">
                    {isPlayingFavSong
                      ? `Playing: ${selectedPhoto.songTitle || customSongTitle || 'Tum Hi Ho'} (Pause)`
                      : `Play: ${selectedPhoto.songTitle || customSongTitle || 'Tum Hi Ho'} ♪`}
                  </span>
                </button>

                {/* Upload or Change Song for this specific photo */}
                <label
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-medium border border-rose-200 cursor-pointer transition-all shadow-xs"
                  title="Upload a unique song for this photo"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-600" />
                  <span>{selectedPhoto.songTitle ? 'Change Song' : 'Upload Song for Photo'}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => handleSinglePhotoSongUpload(selectedPhoto.id, e)}
                  />
                </label>
              </div>
              <h3 className="font-serif-display text-2xl font-bold text-rose-950">
                {selectedPhoto.title}
              </h3>
              <p className="font-handwriting text-2xl text-rose-800 mt-2 leading-relaxed">
                {selectedPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-200 relative text-rose-950">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-rose-400 hover:text-rose-900 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h3 className="font-serif-display text-xl font-bold text-rose-950">
                Add Sakshi&apos;s Memory Photo
              </h3>
            </div>
            <p className="text-xs text-rose-700/80 mb-5">
              Upload a beautiful photo of Sakshi to permanently save and celebrate your favorite memories together.
            </p>

            <form onSubmit={handleAddNewPhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  Choose Photo File
                </label>
                <div className="border-2 border-dashed border-rose-200 rounded-2xl p-4 text-center hover:border-rose-400 transition-colors cursor-pointer relative bg-rose-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    required={!newImageUrl}
                    onChange={handleModalFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {newImageUrl ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={newImageUrl}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-xl border border-rose-300"
                      />
                      <span className="text-xs text-rose-700 font-medium">Photo Selected ✓</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-rose-700">
                      <Camera className="w-6 h-6 text-rose-500" />
                      <span className="text-xs font-semibold">Tap to select photo from device</span>
                      <span className="text-[10px] text-rose-400">JPG, PNG, WebP supported</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  Photo Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unfiltered Sakshi Laugh..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  Heartfelt Caption
                </label>
                <textarea
                  rows={2}
                  placeholder="Write a sweet or chaotic memory caption..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none font-handwriting text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  Attach Song for This Photo Memory 🎵 (Optional)
                </label>
                <label className="flex items-center gap-2.5 p-3 bg-pink-50/70 hover:bg-pink-100/70 border border-dashed border-rose-300 rounded-2xl cursor-pointer transition-colors text-xs text-rose-900">
                  <Music className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="truncate flex-1 font-medium">
                    {newSongTitle ? `Song Selected: "${newSongTitle}" ✓` : 'Choose MP3 / song file for this photo...'}
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleModalSongUpload}
                  />
                </label>
                <p className="text-[10px] text-rose-600/70 mt-1 px-1">
                  When Sakshi or anyone opens this photo, this song will play and automatically stop when backed out!
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newImageUrl || isUploading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Saving Memory...' : 'Save Memory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
