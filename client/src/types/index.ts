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

export interface VideoWithDeck extends Video {
  deck?: Deck;
  subtitles?: Subtitle[];
}

