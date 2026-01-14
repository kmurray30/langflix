import { Router } from 'express';
import { decks } from '../data/mockData';

const router = Router();

// GET /api/vocab - Get user's saved decks
router.get('/', (req, res) => {
  const savedDeckIds = req.session.savedDeckIds || [];
  const savedDecks = decks.filter(deck => savedDeckIds.includes(deck.id));
  
  res.json(savedDecks);
});

// POST /api/vocab/:deckId - Add deck to user's vocab
router.post('/:deckId', (req, res) => {
  const { deckId } = req.params;
  
  // Check if deck exists
  const deck = decks.find(d => d.id === deckId);
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

export default router;

