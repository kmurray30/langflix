import * as fs from 'fs';
import * as path from 'path';
import { getSubtitles } from 'youtube-caption-extractor';

interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
}

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

// Main function to fetch and cache subtitles
async function fetchSubtitles(videoUrl: string, videoId: string, videoTitle: string): Promise<void> {
  const youtubeId = extractVideoId(videoUrl);
  
  if (!youtubeId) {
    console.error('❌ Could not extract YouTube video ID from URL:', videoUrl);
    process.exit(1);
  }
  
  // Generate filename using the new format
  const slugifiedTitle = slugifyTitle(videoTitle);
  const filename = `${videoId}-${slugifiedTitle}.json`;
  const subtitlesDir = path.join(process.cwd(), 'server/data/subtitles');
  const cacheFile = path.join(subtitlesDir, filename);
  
  // Check if subtitles already exist
  if (fs.existsSync(cacheFile)) {
    console.log('✓ Subtitles already exist:', filename);
    console.log('  To re-fetch, delete the file first.');
    return;
  }
  
  // Fetch from YouTube
  try {
    console.log('→ Fetching subtitles from YouTube for:', youtubeId);
    const captions = await getSubtitles({ videoID: youtubeId, lang: 'en' });
    
    if (!captions || captions.length === 0) {
      console.warn('⚠️  No captions available for video:', youtubeId);
      return;
    }
    
    // Transform to our Subtitle format
    const subtitles: Subtitle[] = captions.map((caption: any) => ({
      startTime: parseFloat(caption.start),
      endTime: parseFloat(caption.start) + parseFloat(caption.dur),
      text: caption.text
    }));
    
    // Ensure directory exists
    if (!fs.existsSync(subtitlesDir)) {
      fs.mkdirSync(subtitlesDir, { recursive: true });
    }
    
    // Save to cache
    fs.writeFileSync(cacheFile, JSON.stringify(subtitles, null, 2), 'utf-8');
    console.log('✓ Successfully cached subtitles:', filename);
    console.log(`  Total segments: ${subtitles.length}`);
  } catch (error) {
    console.error('❌ Error fetching subtitles for video:', youtubeId, error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.error('Usage: npm run fetch-subtitles <videoUrl> <videoId> <videoTitle>');
  console.error('Example: npm run fetch-subtitles "https://youtube.com/watch?v=abc123" "video-1" "Some Video Title"');
  process.exit(1);
}

const [videoUrl, videoId, videoTitle] = args;

// Run the script
fetchSubtitles(videoUrl, videoId, videoTitle)
  .then(() => {
    console.log('✓ Done!');
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
