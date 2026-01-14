import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { Deck, Word } from '../types';
import './FlashcardQuiz.css';

// Remove accents from a string for comparison
function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

type QuizState = 'quiz' | 'complete';

interface Answer {
  word: Word;
  userAnswer: string;
  isCorrect: boolean;
}

function FlashcardQuiz() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [quizState, setQuizState] = useState<QuizState>('quiz');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (deckId) {
      loadDeck(deckId);
    }
  }, [deckId]);

  const loadDeck = async (id: string) => {
    try {
      setLoading(true);
      const fetchedDeck = await api.getDeck(id);
      setDeck(fetchedDeck);
    } catch (err) {
      setError('Failed to load deck');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!deck || !userInput.trim()) return;

    const currentWord = deck.words[currentIndex];
    const normalizedUserAnswer = normalizeString(userInput);
    const normalizedCorrectAnswer = normalizeString(currentWord.spanish);
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    // Record the answer
    const newAnswer: Answer = {
      word: currentWord,
      userAnswer: userInput,
      isCorrect,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // Move to next word or finish
    if (currentIndex < deck.words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
    } else {
      setQuizState('complete');
    }
  };

  const handleRestart = () => {
    setQuizState('quiz');
    setCurrentIndex(0);
    setUserInput('');
    setAnswers([]);
  };

  if (loading) {
    return (
      <div className="flashcard-quiz">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="message">Loading deck...</div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="flashcard-quiz">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="message error">{error || 'Deck not found'}</div>
      </div>
    );
  }

  if (quizState === 'complete') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalCount = answers.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    return (
      <div className="flashcard-quiz">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>

        <div className="results-container">
          <h1>Quiz Complete!</h1>
          <div className="score-display">
            <div className="score-number">{percentage}%</div>
            <div className="score-text">
              {correctCount} out of {totalCount} correct
            </div>
          </div>

          <div className="answers-review">
            <h2>Review Your Answers</h2>
            {answers.map((answer, index) => (
              <div
                key={index}
                className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="answer-prompt">{answer.word.english}</div>
                <div className="answer-details">
                  <div className="user-answer">
                    You answered: <span>{answer.userAnswer || '(no answer)'}</span>
                  </div>
                  {!answer.isCorrect && (
                    <div className="correct-answer">
                      Correct answer: <span>{answer.word.spanish}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="restart-button" onClick={handleRestart}>
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  const currentWord = deck.words[currentIndex];
  const progress = ((currentIndex + 1) / deck.words.length) * 100;

  return (
    <div className="flashcard-quiz">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back
      </button>

      <div className="quiz-container">
        <div className="quiz-header">
          <h1>{deck.name}</h1>
          <div className="progress-info">
            Question {currentIndex + 1} of {deck.words.length}
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="quiz-card">
          <div className="prompt">
            <span className="prompt-label">English:</span>
            <div className="prompt-word">{currentWord.english}</div>
          </div>

          <form onSubmit={handleSubmit} className="answer-form">
            <div className="input-group">
              <label htmlFor="answer-input">Type the Spanish translation:</label>
              <input
                id="answer-input"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your answer..."
                autoFocus
                autoComplete="off"
              />
            </div>
            <button type="submit" className="submit-button">
              {currentIndex < deck.words.length - 1 ? 'Next' : 'Finish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FlashcardQuiz;

