# Langflix

A language learning platform that combines video content with interactive vocabulary flashcards. Watch Spanish learning videos and practice vocabulary through typing-based quizzes.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router
- **Backend**: Express, TypeScript, express-session
- **Storage**: In-memory session storage (data persists while server is running)

## Features

- 📹 **Video Library**: Browse Spanish learning videos with thumbnails
- 📝 **Vocabulary Decks**: Each video comes with a curated vocabulary deck
- 🎯 **Flashcard Quiz**: Type-based quiz with accent-insensitive checking
- 📊 **Score Tracking**: See your results and review incorrect answers
- 💾 **Session Persistence**: Your saved decks persist during your session

## Project Structure

```
langflix/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── package.json     # Root package with convenience scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

Install dependencies for both client and server:

```bash
npm run install:all
```

Or manually:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### Development

Run both client and server concurrently:

```bash
npm run dev
```

This will start:
- Frontend dev server on http://localhost:5173
- Backend API server on http://localhost:3001

Or run them separately:

```bash
# Terminal 1 - Server
npm run dev:server

# Terminal 2 - Client
npm run dev:client
```

### Production Build

```bash
npm run build
```

## How to Use

1. **Browse Videos**: Start on the Videos tab to see available Spanish learning videos
2. **Watch & Learn**: Click a video thumbnail to view it and see its vocabulary deck
3. **Add to Vocab**: Click "Add to My Vocab & Practice" to save the deck and start practicing
4. **Practice Flashcards**: Type the Spanish translation for each English word
5. **Review Results**: See your score and review any mistakes at the end

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | List all videos |
| GET | `/api/videos/:id` | Get video with deck |
| GET | `/api/vocab` | Get user's saved decks |
| POST | `/api/vocab/:deckId` | Add deck to vocab |
| GET | `/api/decks/:id` | Get deck for quiz |

## Features in Detail

### Accent-Insensitive Checking

The flashcard quiz normalizes both user input and correct answers using Unicode NFD normalization, removing accent marks for comparison. This means:
- "café" matches "cafe"
- "español" matches "espanol"

### Session Management

- Uses express-session with cookies
- Data persists while server is running
- Each user gets their own session automatically
- No login required

## Future Enhancements

- Real video content integration (YouTube API, local hosting)
- More language support
- Spaced repetition algorithm
- User accounts and progress tracking
- Audio pronunciation
- More deck types (multiple choice, listening comprehension)

## License

MIT
