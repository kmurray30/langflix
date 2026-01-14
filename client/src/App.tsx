import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VideoDetail from './pages/VideoDetail';
import FlashcardQuiz from './pages/FlashcardQuiz';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/video/:id" element={<VideoDetail />} />
      <Route path="/flashcards/:deckId" element={<FlashcardQuiz />} />
    </Routes>
  );
}

export default App;

