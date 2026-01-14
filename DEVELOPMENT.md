# Development Guide

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start development servers
npm run dev
```

Visit http://localhost:5173 to see the app.

## Development Workflow

### Making Changes

**Frontend (React):**
- Files in `client/src/`
- Hot reload enabled - changes reflect immediately
- API calls go through Vite proxy to backend

**Backend (Express):**
- Files in `server/src/`
- Auto-restart on file changes via tsx watch
- Session data stored in memory

### Project Layout

```
client/src/
├── api/              # API client functions
├── components/       # Reusable React components
│   ├── VideosTab.tsx
│   └── VocabTab.tsx
├── pages/            # Route pages
│   ├── Home.tsx
│   ├── VideoDetail.tsx
│   └── FlashcardQuiz.tsx
├── types/            # TypeScript interfaces
├── App.tsx           # Router setup
├── main.tsx          # React entry point
└── index.css         # Global styles

server/src/
├── routes/           # API endpoints
│   ├── videos.ts
│   ├── vocab.ts
│   └── decks.ts
├── data/             # Mock data
│   └── mockData.ts
├── types/            # TypeScript interfaces
└── index.ts          # Express app setup
```

## Adding Features

### Adding a New Video

Edit `server/src/data/mockData.ts`:

```typescript
export const videos: Video[] = [
  // ... existing videos
  {
    id: 'video-3',
    title: 'Your New Video',
    thumbnailUrl: 'https://placehold.co/320x180/color/ffffff?text=Title',
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
    deckId: 'deck-3'
  }
];
```

### Adding a New Deck

Edit `server/src/data/mockData.ts`:

```typescript
export const decks: Deck[] = [
  // ... existing decks
  {
    id: 'deck-3',
    name: 'Your Deck Name',
    words: [
      { english: 'hello', spanish: 'hola' },
      { english: 'goodbye', spanish: 'adiós' },
      // ... more words
    ]
  }
];
```

### Adding a New API Endpoint

1. Create route in `server/src/routes/`
2. Register in `server/src/index.ts`
3. Add API function in `client/src/api/index.ts`
4. Use in components

## Debugging

### Backend

- Check terminal running `npm run dev:server`
- Add `console.log()` statements
- Session data: `req.session`

### Frontend

- Open browser DevTools (F12)
- Check Console for errors
- Network tab shows API calls
- React DevTools extension recommended

### Common Issues

**"Cannot connect to server"**
- Ensure backend is running on port 3001
- Check `server/src/index.ts` PORT setting

**"Session not persisting"**
- Sessions reset when server restarts (in-memory storage)
- Clear cookies and try again

**"Video not loading"**
- Videos are placeholders
- Replace URLs in mockData.ts with real content

## Testing the App

1. **Home page**: Should show two tabs
2. **Videos tab**: Should show 2 video thumbnails
3. **Click video**: Should navigate to video detail page
4. **Add deck**: Should save and navigate to flashcards
5. **Vocab tab**: Should now show the saved deck
6. **Flashcards**: 
   - Type Spanish translations
   - Try with/without accents (both work)
   - See score at the end
   - Restart should reset quiz

## Port Configuration

| Service | Port | Config File |
|---------|------|-------------|
| Frontend | 5173 | `client/vite.config.ts` |
| Backend | 3001 | `server/src/index.ts` |

Change ports by editing these files.

## Build for Production

```bash
# Build both client and server
npm run build

# Outputs:
# - client/dist/     (static files)
# - server/dist/     (compiled JS)
```

To deploy:
1. Serve `client/dist/` with any static host (Vercel, Netlify, etc.)
2. Run `server/dist/index.js` on a Node server
3. Update CORS settings in `server/src/index.ts` for production domain
4. Set `cookie.secure: true` for HTTPS

## Next Steps

- Replace placeholder videos with real content
- Add more vocabulary decks
- Implement user authentication
- Add database for persistent storage
- Deploy to production

