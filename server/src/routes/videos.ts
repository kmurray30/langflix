import { Router } from 'express';
import { getSubtitles } from 'youtube-caption-extractor';
import { decks, videos } from '../data/mockData';
import { Subtitle } from '../types';

const router = Router();

// Helper function to extract YouTube video ID from various URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Helper function to fetch subtitles from YouTube
async function fetchSubtitles(videoUrl: string): Promise<Subtitle[]> {
  const videoId = extractVideoId(videoUrl);
  
  if (!videoId) {
    console.warn('Could not extract video ID from URL:', videoUrl);
    return [];
  }
  
  try {
    const captions = await getSubtitles({ videoID: videoId, lang: 'en' });
    
    if (!captions || captions.length === 0) {
      console.warn('No captions available for video:', videoId);
      return [];
    }
    
    // Transform to our Subtitle format
    const subtitles: Subtitle[] = captions.map((caption: any) => ({
      startTime: parseFloat(caption.start),
      endTime: parseFloat(caption.start) + parseFloat(caption.dur),
      text: caption.text
    }));
    
    return subtitles;
  } catch (error) {
    console.error('Error fetching subtitles for video:', videoId, error);
    return [];
  }
}

// GET /api/videos - List all videos with thumbnails
router.get('/', (req, res) => {
  res.json(videos);
});

// GET /api/videos/:id - Get single video with its deck and subtitles
router.get('/:id', async (req, res) => {
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }
  
  const deck = decks.find(d => d.id === video.deckId);
  
  // Fetch subtitles from YouTube (no more mock data)
  const subtitles = await fetchSubtitles(video.videoUrl);
  
  res.json({
    ...video,
    deck,
    subtitles
  });
});

export default router;

