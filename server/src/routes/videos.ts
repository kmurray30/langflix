import { Router } from 'express';
import { videos, decks } from '../data/mockData';

const router = Router();

// GET /api/videos - List all videos with thumbnails
router.get('/', (req, res) => {
  res.json(videos);
});

// GET /api/videos/:id - Get single video with its deck
router.get('/:id', (req, res) => {
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }
  
  const deck = decks.find(d => d.id === video.deckId);
  
  res.json({
    ...video,
    deck
  });
});

export default router;

