import { useNavigate, useParams } from 'react-router-dom';
import FlashcardWidget from '../components/FlashcardWidget';
import './FlashcardQuiz.css';

function FlashcardQuiz() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  if (!deckId) {
    return (
      <div className="flashcard-quiz">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="message error">No deck specified</div>
      </div>
    );
  }

  return (
    <div className="flashcard-quiz">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back
      </button>
      <FlashcardWidget deckId={deckId} />
    </div>
  );
}

export default FlashcardQuiz;
