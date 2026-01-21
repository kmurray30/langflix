import { Deck, Video, VideoWithDeck } from '../types';

const API_BASE = '/api';

// Helper to handle fetch with credentials
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Get all videos
  getVideos: () => apiFetch<Video[]>('/videos'),

  // Get single video with deck
  getVideo: (videoId: string) => apiFetch<VideoWithDeck>(`/videos/${videoId}`),

  // Get user's saved videos with progress
  getSavedVideos: () => apiFetch<VideoWithDeck[]>('/videos/saved'),

  // Save video to My Videos
  saveVideo: (videoId: string) =>
    apiFetch<{ success: boolean; video: Video }>(`/videos/${videoId}/save`, {
      method: 'POST',
    }),

  // Remove video from My Videos
  unsaveVideo: (videoId: string) =>
    apiFetch<{ success: boolean }>(`/videos/${videoId}/save`, {
      method: 'DELETE',
    }),

  // Get user's saved vocab decks
  getVocab: () => apiFetch<Deck[]>('/vocab'),

  // Add deck to user's vocab
  addDeckToVocab: (deckId: string) => 
    apiFetch<{ success: boolean; deck: Deck }>(`/vocab/${deckId}`, {
      method: 'POST',
    }),

  // Get deck by ID for flashcard quiz
  getDeck: (deckId: string) => apiFetch<Deck>(`/decks/${deckId}`),

  // Update word progress after quiz answer
  updateWordProgress: (deckId: string, spanish: string, wasCorrect: boolean) =>
    apiFetch<{ success: boolean }>(`/vocab/${deckId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ spanish, wasCorrect }),
    }),

  // Reset deck progress (set all words to confidence 0)
  resetDeckProgress: (deckId: string) =>
    apiFetch<{ success: boolean }>(`/vocab/${deckId}/progress`, {
      method: 'DELETE',
    }),
};

