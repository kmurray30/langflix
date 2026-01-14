export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  deckId: string;
}

export interface Deck {
  id: string;
  name: string;
  words: Word[];
}

export interface Word {
  english: string;
  spanish: string;
}

export interface UserSession {
  savedDeckIds: string[];
}

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    savedDeckIds: string[];
  }
}

