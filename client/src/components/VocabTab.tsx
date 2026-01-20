import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Deck } from '../types';
import './VocabTab.css';

function VocabTab() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resettingDeckId, setResettingDeckId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadVocab();
  }, []);

  const loadVocab = async () => {
    try {
      setLoading(true);
      const savedDecks = await api.getVocab();
      setDecks(savedDecks);
    } catch (err) {
      setError('Failed to load vocab');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = async (deckId: string, event: React.MouseEvent) => {
    // Prevent navigation to flashcard quiz
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to reset all progress for this deck?')) {
      return;
    }
    
    try {
      setResettingDeckId(deckId);
      await api.resetDeckProgress(deckId);
      // Reload decks to show updated progress
      await loadVocab();
    } catch (err) {
      console.error('Failed to reset deck progress:', err);
      alert('Failed to reset progress. Please try again.');
    } finally {
      setResettingDeckId(null);
    }
  };

  const handleDeckClick = (deckId: string) => {
    navigate(`/flashcards/${deckId}`);
  };

  if (loading) {
    return <div className="message">Loading vocab...</div>;
  }

  if (error) {
    return <div className="message error">{error}</div>;
  }

  if (decks.length === 0) {
    return (
      <div className="vocab-tab">
        <h2>My Vocabulary Decks</h2>
        <div className="empty-state">
          <p>No decks saved yet.</p>
          <p>Watch videos and add their decks to start learning!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vocab-tab">
      <h2>My Vocabulary Decks</h2>
      <div className="deck-list">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="deck-card"
            onClick={() => handleDeckClick(deck.id)}
          >
            <h3 className="deck-name">{deck.name}</h3>
            <p className="deck-count">{deck.totalCount || deck.words.length} words</p>
            
            {/* Progress bar showing learned percentage */}
            {deck.percentLearned !== undefined && (
              <div className="progress-section">
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${deck.percentLearned}%` }}
                  />
                </div>
                <div className="progress-text">
                  {deck.learnedCount} / {deck.totalCount} learned ({deck.percentLearned}%)
                </div>
              </div>
            )}
            
            {/* Reset progress button */}
            <button
              className="reset-button"
              onClick={(event) => handleResetProgress(deck.id, event)}
              disabled={resettingDeckId === deck.id}
            >
              {resettingDeckId === deck.id ? 'Resetting...' : 'Reset Progress'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VocabTab;

