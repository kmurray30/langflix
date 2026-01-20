import { Router } from 'express';
import { decks, videos } from '../data/mockData';
import { loadTranslations } from '../utils/translations';
import { getUserDeckProgress } from '../utils/userProgress';
import { Word } from '../types';

const router = Router();

// GET /api/decks/:id - Get deck words for flashcard quiz
router.get('/:id', (req, res) => {
  const userId = req.sessionID;
  
  // Find which video uses this deck
  const video = videos.find(videoItem => videoItem.deckId === req.params.id);
  
  let deck;
  if (video && video.id === 'video-3') {
    // Load from translation file
    const words = loadTranslations(video.id, video.title);
    if (words) {
      deck = {
        id: req.params.id,
        name: `Story Vocabulary - ${video.title}`,
        words: words
      };
    }
  } else {
    // Use mockData for other decks
    deck = decks.find(deckItem => deckItem.id === req.params.id);
  }
  
  if (!deck) {
    return res.status(404).json({ error: 'Deck not found' });
  }
  
  // Get user's progress for this deck
  const deckProgress = getUserDeckProgress(userId, req.params.id);
  
  // Merge confidence data with words and filter out learned words (conf=100)
  const wordsWithProgress = deck.words
    .map((word: Word) => {
      const spanishKey = word.spanish[0]; // Use first spanish variant as key
      const progress = deckProgress[spanishKey];
      const confidence = progress?.confidence || 0;
      
      return {
        ...word,
        confidence
      };
    })
    .filter((word: Word & { confidence: number }) => word.confidence < 100); // Exclude learned words
  
  // Sort by confidence (ASC), then by order (ASC)
  wordsWithProgress.sort((wordA, wordB) => {
    if (wordA.confidence !== wordB.confidence) {
      return wordA.confidence - wordB.confidence;
    }
    return wordA.order - wordB.order;
  });
  
  res.json({
    ...deck,
    words: wordsWithProgress
  });
});

export default router;

