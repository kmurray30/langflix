import express from 'express';
import session from 'express-session';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { videos, decks } from './data/mockData';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'langflix-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize session data if not exists
app.use((req, res, next) => {
  if (!req.session.savedDeckIds) {
    req.session.savedDeckIds = [];
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Import routes after app is configured
import videosRouter from './routes/videos';
import vocabRouter from './routes/vocab';
import decksRouter from './routes/decks';

app.use('/api/videos', videosRouter);
app.use('/api/vocab', vocabRouter);
app.use('/api/decks', decksRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

