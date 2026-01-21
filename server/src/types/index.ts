export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  deckId: string;
  subtitles?: Subtitle[];
}

export interface Deck {
  id: string;
  name: string;
  words: Word[];
  learnedCount?: number; // Number of words with confidence = 100
  totalCount?: number; // Total number of words in deck
  percentLearned?: number; // Percentage of words learned (0-100)
}

export interface Word {
  english: string;
  spanish: string[]; // Array of acceptable Spanish translations (first is primary)
  order: number; // Position in the original deck for sorting
  confidence?: number; // User's confidence score (0-100), only included when fetching with user progress
}

export interface Subtitle {
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
}

export interface UserSession {
  savedDeckIds: string[];
}

// Word progress tracking per user
export interface WordProgress {
  confidence: number; // 0 (unseen) to 100 (learned)
  lastSeen: string; // ISO timestamp
}

// Progress data for a deck (map of spanish word -> progress)
export interface DeckProgressMap {
  [spanishWord: string]: WordProgress;
}

// Progress data for a user (map of deckId -> deck progress)
export interface UserProgressData {
  [deckId: string]: DeckProgressMap;
}

// All user progress data (map of userId -> user progress)
export interface AllUserProgress {
  [userId: string]: UserProgressData;
}

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    savedDeckIds: string[];
    savedVideoIds: string[];
  }
}

