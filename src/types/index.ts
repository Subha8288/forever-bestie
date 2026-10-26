export interface MemoryPhoto {
  id: string;
  url: string;
  title: string;
  caption: string;
  date?: string;
  rotation?: number;
  songUrl?: string;
  songTitle?: string;
}

export interface BestieSettings {
  bestieName: string;
  nickname: string;
  senderName: string;
  birthDate: string;
  targetDateTime: string; // e.g. '2027-10-27T00:00:00'
  customGreeting: string;
  favoriteSongTitle: string;
  photos?: MemoryPhoto[];
}
