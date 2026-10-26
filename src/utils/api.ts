// Online Shared Data API Client for Sakshi's Birthday Celebration
// Allows Subho to upload photos/letters that are instantly visible to Sakshi and friends online!

export interface SharedPhoto {
  id: number;
  url: string;
  caption: string;
  date: string;
  location: string;
  category: string;
  uploadedBy: string;
}

export interface SharedLetter {
  id: number;
  name: string;
  title: string;
  msg: string;
  theme: string;
  createdAt?: string;
}

export interface SharedWish {
  id: number;
  name: string;
  message: string;
  emoji: string;
  time: string;
}

export interface SharedBirthdayData {
  avatar: string;
  bestieName: string;
  nickname: string;
  senderName: string;
  birthDate: string;
  targetDateTime: string;
  photos: SharedPhoto[];
  letters: SharedLetter[];
  wishes: SharedWish[];
}

export const api = {
  // Fetch shared data from server
  async getSharedData(): Promise<SharedBirthdayData | null> {
    try {
      const res = await fetch('/api/shared-data');
      if (!res.ok) throw new Error('Failed to fetch shared data');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Could not fetch online shared data, falling back to local storage', err);
      return null;
    }
  },

  // Update Sakshi's shared avatar
  async updateAvatar(avatar: string): Promise<boolean> {
    try {
      const res = await fetch('/api/shared-data/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar }),
      });
      return res.ok;
    } catch (err) {
      console.error('Error updating avatar online', err);
      return false;
    }
  },

  // Upload/Add photo to online scrapbook
  async uploadPhoto(photo: Omit<SharedPhoto, 'id'>): Promise<SharedPhoto | null> {
    try {
      const res = await fetch('/api/shared-data/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photo),
      });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      return json.photo;
    } catch (err) {
      console.error('Error uploading photo online', err);
      return null;
    }
  },

  // Delete photo from online scrapbook
  async deletePhoto(id: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/shared-data/photo/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.error('Error deleting photo online', err);
      return false;
    }
  },

  // Add love letter to online envelope
  async addLetter(letter: Omit<SharedLetter, 'id'>): Promise<SharedLetter | null> {
    try {
      const res = await fetch('/api/shared-data/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(letter),
      });
      if (!res.ok) throw new Error('Letter save failed');
      const json = await res.json();
      return json.letter;
    } catch (err) {
      console.error('Error saving letter online', err);
      return null;
    }
  },

  // Delete letter
  async deleteLetter(id: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/shared-data/letter/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.error('Error deleting letter online', err);
      return false;
    }
  },

  // Add guestbook wish
  async addWish(wish: Omit<SharedWish, 'id' | 'time'>): Promise<SharedWish | null> {
    try {
      const res = await fetch('/api/shared-data/wish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wish),
      });
      if (!res.ok) throw new Error('Wish save failed');
      const json = await res.json();
      return json.wish;
    } catch (err) {
      console.error('Error saving wish online', err);
      return null;
    }
  },
};
