import { useEffect, useState } from 'react';
import { api } from '../api';
import { Deck, Word } from '../types';
import './FlashcardWidget.css';

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

interface AnswerResult {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
}

interface FlashcardWidgetProps {
  deckId: string;
  onClose?: () => void;
}

function FlashcardWidget({ deckId, onClose }: FlashcardWidgetProps) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [quizState, setQuizState] = useState<QuizState>('quiz');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [currentAnswerResult, setCurrentAnswerResult] = useState<AnswerResult | null>(null);

  useEffect(() => {
    if (deckId) {
      loadDeck(deckId);
    }
  }, [deckId]);

  // Handle Enter key press when feedback is showing
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showingFeedback && event.key === 'Enter') {
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showingFeedback, currentIndex, deck]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!deck || !userInput.trim()) return;

    const currentWord = deck.words[currentIndex];
    const normalizedUserAnswer = normalizeString(userInput);
    // Check if user answer matches ANY of the acceptable Spanish translations
    const isCorrect = currentWord.spanish.some(spanishVariant => 
      normalizeString(spanishVariant) === normalizedUserAnswer
    );

    // Record the answer
    const newAnswer: Answer = {
      word: currentWord,
      userAnswer: userInput,
      isCorrect,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // Update word progress on backend
    try {
      await api.updateWordProgress(deckId, currentWord.spanish[0], isCorrect);
    } catch (err) {
      console.error('Failed to update word progress:', err);
      // Continue with quiz even if progress update fails
    }

    // Show feedback instead of immediately advancing
    setCurrentAnswerResult({
      isCorrect,
      userAnswer: userInput,
      correctAnswer: currentWord.spanish[0],
    });
    setShowingFeedback(true);
  };

  const handleContinue = () => {
    // Clear feedback state
    setShowingFeedback(false);
    setCurrentAnswerResult(null);
    
    // Advance to next question or complete quiz
    if (!deck) return;
    
    if (currentIndex < deck.words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
    } else {
      setQuizState('complete');
    }
  };

  const handleRestart = async () => {
    // Reload deck from server to get updated word list (excluding newly learned words)
    await loadDeck(deckId);
    
    setQuizState('quiz');
    setCurrentIndex(0);
    setUserInput('');
    setAnswers([]);
  };

  if (loading) {
    return (
      <div className="flashcard-widget">
        {onClose && (
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
        <div className="message">Loading deck...</div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="flashcard-widget">
        {onClose && (
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
        <div className="message error">{error || 'Deck not found'}</div>
      </div>
    );
  }

  // Check if all words are learned (no words left to practice)
  if (deck.words.length === 0) {
    return (
      <div className="flashcard-widget">
        {onClose && (
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
        <div className="message">
          Congratulations! You've learned all the words in this deck!
        </div>
      </div>
    );
  }

  if (quizState === 'complete') {
    const correctCount = answers.filter(answer => answer.isCorrect).length;
    const totalCount = answers.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    return (
      <div className="flashcard-widget">
        {onClose && (
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}

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
                      Correct answer: <span>{answer.word.spanish[0]}</span>
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
    <div className="flashcard-widget">
      {onClose && (
        <button className="close-button" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}

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

          {!showingFeedback ? (
            <form onSubmit={handleSubmit} className="answer-form">
              <div className="input-group">
                <label htmlFor="answer-input">Type the Spanish translation:</label>
                <input
                  id="answer-input"
                  type="text"
                  value={userInput}
                  onChange={(event) => setUserInput(event.target.value)}
                  placeholder="Type your answer..."
                  autoFocus
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="submit-button">
                Submit
              </button>
            </form>
          ) : (
            <div className={`feedback-card ${currentAnswerResult?.isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
              <div className="feedback-indicator">
                {currentAnswerResult?.isCorrect ? '✓' : '✗'}
              </div>
              <div className="feedback-message">
                {currentAnswerResult?.isCorrect ? 'Correct!' : 'Incorrect'}
              </div>
              <div className="feedback-details">
                <div className="feedback-user-answer">
                  You answered: <span>{currentAnswerResult?.userAnswer}</span>
                </div>
                <div className="feedback-correct-answer">
                  Correct answer: <span>{currentAnswerResult?.correctAnswer}</span>
                </div>
              </div>
              <button onClick={handleContinue} className="continue-button" autoFocus>
                {currentIndex < deck.words.length - 1 ? 'Continue' : 'Finish'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlashcardWidget;
