import { Route, Routes } from 'react-router-dom';
import FlashcardQuiz from './pages/FlashcardQuiz';
import Home from './pages/Home';
import VideoDetail from './pages/VideoDetail';

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

