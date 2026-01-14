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
      { english: 'coffee', spanish: 'café' },
      { english: 'table', spanish: 'mesa' },
      { english: 'chair', spanish: 'silla' },
      { english: 'menu', spanish: 'menú' },
      { english: 'water', spanish: 'agua' }
    ]
  },
  {
    id: 'deck-2',
    name: 'Market Vocabulary',
    words: [
      { english: 'apple', spanish: 'manzana' },
      { english: 'orange', spanish: 'naranja' },
      { english: 'price', spanish: 'precio' },
      { english: 'money', spanish: 'dinero' },
      { english: 'bag', spanish: 'bolsa' }
    ]
  },
  {
    id: 'deck-3',
    name: 'Story Vocabulary - El Mono Rojo',
    words: [
      { english: 'once upon a time', spanish: 'había una vez' },
      { english: 'monkey', spanish: 'mono' },
      { english: 'red', spanish: 'rojo' },
      { english: 'to bathe', spanish: 'bañarse' },
      { english: 'teeth', spanish: 'dientes' },
      { english: 'to clean', spanish: 'limpiar' },
      { english: 'sorry', spanish: 'lo siento' }
    ]
  }
];

