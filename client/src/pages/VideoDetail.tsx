import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { VideoWithDeck } from '../types';
import './VideoDetail.css';

function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoWithDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingDeck, setAddingDeck] = useState(false);

  useEffect(() => {
    if (id) {
      loadVideo(id);
    }
  }, [id]);

  const loadVideo = async (videoId: string) => {
    try {
      setLoading(true);
      const fetchedVideo = await api.getVideo(videoId);
      setVideo(fetchedVideo);
    } catch (err) {
      setError('Failed to load video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeck = async () => {
    if (!video?.deck) return;

    try {
      setAddingDeck(true);
      await api.addDeckToVocab(video.deck.id);
      // Navigate to flashcard page after adding
      navigate(`/flashcards/${video.deck.id}`);
    } catch (err) {
      console.error('Failed to add deck:', err);
      alert('Failed to add deck to vocab');
    } finally {
      setAddingDeck(false);
    }
  };

  if (loading) {
    return (
      <div className="video-detail">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="message">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="video-detail">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="message error">{error || 'Video not found'}</div>
      </div>
    );
  }

  return (
    <div className="video-detail">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back
      </button>

      <div className="video-container">
        <h1 className="video-title">{video.title}</h1>
        <div className="video-player">
          <iframe
            src={video.videoUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {video.deck && (
        <div className="deck-section">
          <h2>Vocabulary Deck</h2>
          <div className="deck-info">
            <div className="deck-header">
              <h3>{video.deck.name}</h3>
              <p className="word-count">{video.deck.words.length} words</p>
            </div>
            <button
              className="add-deck-button"
              onClick={handleAddDeck}
              disabled={addingDeck}
            >
              {addingDeck ? 'Adding...' : 'Add to My Vocab & Practice'}
            </button>
          </div>
          <div className="word-preview">
            {video.deck.words.slice(0, 3).map((word, index) => (
              <div key={index} className="word-preview-item">
                <span className="english">{word.english}</span>
                <span className="separator">→</span>
                <span className="spanish">{word.spanish}</span>
              </div>
            ))}
            {video.deck.words.length > 3 && (
              <p className="more-words">
                +{video.deck.words.length - 3} more words
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoDetail;

