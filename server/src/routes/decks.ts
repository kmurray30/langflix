import { Router } from 'express';
import { decks } from '../data/mockData';

const router = Router();

// GET /api/decks/:id - Get deck words for flashcard quiz
router.get('/:id', (req, res) => {
  const deck = decks.find(d => d.id === req.params.id);
  
  if (!deck) {
    return res.status(404).json({ error: 'Deck not found' });
  }
  
  res.json(deck);
});

export default router;

