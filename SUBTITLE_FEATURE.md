# YouTube Subtitle Sync Feature

## Overview
Added synchronized subtitle display below YouTube videos that tracks the video playback in real-time.

## Implementation Details

### Backend Changes

1. **Type Definitions** (`server/src/types/index.ts`)
   - Added `Subtitle` interface with `startTime`, `endTime`, and `text` fields
   - Updated `Video` interface to include optional `subtitles` array

2. **Subtitle Fetching** (`server/src/routes/videos.ts`)
   - Installed `youtubei.js` package for fetching YouTube captions
   - Added `extractVideoId()` helper to parse YouTube URLs
   - Added `fetchSubtitles()` function that:
     - Extracts video ID from URL
     - Uses Innertube API to fetch transcript data
     - Transforms caption segments to our `Subtitle` format
     - Returns empty array if subtitles unavailable
   - Modified GET `/api/videos/:id` to prioritize mock subtitles, with YouTube API as fallback

3. **Mock Data** (`server/src/data/mockData.ts`)
   - Added curated Spanish-English subtitle data for both videos
   - Each video has 10 subtitle segments (Spanish/English alternating every 3 seconds)
   - Subtitles align with vocabulary deck content

### Frontend Changes

1. **Type Definitions** (`client/src/types/index.ts`)
   - Mirrored backend `Subtitle` interface
   - Updated `Video` and `VideoWithDeck` interfaces to include `subtitles`

2. **YouTube IFrame Player API Integration** (`client/src/pages/VideoDetail.tsx`)
   - Replaced basic iframe with YouTube IFrame Player API
   - Dynamically loads YouTube IFrame API script
   - Creates player instance with video ID
   - Implements time polling (250ms interval) when video is playing
   - Tracks current playback time in component state
   - Finds and displays matching subtitle based on current time
   - Cleans up interval and player on unmount

3. **Subtitle Display UI** (`client/src/pages/VideoDetail.css`)
   - Added `.subtitle-window` container with dark background
   - Styled subtitle text to be large, centered, and readable
   - Added visual feedback (border color change) when subtitles are active
   - Smooth transitions between subtitle changes

## How It Works

```
User plays video
    ↓
YouTube IFrame API starts polling getCurrentTime() every 250ms
    ↓
Current time updates in React state
    ↓
useEffect finds subtitle matching current time range
    ↓
Subtitle text displays in window below video
```

## Testing

The mock data includes Spanish-English dialogue subtitles that align with the vocabulary:
- Video 1: Coffee shop conversation with 10 subtitle segments (30 seconds)
- Video 2: Market conversation with 10 subtitle segments (30 seconds)

**Note**: The videos use YouTube placeholder videos. The subtitles are curated Spanish-English dialogue that demonstrates the subtitle sync feature. For production, you'd want to use actual language learning videos that match the subtitle content.

To test:
1. Ensure both servers are running:
   - Backend: `cd server && npm run dev` (http://localhost:3001)
   - Frontend: `cd client && npm run dev` (http://localhost:5173 or 5174)
2. Navigate to the frontend URL
3. Click on "Coffee Shop Conversation" or "At the Market"
4. Play the video
5. Watch subtitles appear in sync below the player (alternates between Spanish and English every 3 seconds)

## Technical Notes

- **Polling Rate**: 250ms provides smooth subtitle updates without excessive API calls
- **Subtitle Matching**: Simple linear search through subtitle array (could be optimized with binary search for very long videos)
- **Error Handling**: Gracefully handles videos without subtitles (displays empty subtitle window)
- **Cleanup**: Properly clears intervals and destroys player on unmount to prevent memory leaks
- **Mock Data**: Currently using curated Spanish-English subtitles for demonstration. The YouTube API fetching (`youtubei.js`) is available as a fallback but may be unreliable due to:
  - Not officially supported by YouTube
  - May break if YouTube changes their internal API
  - Some videos don't have accessible transcripts
- **Production Ready**: For a production language learning app, you'd want to:
  - Use your own videos hosted on a reliable platform
  - Curate and store subtitles in your database
  - Ensure subtitle timing matches the actual video content
  - Add support for multiple languages and translation modes

## Future Enhancements

- Add subtitle caching to avoid refetching on every request
- Support for multiple subtitle languages
- Add subtitle controls (on/off toggle, font size adjustment)
- Optimize subtitle search with binary search for large subtitle arrays
- Add fallback UI for videos without subtitles

