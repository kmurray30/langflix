import { Router } from 'express';
import { decks, videos } from '../data/mockData';
import { loadTranslations } from '../utils/translations';

const router = Router();

// GET /api/decks/:id - Get deck words for flashcard quiz
router.get('/:id', (req, res) => {
  // Find which video uses this deck
  const video = videos.find(v => v.deckId === req.params.id);
  
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
    deck = decks.find(d => d.id === req.params.id);
  }
  
  if (!deck) {
    return res.status(404).json({ error: 'Deck not found' });
  }
  
  res.json(deck);
});

export default router;

