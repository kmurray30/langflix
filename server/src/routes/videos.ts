import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
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

// Helper function to slugify a title for filename
function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .trim();
}

// Helper function to fetch subtitles from YouTube
async function fetchSubtitles(videoUrl: string, appVideoId: string, videoTitle: string): Promise<Subtitle[]> {
  const youtubeId = extractVideoId(videoUrl);
  
  if (!youtubeId) {
    console.warn('Could not extract YouTube video ID from URL:', videoUrl);
    return [];
  }
  
  // Generate new filename format: {appVideoId}-{slugified-title}.json
  const slugifiedTitle = slugifyTitle(videoTitle);
  const newFilename = `${appVideoId}-${slugifiedTitle}.json`;
  const subtitlesDir = path.join(process.cwd(), 'server/data/subtitles');
  
  // Try new format first
  const newCacheFile = path.join(subtitlesDir, newFilename);
  
  // Try old format as fallback (YouTube ID only)
  const oldCacheFile = path.join(subtitlesDir, `${youtubeId}.json`);
  
  // Check for cached subtitles (new format first, then old format)
  if (fs.existsSync(newCacheFile)) {
    try {
      console.log('✓ Loading cached subtitles (new format):', newFilename);
      const cachedData = fs.readFileSync(newCacheFile, 'utf-8');
      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error reading cached subtitles (new format), will try old format:', error);
    }
  }
  
  // Try old format as fallback
  if (fs.existsSync(oldCacheFile)) {
    try {
      console.log('✓ Loading cached subtitles (old format):', youtubeId);
      const cachedData = fs.readFileSync(oldCacheFile, 'utf-8');
      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error reading cached subtitles, fetching fresh:', error);
      // Continue to fetch from YouTube if cache read fails
    }
  }
  
  // Fetch from YouTube if no cache exists or cache read failed
  try {
    console.log('→ Fetching subtitles from YouTube for:', youtubeId);
    const captions = await getSubtitles({ videoID: youtubeId, lang: 'en' });
    
    if (!captions || captions.length === 0) {
      console.warn('No captions available for video:', youtubeId);
      return [];
    }
    
    // Transform to our Subtitle format
    const subtitles: Subtitle[] = captions.map((caption: any) => ({
      startTime: parseFloat(caption.start),
      endTime: parseFloat(caption.start) + parseFloat(caption.dur),
      text: caption.text
    }));
    
    // Save to cache using new filename format
    try {
      fs.writeFileSync(newCacheFile, JSON.stringify(subtitles, null, 2), 'utf-8');
      console.log('✓ Cached subtitles:', newFilename);
    } catch (writeError) {
      console.error('Warning: Could not cache subtitles:', writeError);
      // Non-fatal, continue with fetched subtitles
    }
    
    return subtitles;
  } catch (error) {
    console.error('Error fetching subtitles for video:', youtubeId, error);
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
  
  // Fetch subtitles from YouTube (passing video ID and title for new filename format)
  const subtitles = await fetchSubtitles(video.videoUrl, video.id, video.title);
  
  res.json({
    ...video,
    deck,
    subtitles
  });
});

export default router;

