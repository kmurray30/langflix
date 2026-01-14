import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Deck } from '../types';
import './VocabTab.css';

function VocabTab() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
            onClick={() => navigate(`/flashcards/${deck.id}`)}
          >
            <h3 className="deck-name">{deck.name}</h3>
            <p className="deck-count">{deck.words.length} words</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VocabTab;

