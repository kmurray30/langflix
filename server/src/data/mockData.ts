import { Deck, Video } from '../types';

export const videos: Video[] = [
  {
    id: 'video-1',
    title: 'Rick Astley - Never Gonna Give You Up',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    deckId: 'deck-1'
  },
  {
    id: 'video-2',
    title: 'TED: The Power of Vulnerability',
    thumbnailUrl: 'https://i.ytimg.com/vi/UyyjU8fzEYU/mqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/UyyjU8fzEYU',
    deckId: 'deck-2'
  },
  {
    id: 'video-3',
    title: 'Spanish Story: El Mono Rojo',
    thumbnailUrl: 'https://i.ytimg.com/vi/WMQW9MgEZws/mqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/WMQW9MgEZws',
    deckId: 'deck-3'
  }
];

export const decks: Deck[] = [
  {
    id: 'deck-1',
    name: 'Coffee Shop Vocabulary',
    words: [
      { english: 'coffee', spanish: ['café'], order: 1 },
      { english: 'table', spanish: ['mesa'], order: 2 },
      { english: 'chair', spanish: ['silla'], order: 3 },
      { english: 'menu', spanish: ['menú'], order: 4 },
      { english: 'water', spanish: ['agua'], order: 5 }
    ]
  },
  {
    id: 'deck-2',
    name: 'Market Vocabulary',
    words: [
      { english: 'apple', spanish: ['manzana'], order: 1 },
      { english: 'orange', spanish: ['naranja'], order: 2 },
      { english: 'price', spanish: ['precio'], order: 3 },
      { english: 'money', spanish: ['dinero'], order: 4 },
      { english: 'bag', spanish: ['bolsa'], order: 5 }
    ]
  },
  {
    id: 'deck-3',
    name: 'Story Vocabulary - El Mono Rojo',
    words: [
      { english: 'once upon a time', spanish: ['había una vez'], order: 1 },
      { english: 'monkey', spanish: ['mono'], order: 2 },
      { english: 'red', spanish: ['rojo'], order: 3 },
      { english: 'to bathe', spanish: ['bañarse'], order: 4 },
      { english: 'teeth', spanish: ['dientes'], order: 5 },
      { english: 'to clean', spanish: ['limpiar'], order: 6 },
      { english: 'sorry', spanish: ['lo siento'], order: 7 }
    ]
  }
];

