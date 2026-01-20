import { Router } from 'express';
import { decks, videos } from '../data/mockData';
import { loadTranslations } from '../utils/translations';
import { calculateDeckStats, updateWordConfidence, resetDeckProgress } from '../utils/userProgress';

const router = Router();

// GET /api/vocab - Get user's saved decks with progress stats
router.get('/', (req, res) => {
  const userId = req.sessionID;
  const savedDeckIds = req.session.savedDeckIds || [];
  const savedDecks = decks.filter(deck => savedDeckIds.includes(deck.id));
  
  // Add progress stats to each deck
  const decksWithProgress = savedDecks.map(deck => {
    // For video-3, load words from translation file to get accurate count
    let totalWords = deck.words.length;
    if (deck.id === 'deck-3') {
      const video = videos.find(videoItem => videoItem.deckId === deck.id);
      if (video) {
        const words = loadTranslations(video.id, video.title);
        if (words) {
          totalWords = words.length;
        }
      }
    }
    
    const stats = calculateDeckStats(userId, deck.id, totalWords);
    
    return {
      ...deck,
      learnedCount: stats.learnedCount,
      totalCount: stats.totalCount,
      percentLearned: stats.percentLearned
    };
  });
  
  res.json(decksWithProgress);
});

// POST /api/vocab/:deckId - Add deck to user's vocab
router.post('/:deckId', (req, res) => {
  const { deckId } = req.params;
  
  // Check if deck exists
  const deck = decks.find(deckItem => deckItem.id === deckId);
  if (!deck) {
    return res.status(404).json({ error: 'Deck not found' });
  }
  
  // Initialize savedDeckIds if not exists
  if (!req.session.savedDeckIds) {
    req.session.savedDeckIds = [];
  }
  
  // Add deck if not already saved
  if (!req.session.savedDeckIds.includes(deckId)) {
    req.session.savedDeckIds.push(deckId);
  }
  
  res.json({ 
    success: true, 
    deck,
    savedDeckIds: req.session.savedDeckIds 
  });
});

// POST /api/vocab/:deckId/progress - Update word confidence after quiz answer
router.post('/:deckId/progress', (req, res) => {
  const userId = req.sessionID;
  const { deckId } = req.params;
  const { spanish, wasCorrect } = req.body;
  
  if (!spanish || typeof wasCorrect !== 'boolean') {
    return res.status(400).json({ error: 'Missing required fields: spanish, wasCorrect' });
  }
  
  try {
    updateWordConfidence(userId, deckId, spanish, wasCorrect);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating word confidence:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// DELETE /api/vocab/:deckId/progress - Reset deck progress
router.delete('/:deckId/progress', (req, res) => {
  const userId = req.sessionID;
  const { deckId } = req.params;
  
  try {
    resetDeckProgress(userId, deckId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting deck progress:', error);
    res.status(500).json({ error: 'Failed to reset progress' });
  }
});

export default router;

