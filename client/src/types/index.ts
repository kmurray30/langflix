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
}

export interface Word {
  english: string;
  spanish: string;
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

