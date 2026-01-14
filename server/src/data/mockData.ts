import { Video, Deck } from '../types';

export const videos: Video[] = [
  {
    id: 'video-1',
    title: 'Coffee Shop Conversation',
    thumbnailUrl: 'https://placehold.co/320x180/6366f1/ffffff?text=Coffee+Shop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
    deckId: 'deck-1'
  },
  {
    id: 'video-2',
    title: 'At the Market',
    thumbnailUrl: 'https://placehold.co/320x180/ec4899/ffffff?text=Market',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
    deckId: 'deck-2'
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
  }
];

