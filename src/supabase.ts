import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase-backed media and memory services.
 * Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET?.trim() || 'media';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function getClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file and deployment settings.'
    );
  }
  if (!client) client = createClient(supabaseUrl!, supabaseAnonKey!);
  return client;
}

export interface SupabaseMemory {
  id: string;
  url: string;
  caption: string;
  date: string;
  location?: string;
  category?: string;
  uploadedBy?: string;
  createdAt: string;
  songUrl?: string;
  songTitle?: string;
}

function mapMemoryRow(row: Record<string, unknown>): SupabaseMemory {
  return {
    id: String(row.id ?? ''),
    url: String(row.url ?? ''),
    caption: String(row.caption ?? ''),
    date: String(row.date ?? ''),
    location: row.location ? String(row.location) : '',
    category: row.category ? String(row.category) : '',
    uploadedBy: row.uploaded_by ? String(row.uploaded_by) : 'Subho',
    createdAt: String(row.created_at ?? new Date().toISOString()),
    songUrl: row.song_url ? String(row.song_url) : undefined,
    songTitle: row.song_title ? String(row.song_title) : undefined,
  };
}

/** Upload a real file or data URL to Supabase Storage and return its public URL. */
export async function uploadMedia(
  fileOrDataUrl: File | string,
  folder: 'photos' | 'songs'
): Promise<string> {
  if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:')) {
    // Keep already-hosted URLs and bundled static assets unchanged.
    return fileOrDataUrl;
  }

  const supabase = getClient();
  let blob: Blob;
  let originalName = '';

  if (typeof File !== 'undefined' && fileOrDataUrl instanceof File) {
    blob = fileOrDataUrl;
    originalName = fileOrDataUrl.name;
  } else {
    const dataUrl = fileOrDataUrl as string;
    if (!dataUrl.startsWith('data:')) {
      throw new Error('Upload requires a File or a data URL.');
    }
    const response = await fetch(dataUrl);
    blob = await response.blob();
  }

  const maxBytes = 50 * 1024 * 1024;
  if (blob.size > maxBytes) {
    throw new Error('The selected file is larger than 50 MB. Please choose a smaller file.');
  }

  const detectedType = blob.type.toLowerCase();
  const contentType = detectedType === 'audio/mp3'
    ? 'audio/mpeg'
    : detectedType === 'image/jpg'
      ? 'image/jpeg'
      : detectedType || (folder === 'photos' ? 'image/jpeg' : 'audio/mpeg');
  if (folder === 'photos' && !contentType.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }
  if (folder === 'songs' && !contentType.startsWith('audio/')) {
    throw new Error('Please choose an audio file (such as MP3, WAV, or M4A).');
  }

  const extensionFromName = originalName.includes('.') ? originalName.split('.').pop() : '';
  const extensionFromMime: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'audio/aac': 'aac',
    'audio/flac': 'flac',
  };
  const extension = (extensionFromName || extensionFromMime[contentType] || (folder === 'photos' ? 'jpg' : 'mp3'))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || (folder === 'photos' ? 'jpg' : 'mp3');
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
    cacheControl: '3600',
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Media upload failed: ${error.message}`);

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  if (!data.publicUrl) throw new Error('Supabase did not return a public file URL.');
  return data.publicUrl;
}

/** Initial load + real-time updates for the shared memory gallery. */
export function subscribeToMemories(
  onUpdate: (memories: SupabaseMemory[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!isSupabaseConfigured()) {
    onError?.(new Error('Supabase is not configured yet. Add your URL and publishable/anon key.'));
    return () => undefined;
  }

  const supabase = getClient();
  let stopped = false;
  const refresh = async () => {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!stopped) onUpdate((data ?? []).map((row) => mapMemoryRow(row as Record<string, unknown>)));
  };

  refresh().catch((error: unknown) => {
    if (!stopped) onError?.(error instanceof Error ? error : new Error(String(error)));
  });

  const channel = supabase
    .channel('public:memories-gallery')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, () => {
      refresh().catch((error: unknown) => {
        if (!stopped) onError?.(error instanceof Error ? error : new Error(String(error)));
      });
    })
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        // The gallery still loads initially; enable Realtime for public.memories in Supabase
        // if cross-device live updates are needed.
        console.warn(`Supabase Realtime status: ${status}`);
      }
    });

  return () => {
    stopped = true;
    void supabase.removeChannel(channel);
  };
}

/** Save memory metadata; files should be uploaded first so only URLs enter the table. */
export async function saveMemoryToSupabase(
  memory: Omit<SupabaseMemory, 'id'>,
  customId?: string
): Promise<string> {
  const supabase = getClient();
  const memoryId = customId || `mem-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const url = memory.url.startsWith('data:') ? await uploadMedia(memory.url, 'photos') : memory.url;
  const songUrl = memory.songUrl
    ? (memory.songUrl.startsWith('data:') ? await uploadMedia(memory.songUrl, 'songs') : memory.songUrl)
    : null;

  const { error } = await supabase.from('memories').upsert({
    id: memoryId,
    url,
    caption: memory.caption || '',
    date: memory.date || '',
    location: memory.location || '',
    category: memory.category || '',
    uploaded_by: memory.uploadedBy || 'Subho',
    created_at: memory.createdAt || new Date().toISOString(),
    song_url: songUrl,
    song_title: memory.songTitle || null,
  }, { onConflict: 'id' });

  if (error) throw new Error(`Could not save memory: ${error.message}`);
  return memoryId;
}

export async function deleteMemoryFromSupabase(memoryId: string): Promise<void> {
  const { error } = await getClient().from('memories').delete().eq('id', memoryId);
  if (error) throw new Error(`Could not delete memory: ${error.message}`);
}

export async function saveSharedSetting(key: string, value: unknown): Promise<void> {
  const { error } = await getClient().from('app_settings').upsert({
    id: key,
    value,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) throw new Error(`Could not save shared setting: ${error.message}`);
}

export async function getSharedSetting<T = unknown>(key: string): Promise<T | null> {
  const { data, error } = await getClient().from('app_settings').select('value').eq('id', key).maybeSingle();
  if (error) throw new Error(`Could not load shared setting: ${error.message}`);
  return (data?.value as T | undefined) ?? null;
}


/** Compress images only for preview/transfer convenience; storage is separate from the database. */
export async function compressImageForStorage(
  fileOrDataUrl: File | string,
  maxDimension = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (!width || !height) {
        reject(new Error('The selected image could not be read.'));
        return;
      }
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Your browser could not prepare this image.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('The selected file is not a supported image.'));
    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = () => { img.src = String(reader.result); };
      reader.onerror = () => reject(new Error('Could not read the selected image file.'));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

